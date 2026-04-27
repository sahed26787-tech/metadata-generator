import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import AppHeader from '@/components/AppHeader'

type PaymentStatus = 'processing' | 'success' | 'failed'

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuth()
  const [status, setStatus] = useState<PaymentStatus>('processing')
  const [statusText, setStatusText] = useState<string>('Verifying your payment...')

  useEffect(() => {
    const verifyPayment = async () => {
      const params = new URLSearchParams(window.location.search)
      const invoiceId = params.get('invoice_id') || params.get('invoiceId') || ''

      if (!invoiceId) {
        setStatus('failed')
        setStatusText('No payment information found')
        toast.error('Payment information missing')
        setTimeout(() => navigate('/pricing'), 2000)
        return
      }

      if (!user) {
        setStatus('failed')
        setStatusText('Please sign in to apply your plan')
        toast.error('Please sign in')
        setTimeout(() => navigate('/auth'), 2000)
        return
      }

      try {
        const startedAt = Date.now()
        const maxWaitMs = 300_000
        const pollIntervalMs = 2_500

        while (true) {
          const { data, error } = await supabase.functions.invoke('verify-payment', {
            body: {
              invoiceId,
              uddoktapayBaseUrl: import.meta.env.VITE_UDDOKTAPAY_BASE_URL,
              uddoktapayApiKey: import.meta.env.VITE_UDDOKTAPAY_API_KEY,
            },
          })

          if (error) {
            throw new Error(error.message || 'Payment verification failed')
          }

          const serverStatus = String(data?.status || '').toUpperCase()
          if (serverStatus === 'COMPLETED') {
            setStatus('success')
            setStatusText('Plan upgraded successfully!')
            toast.success('Upgrade successful! Your plan is now active.')

            try {
              await refreshProfile()
            } catch {
              // ignore
            }

            setTimeout(() => {
              window.location.href = '/pricing'
            }, 2000)
            return
          }

          const elapsed = Date.now() - startedAt
          if (elapsed >= maxWaitMs) {
            setStatus('failed')
            setStatusText(data?.message || 'Payment not completed yet')
            toast.error('Payment not completed')
            setTimeout(() => navigate('/pricing'), 2000)
            return
          }

          setStatus('processing')
          setStatusText(`Payment pending... verifying again (${Math.floor(elapsed / 1000)}s)`)
          await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
        }
      } catch (err) {
        console.error('Payment verification error:', err)
        setStatus('failed')
        setStatusText(err instanceof Error ? err.message : 'Payment verification failed')
        toast.error('Payment verification failed')
        setTimeout(() => navigate('/pricing'), 2000)
      }
    }

    verifyPayment()
  }, [navigate, user, refreshProfile])

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <AppHeader remainingCredits="0" apiKey="" onApiKeyChange={() => {}} />
      
      <div className="pt-16 pb-20 px-4 flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="text-center max-w-md">
          {status === 'processing' && (
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-6 text-primary" />
          )}
          {status === 'success' && (
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          )}
          {status === 'failed' && (
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          )}
          <h1 className="text-2xl font-bold text-foreground mb-3">
            {status === 'processing' ? 'Processing...' : status === 'success' ? 'Payment Successful!' : 'Payment Failed'}
          </h1>
          <p className="text-muted-foreground leading-relaxed">{statusText}</p>
        </div>
      </div>
    </div>
  )
}