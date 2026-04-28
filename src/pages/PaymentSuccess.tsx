import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { Loader2, CheckCircle2, Home } from 'lucide-react'
import { toast } from 'sonner'

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

interface PlanDetails {
  name: string;
  duration: string;
  credits: number;
}

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const { user, isLoading, refreshProfile } = useAuth()
  const [statusText, setStatusText] = useState<string>('Verifying payment...')
  const [isSuccess, setIsSuccess] = useState(false)
  const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null)
  
  const hasStartedRef = useRef(false)
  const waitLoggedRef = useRef(false)

  useEffect(() => {
    let isCancelled = false

    const run = async () => {
      if (hasStartedRef.current) return

      const params = new URLSearchParams(window.location.search)
      const invoiceId = params.get('invoice_id') || ''
      const fallbackPlan = (params.get('plan') || '').toLowerCase()

      if (isLoading || !user) {
        setStatusText('Checking your session...')
        if (!waitLoggedRef.current) {
          waitLoggedRef.current = true
        }
        return
      }

      waitLoggedRef.current = false
      hasStartedRef.current = true

      if (!invoiceId) {
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

        let verifyData: Record<string, unknown> | null = null
        let isVerified = false

        for (let attempt = 1; attempt <= VERIFY_MAX_ATTEMPTS; attempt += 1) {
          setStatusText(`Verifying your payment... (${attempt}/${VERIFY_MAX_ATTEMPTS})`)

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

          if (verifyResponse.ok && verifyData && (verifyData.completed === true || isCompletedPayment(verifyData))) {
            isVerified = true
            break
          }

          if (attempt < VERIFY_MAX_ATTEMPTS) {
            await sleep(VERIFY_INTERVAL_MS)
            if (isCancelled) return
          }
        }

        if (!isVerified || !verifyData) {
          setStatusText('Payment is still pending. Please try again after receiving the SMS.')
          toast.error('Payment not completed yet')
          setTimeout(() => navigate('/pricing'), 1800)
          return
        }

        const metadata = (verifyData?.metadata || (verifyData?.data as any)?.metadata || {}) as Record<string, string>
        const planKey = String(verifyData?.plan_key || metadata.plan_key || fallbackPlan || 'regular').toLowerCase()

        await refreshProfile()
        
        let details: PlanDetails = { name: 'Regular Plan', duration: '1 Month', credits: 5000 };
        if (planKey === 'premium') {
          details = { name: 'Premium Plan', duration: 'Lifetime', credits: 15000 };
        }
        
        setPlanDetails(details)
        setIsSuccess(true)
        setStatusText('Plan applied successfully')
        toast.success('Upgrade successful!')
        
        // Auto redirect after 3 seconds
        setTimeout(() => {
          if (!isCancelled) {
            navigate('/')
          }
        }, 3000)

      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unexpected error'
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

  if (isSuccess && planDetails) {
    return (
      <div className="min-h-screen bg-[#171717] text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="mx-auto w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground mb-8">Your account has been upgraded.</p>
          
          <div className="bg-muted/30 rounded-xl p-4 mb-8 text-left space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-border/50">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-semibold text-primary">{planDetails.name}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-border/50">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-semibold">{planDetails.duration}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Credits</span>
              <span className="font-semibold">{planDetails.credits}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Redirecting to home in a few seconds...
          </p>

          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-xl font-semibold transition-all"
          >
            <Home className="w-4 h-4" />
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#171717] text-white flex items-center justify-center p-4">
      <div className="text-center max-w-sm w-full bg-card border border-border rounded-2xl p-8 shadow-2xl">
        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-6" />
        <h2 className="text-lg font-semibold mb-2">Processing Payment</h2>
        <p className="text-sm text-muted-foreground">{statusText}</p>
      </div>
    </div>
  )
}
