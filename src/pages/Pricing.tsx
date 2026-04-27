import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Loader2, CreditCard } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface PricingItemProps {
  text: string;
  included: boolean;
}

const PricingItem: React.FC<PricingItemProps> = ({ text, included }) => {
  return (
    <li className="flex items-start space-x-3 py-1">
      <div className="flex-shrink-0 mt-0.5">
        {included ? (
          <Check className="w-4 h-4 text-[#1F71DC]" />
        ) : (
          <X className="w-4 h-4 text-muted-foreground/40" />
        )}
      </div>
      <span className={`text-sm ${included ? 'text-foreground' : 'text-muted-foreground/60'}`}>
        {text}
      </span>
    </li>
  );
};

type PaidPlanKey = 'standard' | 'exclusive';

interface PaidPlanConfig {
  key: PaidPlanKey;
  title: string;
  verifyTitle: string;
  amount: number;
  originalAmount?: number;
}

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [activePlan, setActivePlan] = useState<PaidPlanConfig | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentPlanType = profile?.plan_type?.toLowerCase() || 'free';

  const paidPlans: Record<PaidPlanKey, PaidPlanConfig> = {
    standard: { key: 'standard', title: 'Standard Plan', verifyTitle: 'Basic Plan (1 Month)', amount: 3 },
    exclusive: { key: 'exclusive', title: 'Exclusive Plan', verifyTitle: 'Exclusive Plan (Lifetime)', amount: 700 },
  };

  const customerName = useMemo(() => {
    const fromMeta = (user?.user_metadata?.full_name as string | undefined)?.trim();
    if (fromMeta) return fromMeta;
    if (user?.email) return user.email.split('@')[0];
    return 'Customer';
  }, [user]);

  const openPaymentModal = (planKey: PaidPlanKey) => {
    if (!user) {
      toast.error('Please sign in to upgrade');
      navigate('/auth');
      return;
    }
    setActivePlan(paidPlans[planKey]);
    setCouponCode('');
    setAppliedCoupon(null);
  };

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'TIMESAI27') {
      setAppliedCoupon('TIMESAI27');
      toast.success('Coupon applied! 27% discount');
    } else {
      toast.error('Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const getDiscountedAmount = (amount: number) => {
    if (appliedCoupon === 'TIMESAI27') {
      return Math.round(amount * 0.73);
    }
    return amount;
  };

  const handlePayment = async () => {
    if (!activePlan || !user) return;
    setIsProcessing(true);

    try {
      const finalAmount = getDiscountedAmount(activePlan.amount);

      const { data, error } = await supabase.functions.invoke('create-charge', {
        body: {
          planKey: activePlan.key,
          amount: finalAmount,
          fullName: customerName,
          email: user.email,
          userId: user.id,
          uddoktapayBaseUrl: import.meta.env.VITE_UDDOKTAPAY_BASE_URL,
          uddoktapayApiKey: import.meta.env.VITE_UDDOKTAPAY_API_KEY,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to create payment');
      }

      if (data?.paymentUrl) {
        // Redirect to UddoktaPay checkout page
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <AppHeader remainingCredits="0" apiKey="" onApiKeyChange={() => {}} />
      
      <div className="pt-16 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-foreground mb-4 tracking-tight">
              Choose Your Plan
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed text-sm">
              Pick the perfect plan for your workflow. Instant auto payment via bKash, Nagad, Rocket & more.
            </p>
          </div>
          
          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            
            {/* Free Plan */}
            <div className="bg-card border border-border rounded-2xl p-8 flex flex-col h-full transition-all duration-300 hover:border-primary/20 hover:bg-accent/5">
              <div className="mb-8">
                <h3 className="text-lg font-bold text-foreground mb-2">Free</h3>
                <div className="flex items-baseline mb-1">
                  <span className="text-4xl font-bold text-foreground">0</span>
                  <span className="text-lg text-muted-foreground ml-1">Tk</span>
                </div>
                <p className="text-xs text-muted-foreground">15 Credits for lifetime</p>
                <div className="mt-3 px-2.5 py-0.5 bg-muted rounded-full text-muted-foreground text-[10px] inline-block uppercase tracking-wider">
                  Starter plan
                </div>
              </div>
              
              <ul className="space-y-3 mb-10 flex-grow">
                <PricingItem text="15 Metadata Generations" included={true} />
                <PricingItem text="03 Background Remove" included={true} />
                <PricingItem text="Basic Image to Prompt" included={true} />
                <PricingItem text="Custom Prompt" included={true} />
                <PricingItem text="Standard Processing" included={true} />
                <PricingItem text="Premium Support" included={false} />
                <PricingItem text="All Future Features Available" included={false} />
              </ul>
              
              <button 
                disabled
                className={`w-full font-semibold py-3.5 rounded-xl transition-all duration-200 cursor-default ${
                  currentPlanType === 'free' 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {currentPlanType === 'free' ? 'Current Plan' : 'Free Plan'}
              </button>
            </div>
            
            {/* Standard Plan */}
            <div className={`bg-card rounded-2xl p-8 flex flex-col h-full transition-all duration-300 hover:bg-accent/5 border ${
              currentPlanType === 'standard' ? 'border-primary shadow-[0_0_20px_rgba(31,113,220,0.15)] ring-2 ring-primary/20' : 'border-primary/30'
            }`}>
              <div className="mb-8">
                <h3 className="text-lg font-bold text-foreground mb-2">Standard</h3>
                <div className="flex items-baseline mb-1">
                  <span className="text-4xl font-bold text-foreground">3</span>
                  <span className="text-lg text-muted-foreground ml-1">BDT/Month</span>
                </div>
                <p className="text-xs text-muted-foreground">5000 Credits</p>
              </div>
              
              <ul className="space-y-3 mb-10 flex-grow">
                <PricingItem text="5000 Metadata Generations" included={true} />
                <PricingItem text="1000 Image BG Remove" included={true} />
                <PricingItem text="Premium Image to Prompt" included={true} />
                <PricingItem text="Custom Prompt" included={true} />
                <PricingItem text="Fast Processing" included={true} />
                <PricingItem text="Premium Support" included={true} />
                <PricingItem text="All Future Features Available" included={true} />
              </ul>
              
              <button 
                onClick={() => currentPlanType !== 'standard' && openPaymentModal('standard')}
                disabled={currentPlanType === 'standard'}
                className={`w-full font-bold py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-lg ${
                  currentPlanType === 'standard'
                    ? 'bg-primary/10 text-primary border border-primary/20 cursor-default shadow-none'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'
                }`}
              >
                {currentPlanType === 'standard' ? 'Current Plan' : 'Upgrade to Standard'}
              </button>
            </div>
            
            {/* Exclusive Plan */}
            <div className={`bg-card rounded-2xl p-8 flex flex-col h-full transition-all duration-300 hover:bg-accent/5 border ${
              currentPlanType === 'exclusive' ? 'border-primary shadow-[0_0_20px_rgba(31,113,220,0.15)] ring-2 ring-primary/20' : 'border-border'
            }`}>
              <div className="mb-8">
                <h3 className="text-lg font-bold text-foreground mb-2">Exclusive</h3>
                <div className="flex items-baseline mb-1">
                  <span className="text-4xl font-bold text-foreground">700</span>
                  <span className="text-lg text-muted-foreground ml-1">BDT/Lifetime</span>
                </div>
                <p className="text-xs text-muted-foreground">15000 Credits</p>
              </div>
              
              <ul className="space-y-3 mb-10 flex-grow">
                <PricingItem text="15000 Metadata Generations" included={true} />
                <PricingItem text="3000 Image BG Remove" included={true} />
                <PricingItem text="Premium Image to Prompt" included={true} />
                <PricingItem text="Custom Prompt" included={true} />
                <PricingItem text="Fast Processing" included={true} />
                <PricingItem text="Premium Support" included={true} />
                <PricingItem text="All Future Features Available" included={true} />
              </ul>
              
              <button 
                onClick={() => currentPlanType !== 'exclusive' && openPaymentModal('exclusive')}
                disabled={currentPlanType === 'exclusive'}
                className={`w-full font-semibold py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] border ${
                  currentPlanType === 'exclusive'
                    ? 'bg-primary/10 text-primary border-primary/20 cursor-default'
                    : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground border-border'
                }`}
              >
                {currentPlanType === 'exclusive' ? 'Current Plan' : 'Upgrade to Exclusive'}
              </button>
            </div>
          </div>

          {activePlan && (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="w-full max-w-md max-h-[90vh] rounded-2xl border border-border bg-card text-card-foreground shadow-2xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                  <h2 className="text-lg font-bold text-foreground">Complete Your Payment</h2>
                  <button
                    className="text-muted-foreground hover:text-foreground transition-all duration-150 active:scale-90"
                    onClick={() => setActivePlan(null)}
                    disabled={isProcessing}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                  <div className="rounded-xl bg-muted/30 border border-border p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Selected Plan</p>
                      <p className="text-lg font-bold text-foreground">{activePlan.verifyTitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Amount</p>
                      {appliedCoupon ? (
                        <div className="flex flex-col items-end">
                          <p className="text-sm text-muted-foreground line-through">৳{activePlan.amount}</p>
                          <p className="text-2xl font-bold text-primary">৳{getDiscountedAmount(activePlan.amount)}</p>
                          <p className="text-xs text-green-500 font-medium">27% off applied</p>
                        </div>
                      ) : (
                        <p className="text-2xl font-bold text-primary">৳{activePlan.amount}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Have a coupon?</p>
                    <div className="flex gap-2">
                      <input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/30 uppercase"
                        disabled={isProcessing}
                      />
                      <button
                        onClick={applyCoupon}
                        className="px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-semibold transition-all active:scale-95 border border-border"
                        disabled={isProcessing}
                      >
                        Apply
                      </button>
                    </div>
                    {appliedCoupon && (
                      <p className="text-xs text-green-500">✓ Coupon TIMESAI27 applied - 27% discount!</p>
                    )}
                  </div>

                  <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <p className="text-sm font-bold text-foreground">Auto Payment via UddoktaPay</p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      You'll be redirected to our secure payment page. Supports bKash, Nagad, Rocket, Upay and more. Your plan will be activated instantly after payment.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold">Customer Details</p>
                    <div className="space-y-2">
                      <p className="text-sm text-foreground/90"><span className="text-muted-foreground font-medium">Name:</span> {customerName}</p>
                      <p className="text-sm text-foreground/90"><span className="text-muted-foreground font-medium">Email:</span> {user?.email || ''}</p>
                    </div>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-bold py-4 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Pay ৳{getDiscountedAmount(activePlan.amount)}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )
        }
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
