import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Circle, Square, Triangle } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

interface PricingItemProps {
  text: string;
  included: boolean;
}

const PricingItem: React.FC<PricingItemProps> = ({ text, included }) => {
  return (
    <li className="flex items-center space-x-3">
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

  return (
    <div className="min-h-screen bg-gray-950 text-white relative">
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950"></div>
      
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
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 h-full transition-all duration-200 hover:border-gray-700">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
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
                  
                  <button className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-lg transition-colors duration-200">
                    Current Plan
                  </button>
                </div>
              </div>
              
              {/* Premium Plan */}
              <div className="relative group">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-amber-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    MOST POPULAR
                  </div>
                </div>
                <div className="bg-gray-900/50 border border-amber-600/50 rounded-xl p-8 h-full transition-all duration-200 hover:border-amber-500/70 hover:shadow-lg hover:shadow-amber-500/10">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-amber-600/20 flex items-center justify-center">
                      <Triangle className="w-4 h-4 text-amber-400" />
                    </div>
                    <h3 className="text-xl font-medium text-white">Premium</h3>
                  </div>
                  
                  <div className="mb-8">
                    <div className="flex items-baseline mb-2">
                      <span className="text-4xl font-bold text-white">1.97</span>
                      <span className="text-lg text-gray-500 ml-1">Tk/Day</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      <b className="text-yellow-400">700TK Yearly!</b>
                    </p>
                    <p className="text-sm text-gray-500">Everything you need to scale</p>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    <PricingItem text="Unlimited Metadata Generation" included={true} />
                    <PricingItem text="Full Image to Prompt Features" included={true} />
                    <PricingItem text="Full Metadata Customization" included={true} />
                    <PricingItem text="Priority Processing" included={true} />
                    <PricingItem text="Premium Support" included={true} />
                    <PricingItem text="All Future Features" included={true} />
                  </ul>
                  
                  <button 
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-3 rounded-lg transition-colors duration-200"
                    onClick={() => window.open('https://pixcraftai.paymently.io/paymentlink/pay/QaGQrBCrlrnARy8ekwtNwibiCqOjKcNYhJmcVdYX', '_blank')}
                  >
                    Upgrade to Premium
                  </button>
                </div>
              </div>
              
              {/* Basic Plan */}
              <div className="relative group">
                <div className="bg-gray-900/50 border border-slate-700 rounded-xl p-8 h-full transition-all duration-200 hover:border-slate-600">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                      <Square className="w-4 h-4 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-medium text-white">Basic</h3>
                  </div>
                  
                  <div className="mb-8">
                    <div className="flex items-baseline mb-2">
                      <span className="text-4xl font-bold text-white">6.50</span>
                      <span className="text-lg text-gray-500 ml-1">Tk/Day</span>
                    </div>
                    <p className="text-sm text-gray-400"><b className="text-yellow-400">190TK Monthly!</b></p>
                    <p className="text-sm text-gray-500">Essential features for professionals</p>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    <PricingItem text="Unlimited Metadata Generation" included={true} />
                    <PricingItem text="Full Image to Prompt Features" included={true} />
                    <PricingItem text="Full Metadata Customization" included={true} />
                    <PricingItem text="Priority Processing" included={false} />
                    <PricingItem text="Premium Support" included={false} />
                    <PricingItem text="Beta Features" included={false} />
                  </ul>
                  
                  <button 
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-lg transition-colors duration-200"
                    onClick={() => window.open('https://pixcraftai.paymently.io/paymentlink/pay/h7w3lr5WK9kO5cnYlIo9mYHTChODMOgABKxxRxRQ', '_blank')}
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
