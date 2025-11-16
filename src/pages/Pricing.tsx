import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Circle, Square, Triangle } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

  const initiatePayment = useCallback(async (amount: number, plan: string) => {
    try {
      const referenceId = `${plan}-${Date.now()}`
      const description = `Upgrade to ${plan}`
      const { data, error } = await supabase.functions.invoke('eps_init_order', {
        body: { amount, referenceId, description }
      })
      if (error) {
        toast.error('Payment init failed')
        return
      }
      const payload = data as { paymentUrl?: string }
      const url = payload?.paymentUrl
      if (url) {
        window.open(url, '_blank')
      } else {
        toast.error('Invalid gateway response')
      }
    } catch (e) {
      toast.error('Payment error')
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#171717] text-white relative">
      {/* Page Background */}
      <div className="absolute inset-0 bg-[#171717]"></div>
      
      <div className="relative z-10">
        <AppHeader remainingCredits="0" apiKey="" onApiKeyChange={() => {}} />
        
        <div className="py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-10">
              <h1 className="text-4xl font-semibold text-white mb-4">
                Choose Your Plan
              </h1>
            </div>
            
            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <div className="relative group">
                <div className="bg-[#212121] border border-[#2A2A2A] rounded-xl p-8 h-full transition-all duration-200 hover:border-[#3A3A3A]">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-[#2A2A2A] flex items-center justify-center">
                      <Circle className="w-4 h-4 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-white">Free</h3>
                  </div>
                  
                  <div className="mb-8">
                    <div className="flex items-baseline mb-2">
                      <span className="text-4xl font-bold text-white">0</span>
                      <span className="text-lg text-gray-500 ml-1">Tk</span>
                    </div>
                    <p className="text-sm text-gray-500">Perfect for getting started</p>
                    <div className="mt-4 px-3 py-1 bg-gray-800 rounded-full text-gray-400 text-xs inline-block">
                      5 credits lifetime limit
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    <PricingItem text="5 Credits Lifetime Limit" included={true} />
                    <PricingItem text="Basic Image to Prompt Features" included={true} />
                    <PricingItem text="Limited Metadata Customization" included={true} />
                    <PricingItem text="Fast Processing" included={false} />
                    <PricingItem text="Priority Support" included={false} />
                    <PricingItem text="Future Features" included={false} />
                  </ul>
                  
                  <button className="w-full bg-white hover:bg-gray-100 text-black font-medium py-3 rounded-lg transition-colors duration-200">
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
                <div className="bg-[#212121] border border-[#1F71DC] rounded-xl p-8 h-full transition-all duration-200 hover:border-[#1F71DC] hover:shadow-lg">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-[#1F71DC]/20 flex items-center justify-center">
                      <Triangle className="w-4 h-4 text-[#1F71DC]" />
                    </div>
                    <h3 className="text-xl font-medium text-white">Premium</h3>
                  </div>
                  
                  <div className="mb-8">
                    <div className="flex items-baseline mb-2">
                      <span className="text-4xl font-bold text-white">2.7</span>
                      <span className="text-lg text-gray-500 ml-1">Tk/Day</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      <b className="text-yellow-400">6Tk Yearly!</b>
                    </p>
                    <p className="text-sm text-gray-500">Everything you need to scale</p>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    <PricingItem text="Unlimited Metadata Generation" included={true} highlight={true} />
                    <PricingItem text="Full Image to Prompt Features" included={true} />
                    <PricingItem text="Full Metadata Customization" included={true} />
                    <PricingItem text="Priority Processing" included={true} />
                    <PricingItem text="Premium Support" included={true} />
                    <PricingItem text="All Future Features" included={true} />
                  </ul>
                  
                  <button 
                    className="w-full bg-white hover:bg-gray-100 text-black font-medium py-3 rounded-lg transition-colors duration-200"
                    onClick={() => initiatePayment(6, 'premium')}
                  >
                    Upgrade to Premium
                  </button>
                </div>
              </div>
              
              {/* Basic Plan */}
              <div className="relative group">
                <div className="bg-[#212121] border border-[#2A2A2A] rounded-xl p-8 h-full transition-all duration-200 hover:border-[#3A3A3A]">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-[#2A2A2A] flex items-center justify-center">
                      <Square className="w-4 h-4 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-medium text-white">Basic</h3>
                  </div>
                  
                  <div className="mb-8">
                    <div className="flex items-baseline mb-2">
                      <span className="text-4xl font-bold text-white">5</span>
                      <span className="text-lg text-gray-500 ml-1">Tk/Day</span>
                    </div>
                    <p className="text-sm text-gray-400"><b className="text-yellow-400">5Tk Monthly!</b></p>
                    <p className="text-sm text-gray-500">Essential features for professionals</p>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    <PricingItem text="Unlimited Metadata Generation" included={true} highlight={true} />
                    <PricingItem text="Full Image to Prompt Features" included={true} />
                    <PricingItem text="Full Metadata Customization" included={true} />
                    <PricingItem text="Priority Processing" included={false} />
                    <PricingItem text="Premium Support" included={false} />
                    <PricingItem text="Beta Features" included={false} />
                  </ul>
                  
                  <button 
                    className="w-full bg-white hover:bg-gray-100 text-black font-medium py-3 rounded-lg transition-colors duration-200"
                    onClick={() => initiatePayment(5, 'basic')}
                  >
                    Upgrade to Basic
                  </button>
                </div>
              </div>
            </div>
            

          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
