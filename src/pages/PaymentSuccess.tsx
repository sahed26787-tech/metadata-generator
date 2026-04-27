import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [statusText, setStatusText] = useState<string>('Processing payment...')

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search)
      const status = (params.get('Status') || params.get('status') || '').toLowerCase()
      const referenceId = params.get('referenceId') || ''
      const plan = referenceId.split('-')[0]
      const days = plan === 'premium' ? 365 : 30
      const expiration = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

      if (!user) {
        setStatusText('Please sign in to apply your plan')
        toast.error('Please sign in')
        setTimeout(() => navigate('/auth'), 1000)
        return
      }

      if (status !== 'success') {
        setStatusText('Payment not completed')
        toast.error('Payment not completed')
        setTimeout(() => navigate('/pricing'), 1200)
        return
      }

      try {
        const { error } = await supabase
          .from('profiles')
          .update({ is_premium: true, expiration_date: expiration, updated_at: new Date().toISOString() })
          .eq('id', user.id)

        if (error) {
          setStatusText('Failed to apply plan')
          toast.error('Failed to apply plan')
          setTimeout(() => navigate('/pricing'), 1200)
          return
        }

        setStatusText('Plan applied successfully')
        toast.success('Upgrade successful')
        setTimeout(() => {
          window.location.href = '/pricing'
        }, 800)
      } catch {
        setStatusText('Unexpected error')
        toast.error('Unexpected error')
        setTimeout(() => navigate('/pricing'), 1200)
      }
    }

    run()
  }, [navigate, user])

  return (
    <div className="min-h-screen bg-[#171717] text-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-300">{statusText}</p>
      </div>
    </div>
  )
}