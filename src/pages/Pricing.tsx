import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Circle, Square, Triangle, Loader2 } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface PricingItemProps {
  text: string;
  included: boolean;
  highlight?: boolean;
}

const PricingItem: React.FC<PricingItemProps> = ({ text, included, highlight }) => {
  return (
    <li className={`flex items-center space-x-3 ${highlight ? 'bg-[#1F71DC]/15 border border-[#1F71DC]/30 rounded-md px-2 py-1 -mx-2' : ''}`}>
      <div className="flex-shrink-0">
        {included ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <X className="w-4 h-4 text-gray-500" />
        )}
      </div>
      <span className={`text-sm ${included ? 'text-gray-300' : 'text-gray-500'}`}>
        {text}
      </span>
    </li>
  );
};

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { user } = useAuth();

  const initiatePayment = useCallback(async (amount: number, plan: string) => {
    try {
      if (!user) {
        toast.error('Please sign in to upgrade')
        navigate('/auth')
        return
      }
      setLoadingPlan(plan)
      const referenceId = `${plan}-${Date.now()}`
      const description = `Upgrade to ${plan}`
      const customerEmail = user?.email || undefined
      const { data, error } = await supabase.functions.invoke('eps_init_order', {
        body: { amount, referenceId, description, customerEmail }
      })
      if (error) {
        toast.error('Payment init failed')
        setLoadingPlan(null)
        return
      }
      const payload = data as { paymentUrl?: string }
      const url = payload?.paymentUrl
      if (url) {
        window.location.href = url
      } else {
        toast.error('Invalid gateway response')
        setLoadingPlan(null)
      }
    } catch (e) {
      toast.error('Payment error')
      setLoadingPlan(null)
    }
  }, [user])

  return (
    <div className="min-h-screen bg-[#171717] text-white relative">
      {/* Page Background */}
      <div className="absolute inset-0 bg-[#171717]"></div>
      
      <div className="relative z-10">
        <AppHeader remainingCredits="0" apiKey="" onApiKeyChange={() => {}} />
        
        <div className="py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-4">
              <h1 className="text-4xl font-semibold text-white mb-4">
                Choose Your Plan
              </h1>
            </div>
            
            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Free Plan */}
              <div className="relative group">
                <div className="bg-[#212121] border border-[#2A2A2A] rounded-xl p-6 h-full transition-all duration-200 hover:border-[#3A3A3A]">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-7 h-7 rounded-lg bg-[#2A2A2A] flex items-center justify-center">
                      <Circle className="w-4 h-4 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Free</h3>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline mb-2">
                      <span className="text-3xl font-bold text-white">0</span>
                      <span className="text-lg text-gray-500 ml-1">Tk</span>
                    </div>
                    <p className="text-sm text-gray-500">Perfect for getting started</p>
                    <div className="mt-4 px-3 py-1 bg-gray-800 rounded-full text-gray-400 text-xs inline-block">
                      5 credits lifetime limit
                    </div>
                  </div>
                  
                  <ul className="space-y-2.5 mb-6">
                    <PricingItem text="5 Credits Lifetime Limit" included={true} />
                    <PricingItem text="Basic Image to Prompt Features" included={true} />
                    <PricingItem text="Limited Metadata Customization" included={true} />
                    <PricingItem text="Fast Processing" included={false} />
                    <PricingItem text="Priority Support" included={false} />
                    <PricingItem text="Future Features" included={false} />
                  </ul>
                  
                  <button className="w-full bg-white hover:bg-gray-100 text-black font-medium py-2.5 rounded-lg transition-colors duration-200">
                    Current Plan
                  </button>
                </div>
              </div>
              
              {/* Premium Plan */}
              <div className="relative group">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-[#1F71DC] text-white px-3 py-1 rounded-full text-xs font-medium">
                    MOST POPULAR
                  </div>
                </div>
                <div className="bg-[#212121] border border-[#1F71DC] rounded-xl p-6 h-full transition-all duration-200 hover:border-[#1F71DC] hover:shadow-lg">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-7 h-7 rounded-lg bg-[#1F71DC]/20 flex items-center justify-center">
                      <Triangle className="w-4 h-4 text-[#1F71DC]" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Premium</h3>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline mb-2">
                      <span className="text-3xl font-bold text-white">8.8</span>
                      <span className="text-lg text-gray-500 ml-1">Tk/Day</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      <b className="text-yellow-400">3200Tk Yearly!</b>
                    </p>
                    <p className="text-sm text-gray-500">Everything you need to scale</p>
                  </div>
                  
                  <ul className="space-y-2.5 mb-6">
                    <PricingItem text="Unlimited Metadata Generation" included={true} highlight={true} />
                    <PricingItem text="Full Image to Prompt Features" included={true} />
                    <PricingItem text="Full Metadata Customization" included={true} />
                    <PricingItem text="Priority Processing" included={true} />
                    <PricingItem text="Premium Support" included={true} />
                    <PricingItem text="All Future Features" included={true} />
                  </ul>
                  
                  <button 
                    className="w-full bg-white hover:bg-gray-100 text-black font-medium py-2.5 rounded-lg transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={() => initiatePayment(3200, 'premium')}
                    disabled={loadingPlan === 'premium'}
                  >
                    {loadingPlan === 'premium' ? (
                      <span className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Continuing...</span>
                      </span>
                    ) : (
                      'Upgrade to Premium'
                    )}
                  </button>
                </div>
              </div>
              
              {/* Basic Plan */}
              <div className="relative group">
                <div className="bg-[#212121] border border-[#2A2A2A] rounded-xl p-6 h-full transition-all duration-200 hover:border-[#3A3A3A]">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-7 h-7 rounded-lg bg-[#2A2A2A] flex items-center justify-center">
                      <Square className="w-4 h-4 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Basic</h3>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline mb-2">
                      <span className="text-3xl font-bold text-white">10</span>
                      <span className="text-lg text-gray-500 ml-1">Tk/Day</span>
                    </div>
                    <p className="text-sm text-gray-400"><b className="text-yellow-400">300Tk Monthly!</b></p>
                    <p className="text-sm text-gray-500">Essential features for professionals</p>
                  </div>
                  
                  <ul className="space-y-2.5 mb-6">
                    <PricingItem text="Unlimited Metadata Generation" included={true} highlight={true} />
                    <PricingItem text="Full Image to Prompt Features" included={true} />
                    <PricingItem text="Full Metadata Customization" included={true} />
                    <PricingItem text="Priority Processing" included={false} />
                    <PricingItem text="Premium Support" included={false} />
                    <PricingItem text="Beta Features" included={false} />
                  </ul>
                  
                  <button 
                    className="w-full bg-white hover:bg-gray-100 text-black font-medium py-2.5 rounded-lg transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={() => initiatePayment(300, 'basic')}
                    disabled={loadingPlan === 'basic'}
                  >
                    {loadingPlan === 'basic' ? (
                      <span className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Continuing...</span>
                      </span>
                    ) : (
                      'Upgrade to Basic'
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="max-w-5xl mx-auto mt-6 mb-8">
              <img
                src="/pricing-footer.png"
                alt="Payment methods"
                className="w-full h-24 object-contain rounded-lg"
              />
            </div>
            

          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
