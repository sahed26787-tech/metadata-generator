import { useNavigate } from 'react-router-dom'
import { XCircle } from 'lucide-react'
import AppHeader from '@/components/AppHeader'

export default function PaymentCancel() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <AppHeader remainingCredits="0" apiKey="" onApiKeyChange={() => {}} />
      
      <div className="pt-16 pb-20 px-4 flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-3">Payment Cancelled</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Your payment was cancelled. No charges have been made. You can try again anytime.
          </p>
          <button
            onClick={() => navigate('/pricing')}
            className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3.5 font-bold transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
          >
            Back to Pricing
          </button>
        </div>
      </div>
    </div>
  )
}
