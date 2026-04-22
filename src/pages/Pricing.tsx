import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Circle, Square, Triangle, Copy } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
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

type PaymentMethod = 'bKash' | 'Nagad' | 'Rocket' | 'Upay';
type PaidPlanKey = 'standard' | 'exclusive';

interface PaidPlanConfig {
  key: PaidPlanKey;
  title: string;
  verifyTitle: string;
  amount: number;
}

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activePlan, setActivePlan] = useState<PaidPlanConfig | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('bKash');
  const [trxId, setTrxId] = useState('');
  const [phone, setPhone] = useState('');

  const walletNumberDisplay = '+880 1610-632737';
  const walletNumberRaw = '8801610632737';

  const paidPlans: Record<PaidPlanKey, PaidPlanConfig> = {
    standard: { key: 'standard', title: 'Standard Plan', verifyTitle: 'Basic Plan (1 Month)', amount: 250 },
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
    setSelectedMethod('bKash');
    setTrxId('');
  };

  const handleCopyWallet = async () => {
    try {
      await navigator.clipboard.writeText(walletNumberDisplay);
      toast.success('Wallet number copied');
    } catch {
      toast.error('Copy failed');
    }
  };

  const handleVerifyOnWhatsApp = () => {
    if (!activePlan) return;
    if (!trxId.trim()) {
      toast.error('Please enter transaction ID');
      return;
    }

    const message = `*Payment Verification Request*\n*Plan:* ${activePlan.verifyTitle}\n*Amount:* ৳${activePlan.amount}\n*Payment Method:* ${selectedMethod}\n*Customer Details:*\n• Name: ${customerName}\n• Email: ${user?.email || ''}\n• Phone: ${phone.trim()}\n*Transaction ID:* ${trxId.trim()}\nPlease verify my payment. Thank you!`;
    const waUrl = `https://wa.me/${walletNumberRaw}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#171717] text-white relative">
      {/* Page Background */}
      <div className="absolute inset-0 bg-[#171717]"></div>
      
      <div className="relative z-10">
        <AppHeader remainingCredits="0" apiKey="" onApiKeyChange={() => {}} />
        
        <div className="pt-10 pb-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-6">
              <h1 className="text-4xl font-semibold text-white mb-4">
                Choose Your Plan
              </h1>
            </div>
            
            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-12">
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
                    <p className="text-sm text-gray-400">15 Credits for lifetime</p>
                    <div className="mt-4 px-3 py-1 bg-gray-800 rounded-full text-gray-400 text-xs inline-block">
                      Starter plan
                    </div>
                  </div>
                  
                  <ul className="space-y-2.5 mb-6">
                    <PricingItem text="15 Metadata Generations" included={true} />
                    <PricingItem text="03 Background Remove" included={true} />
                    <PricingItem text="Basic Image to Prompt" included={true} />
                    <PricingItem text="Custom Prompt" included={true} />
                    <PricingItem text="Standard Processing" included={true} />
                    <PricingItem text="Premium Support" included={false} />
                    <PricingItem text="All Future Features Available" included={false} />
                  </ul>
                  
                  <button className="w-full bg-white hover:bg-gray-100 text-black font-medium py-2.5 rounded-lg transition-colors duration-200">
                    Current Plan
                  </button>
                </div>
              </div>
              
              {/* Standard Plan */}
              <div className="relative group">
                <div className="bg-[#212121] border border-[#1F71DC] rounded-xl p-6 h-full transition-all duration-200 hover:border-[#1F71DC] hover:shadow-lg">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-7 h-7 rounded-lg bg-[#1F71DC]/20 flex items-center justify-center">
                      <Triangle className="w-4 h-4 text-[#1F71DC]" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Standard</h3>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline mb-2">
                      <span className="text-3xl font-bold text-white">250</span>
                      <span className="text-lg text-gray-500 ml-1">BDT/Month</span>
                    </div>
                    <p className="text-sm text-gray-400">5000 Credits</p>
                  </div>
                  
                  <ul className="space-y-2.5 mb-6">
                    <PricingItem text="5000 Metadata Generations" included={true} highlight={true} />
                    <PricingItem text="1000 Image BG Remove" included={true} />
                    <PricingItem text="Premium Image to Prompt" included={true} />
                    <PricingItem text="Custom Prompt" included={true} />
                    <PricingItem text="Fast Processing" included={true} />
                    <PricingItem text="Premium Support" included={true} />
                    <PricingItem text="All Future Features Available" included={true} />
                  </ul>
                  
                  <button 
                    className="w-full bg-white hover:bg-gray-100 text-black font-medium py-2.5 rounded-lg transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={() => openPaymentModal('standard')}
                  >
                    Upgrade to Standard
                  </button>
                </div>
              </div>
              
              {/* Exclusive Plan */}
              <div className="relative group">
                <div className="bg-[#212121] border border-[#2A2A2A] rounded-xl p-6 h-full transition-all duration-200 hover:border-[#3A3A3A]">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-7 h-7 rounded-lg bg-[#2A2A2A] flex items-center justify-center">
                      <Square className="w-4 h-4 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Exclusive</h3>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline mb-2">
                      <span className="text-3xl font-bold text-white">700</span>
                      <span className="text-lg text-gray-500 ml-1">BDT/Lifetime</span>
                    </div>
                    <p className="text-sm text-gray-400">15000 Credits</p>
                  </div>
                  
                  <ul className="space-y-2.5 mb-6">
                    <PricingItem text="15000 Metadata Generations" included={true} highlight={true} />
                    <PricingItem text="3000 Image BG Remove" included={true} />
                    <PricingItem text="Premium Image to Prompt" included={true} />
                    <PricingItem text="Custom Prompt" included={true} />
                    <PricingItem text="Fast Processing" included={true} />
                    <PricingItem text="Premium Support" included={true} />
                    <PricingItem text="All Future Features Available" included={true} />
                  </ul>
                  
                  <button 
                    className="w-full bg-white hover:bg-gray-100 text-black font-medium py-2.5 rounded-lg transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={() => openPaymentModal('exclusive')}
                  >
                    Upgrade to Exclusive
                  </button>
                </div>
              </div>
            </div>

            {activePlan && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="w-full max-w-sm max-h-[86vh] rounded-xl border border-gray-700 bg-[#101014] text-white shadow-2xl flex flex-col">
                  <div className="flex items-center justify-between border-b border-gray-700 px-3 py-2.5">
                    <h2 className="text-base font-semibold">Complete Your Payment</h2>
                    <button
                      className="text-gray-400 hover:text-white transition-all duration-150 active:scale-95"
                      onClick={() => setActivePlan(null)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3 space-y-2.5 overflow-y-auto pr-2">
                    <div className="rounded-lg bg-[#1B1E24] border border-gray-700 p-2.5 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">Selected Plan</p>
                        <p className="text-base font-semibold">{activePlan.verifyTitle}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Amount</p>
                        <p className="text-lg font-bold text-blue-400">৳{activePlan.amount}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-300 mb-1.5">Select payment method</p>
                      <div className="grid grid-cols-2 gap-2">
                        {(['bKash', 'Nagad', 'Rocket', 'Upay'] as PaymentMethod[]).map((method) => (
                          <button
                            key={method}
                            onClick={() => setSelectedMethod(method)}
                            className={`rounded-md px-3 py-1.5 text-xs font-semibold border transition-colors ${
                              selectedMethod === method
                                ? 'bg-[#1F71DC] border-[#1F71DC] text-white'
                                : 'bg-[#171A20] border-gray-700 text-gray-300 hover:border-gray-500'
                            } transition-transform duration-150 active:scale-95`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg bg-[#171A20] border border-gray-700 p-2.5">
                      <p className="text-xs text-gray-300 mb-1.5">Send to this number</p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-base font-bold tracking-wide">{walletNumberDisplay}</span>
                        <button
                          onClick={handleCopyWallet}
                          className="inline-flex items-center gap-1 rounded-md bg-white text-black px-2.5 py-1 text-xs font-semibold hover:bg-gray-200 transition-all duration-150 active:scale-95"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </button>
                      </div>
                    </div>

                    <div className="rounded-lg border border-yellow-600/40 bg-yellow-500/10 p-2.5 text-xs text-yellow-200">
                      <p className="font-semibold mb-1">Instructions</p>
                      <ol className="list-decimal pl-4 space-y-0.5">
                        <li>Select payment method</li>
                        <li>Send money to {walletNumberDisplay}</li>
                        <li>Copy your transaction ID (TrxID)</li>
                        <li>Enter TrxID and click verify on WhatsApp</li>
                      </ol>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-300 mb-1">Transaction ID (TrxID) *</label>
                      <input
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value)}
                        placeholder="Enter your TrxID"
                        className="w-full rounded-md border border-gray-700 bg-[#171A20] px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="rounded-lg border border-gray-700 bg-[#171A20] p-2.5">
                      <p className="text-xs font-semibold mb-1.5">Customer Details</p>
                      <p className="text-xs text-gray-300">Name: {customerName}</p>
                      <p className="text-xs text-gray-300">Email: {user?.email || ''}</p>
                      <div className="mt-2">
                        <label className="block text-xs text-gray-300 mb-1">Phone</label>
                        <input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="w-full rounded-md border border-gray-700 bg-[#101014] px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleVerifyOnWhatsApp}
                      className="w-full rounded-md bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2 transition-all duration-150 active:scale-95"
                    >
                      Verify on WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
