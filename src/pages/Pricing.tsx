import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import AppHeader from '@/components/AppHeader';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-[#030712] text-white">
      <AppHeader remainingCredits="0" apiKey="" onApiKeyChange={() => {}} />
      
      <div className="flex-1 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight">Choose Your Plan</h1>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {/* Free Plan */}
            <Card className="bg-[#1F2937] border border-gray-800 shadow-xl relative overflow-hidden">
              <CardHeader className="pb-0">
                <h2 className="text-2xl font-bold text-white">Free</h2>
                <div className="flex items-baseline mt-2">
                  <span className="text-5xl font-extrabold tracking-tight">0</span>
                  <span className="ml-1 text-slate-50 text-4xl">Tk</span>
                </div>
                <p className="text-sm text-gray-400 mt-3">Limited features to get started</p>
                <p className="text-xs text-red-400 mt-1">Free users limited to 15 credits for lifetime</p>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  <PricingItem included text="15 Credits Lifetime Limit" />
                  <PricingItem included text="Basic Image to Prompt Features" />
                  <PricingItem included text="Limited Access to Metadata Customization" />
                  <PricingItem notIncluded text="More Fast Processing" />
                  <PricingItem notIncluded text="Fully Custom Support" />
                  <PricingItem notIncluded text="All Future Features" />
                </ul>
              </CardContent>
              <CardFooter>
                <Button size="lg" onClick={() => navigate('/')} className="w-full bg-blue-600 hover:bg-blue-700">
                  Current Plan
                </Button>
              </CardFooter>
            </Card>
            
            {/* Basic Plan */}
            <Card className="bg-[#1F2937] border border-gray-800 shadow-xl relative overflow-hidden">
              <CardHeader className="pb-0">
                <h2 className="text-2xl font-bold text-white">Basic</h2>
                <div className="flex items-baseline mt-2">
                  <span className="text-5xl font-extrabold tracking-tight">200</span>
                  <span className="ml-1 text-slate-50 text-xl">Tk/Month</span>
                </div>
                <p className="text-sm text-gray-400 mt-3">All features, monthly access</p>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  <PricingItem included text="Unlimited Metadata Generation" />
                  <PricingItem included text="Full Image to Prompt Features" />
                  <PricingItem included text="Full Access to Metadata Customization" />
                  <PricingItem notIncluded text="More Fast Processing" />
                  <PricingItem notIncluded text="Fully Custom Support" />
                  <PricingItem notIncluded text="All Future Features" />
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  size="lg" 
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                  onClick={() => window.open('https://pixcraftai.paymently.io/paymentlink/pay/h7w3lr5WK9kO5cnYlIo9mYHTChODMOgABKxxRxRQ', '_blank')}
                >
                  Upgrade to Basic
                </Button>
              </CardFooter>
            </Card>
            
            {/* Premium Plan */}
            <Card className="bg-[#1F2937] border border-gray-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-black px-3 py-1 text-xs font-semibold">
                POPULAR
              </div>
              <CardHeader className="pb-0">
                <h2 className="text-2xl font-bold text-white">Premium</h2>
                <div className="flex items-baseline mt-2">
                  <span className="text-5xl font-extrabold tracking-tight">700</span>
                  <span className="ml-1 text-slate-50 text-xl">Tk/Yearly</span>
                </div>
                <div className="mt-1">
                  <span className="text-xs bg-amber-500/20 px-2 py-0.5 text-amber-500 font-medium rounded-md">
                    Best Value!
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-3">All features, unlimited access</p>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  <PricingItem included text="Unlimited Metadata Generation" />
                  <PricingItem included text="Full Image to Prompt Features" />
                  <PricingItem included text="Full Access to Metadata Customization" />
                  <PricingItem included text="More Fast Processing" />
                  <PricingItem included text="Fully Custom Support" />
                  <PricingItem included text="All Future Features" />
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  size="lg"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                  onClick={() => window.open('https://pixcraftai.paymently.io/paymentlink/pay/QaGQrBCrlrnARy8ekwtNwibiCqOjKcNYhJmcVdYX', '_blank')}
                >
                  Upgrade to Premium
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="text-center mt-12 text-sm text-gray-400">
            <p>Process Unlimited images in a Single Action</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for pricing items
const PricingItem = ({
  included,
  notIncluded,
  text
}: {
  included?: boolean;
  notIncluded?: boolean;
  text: string;
}) => (
  <li className="flex items-center gap-3">
    {included ? (
      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
    ) : (
      <X className="h-5 w-5 text-red-500 flex-shrink-0" />
    )}
    <span className={included ? "text-gray-200" : "text-gray-500"}>{text}</span>
  </li>
);

export default PricingPage;
