import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRef } from 'react'

const VERIFY_MAX_ATTEMPTS = 30
const VERIFY_INTERVAL_MS = 3000

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const isCompletedPayment = (data: unknown): boolean => {
  const payload = (data || {}) as Record<string, unknown>
  const nested = (payload.data || {}) as Record<string, unknown>

  const rawStatus = String(
    payload.payment_status ||
      payload.status_text ||
      payload.transaction_status ||
      nested.payment_status ||
      nested.status ||
      '',
  )
    .trim()
    .toUpperCase()

  if (rawStatus) {
    return ['COMPLETED', 'SUCCESS', 'PAID'].includes(rawStatus)
  }

  if (typeof payload.status === 'boolean') {
    return payload.status === true && Boolean(payload.transaction_id || nested.transaction_id || payload.charged_amount)
  }

  return false
}

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const { user, isLoading, refreshProfile } = useAuth()
  const [statusText, setStatusText] = useState<string>('Processing payment...')
  const [debugSteps, setDebugSteps] = useState<string[]>([])
  const hasStartedRef = useRef(false)
  const waitLoggedRef = useRef(false)

  useEffect(() => {
    let isCancelled = false

    const pushStep = (step: string) => {
      if (isCancelled) return
      setDebugSteps((prev) => [...prev, step])
      console.log(`[PaymentSuccess] ${step}`)
    }

    const run = async () => {
      if (hasStartedRef.current) return

      const params = new URLSearchParams(window.location.search)
      const invoiceId = params.get('invoice_id') || ''
      const fallbackPlan = (params.get('plan') || '').toLowerCase()

      pushStep(`Init -> invoice_id: ${invoiceId || 'missing'}, fallback plan: ${fallbackPlan || 'none'}`)

      if (isLoading || !user) {
        setStatusText('Checking your session...')
        if (!waitLoggedRef.current) {
          pushStep('Auth/session not ready, waiting...')
          waitLoggedRef.current = true
        }
        return
      }

      waitLoggedRef.current = false
      hasStartedRef.current = true

      if (!invoiceId) {
        pushStep('invoice_id missing -> redirect /pricing')
        setStatusText('Payment reference missing')
        toast.error('Invoice id not found')
        setTimeout(() => navigate('/pricing'), 1200)
        return
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session?.access_token) {
          throw new Error('Please sign in again')
        }
        if (!session.user || session.user.id !== user.id) {
          throw new Error('Session mismatch. Please sign in again')
        }
        pushStep('Gateway verify will run via Supabase Edge Function')

        let verifyData: Record<string, unknown> | null = null
        let isVerified = false

        for (let attempt = 1; attempt <= VERIFY_MAX_ATTEMPTS; attempt += 1) {
          setStatusText(`Verifying your payment... (${attempt}/${VERIFY_MAX_ATTEMPTS})`)
          pushStep(`Verify attempt ${attempt}/${VERIFY_MAX_ATTEMPTS} via edge`)

          const verifyResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({
              invoice_id: invoiceId,
              invoiceId,
              plan: fallbackPlan || null,
            }),
          })

          const parsed = await verifyResponse.json().catch(() => null)
          verifyData = (parsed || null) as Record<string, unknown> | null
          const statusSnapshot = String(
            verifyData?.payment_status ||
              verifyData?.status_text ||
              verifyData?.transaction_status ||
              verifyData?.status ||
              (verifyData?.data as Record<string, unknown> | undefined)?.status ||
              'unknown',
          )
          pushStep(`Verify response HTTP ${verifyResponse.status}, status: ${statusSnapshot}`)

          if (verifyResponse.ok && verifyData && (verifyData.completed === true || isCompletedPayment(verifyData))) {
            isVerified = true
            pushStep(`Payment marked completed at attempt ${attempt}`)
            break
          }

          if (attempt < VERIFY_MAX_ATTEMPTS) {
            await sleep(VERIFY_INTERVAL_MS)
            if (isCancelled) return
          }
        }

        if (!isVerified || !verifyData) {
          pushStep('Max retry reached, payment এখনও completed হয়নি')
          setStatusText('Payment এখনও pending. SMS verify শেষ হলে আবার চেষ্টা করুন।')
          toast.error('Payment not completed yet')
          setTimeout(() => navigate('/pricing'), 1800)
          return
        }

        const metadata = (verifyData?.metadata || verifyData?.data?.metadata || {}) as Record<string, string>
        const planKey = String(verifyData?.plan_key || metadata.plan_key || fallbackPlan || 'standard').toLowerCase()
        pushStep(`Plan detected -> ${planKey}`)
        pushStep('Profile update done on server, refreshing profile...')

        await refreshProfile()
        pushStep('Profile refresh done')
        setStatusText('Plan applied successfully')
        toast.success('Upgrade successful')
        setTimeout(() => {
          window.location.href = '/pricing'
        }, 800)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unexpected error'
        pushStep(`Unexpected error -> ${message}`)
        setStatusText(`Unexpected error: ${message}`)
        toast.error(message)
        setTimeout(() => navigate('/pricing'), 1200)
      }
    }

    run()

    return () => {
      isCancelled = true
    }
  }, [navigate, user, isLoading, refreshProfile])

  return (
    <div className="min-h-screen bg-[#171717] text-white flex items-center justify-center">
      <div className="text-center max-w-2xl px-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-300">{statusText}</p>
        {debugSteps.length > 0 && (
          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 text-left p-4">
            <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Debug Breakdown</p>
            <ul className="space-y-1.5 text-xs text-gray-200">
              {debugSteps.map((step, idx) => (
                <li key={`${idx}-${step}`}>{idx + 1}. {step}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
