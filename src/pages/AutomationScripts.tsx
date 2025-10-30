import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Play } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/context/AuthContext';

const AutomationScripts: React.FC = () => {
  const { profile } = useAuth();
  const remainingCredits = profile?.is_premium ? '∞' : profile ? `${Math.max(0, 5000 - profile.credits_used)}` : '0';

  return (
    <div className="bg-[#030712] flex flex-col min-h-screen">
      <AppHeader
        remainingCredits={remainingCredits}
        apiKey=""
        onApiKeyChange={() => {}}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 flex-1">
        {/* Main Heading Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Pixcraftai-<span className="text-orange-500">এর অটোমেশন স্ক্রিপ্ট</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            যার মাধ্যমে আপনার কাজের গতি আরও বৃদ্ধি পাবে।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-[1400px] mx-auto">
          
          {/* Auto PSD & EPS Scripts Card */}
          <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl min-h-[700px]">
            <CardHeader className="text-center pb-8 px-8 pt-8">
              <div className="mx-auto mb-4 w-20 h-20 rounded-2xl flex items-center justify-center">
                <img 
                  src="/images/automation-script-icon.svg" 
                  alt="Automation Script Icon" 
                  className="w-20 h-20"
                />
              </div>
              <CardTitle className="text-2xl font-bold text-white mb-2">Auto JPG/PNG to PSD & SVG to EPS Scripts</CardTitle>
              <p className="text-gray-400">লাইফটাইমের জন্য ব্যবহার করতে পারবেন।</p>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 leading-relaxed">১. ফটোশপের মাধ্যমে এক ক্লিকে আনলিমিটেড JPG/PNG ফাইলকে PSD ফরম্যাটে কনভার্ট করতে পারবেন।</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 leading-relaxed">২. PSD ফাইলের জন্য কাস্টমাইজ JPG প্রিভিউ তৈরি করতে পারবেন।</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 leading-relaxed">৩. অ্যাডোব ইলাস্ট্রেটরের মাধ্যমে এক ক্লিকে আনলিমিটেড SVG ফাইলকে EPS 10 ফরম্যাট এবং JPG ফাইলে তৈরি করতে পারবেন।</span>
                </div>
              </div>
              
              <div className="pt-8 flex gap-4">
                {/* How It Works Button */}
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                  onClick={() => window.open('https://youtu.be/hGPWbIPJSXc?si=J0BP0YkmieGuouey', '_blank')}
                >
                  <span className="flex items-center justify-center">
                    <Play className="w-4 h-4 mr-2" />
                    Watch Now
                  </span>
                </Button>
                
                {/* Buy Now Button */}
                <Button 
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                  onClick={() => window.open('https://pixcraftai.paymently.io/paymentlink/pay/h7w3lr5WK9kO5cnYlIo9mYHTChODMOgABKxxRxRQ', '_blank')}
                >
                  Buy Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Auto EPS Bundle & Coloring Maker Script Card */}
          <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl min-h-[700px]">
            <CardHeader className="text-center pb-8 px-8 pt-8">
              <div className="mx-auto mb-4 w-20 h-20 rounded-2xl flex items-center justify-center">
                <img 
                  src="/images/eps-bundle-icon.svg" 
                  alt="EPS Bundle Icon" 
                  className="w-20 h-20"
                />
              </div>
              <CardTitle className="text-2xl font-bold text-white mb-2">Auto EPS Bundle & Coloring Maker Script</CardTitle>
              <p className="text-gray-400">লাইফটাইমের জন্য ব্যবহার করতে পারবেন।</p>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 leading-relaxed">১. হরিজন্টাল বা ভার্টিক্যাল আর্টবোর্ড নিয়ে এবং কাস্টম রঙ ব্যবহার করে ব্যাকগ্রাউন্ড ও আর্টবোর্ডে হেডার যোগ করে বান্ডেল ফাইল তৈরি করতে পারবেন, যা EPS 10 ফরম্যাটে এক্সপোর্ট করা যাবে।</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 leading-relaxed">২. SVG ফাইল থেকে কালারিং ফাইল তৈরি করতে পারবেন।</span>
                </div>
              </div>
              
              <div className="pt-8 flex gap-4">
                {/* How It Works Button */}
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                  onClick={() => window.open('https://youtu.be/IgxtKon5brg?si=APB-CO4p80mUcGSK', '_blank')}
                >
                  <span className="flex items-center justify-center">
                    <Play className="w-4 h-4 mr-2" />
                    Watch Now
                  </span>
                </Button>
                
                {/* Buy Now Button */}
                <Button 
                  className="flex-1 bg-gradient-to-r from-gray-600 to-black hover:from-gray-700 hover:to-gray-900 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                  onClick={() => window.open('https://pixcraftai.paymently.io/paymentlink/pay/7IRKlEWtpLMoGUkV4CmqG2hLH16yNhH1acUsJC72', '_blank')}
                >
                  Buy Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Third Demo Box - Pixcraftai */}
          <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl min-h-[700px]">
            <CardHeader className="text-center pb-8 px-8 pt-8">
              <div className="mx-auto mb-4 w-20 h-20 rounded-2xl flex items-center justify-center">
                <img 
                  src="/images/pixcraftai-icon.svg" 
                  alt="Pixcraftai Icon" 
                  className="w-20 h-20"
                />
              </div>
              <CardTitle className="text-2xl font-bold text-white mb-2">Pixcraftai</CardTitle>
              <p className="text-gray-400">আনলিমিটেড ছবি তৈরি করতে পারবেন।</p>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 leading-relaxed">১. ১৪০০ ফাস্ট ইমেজ জেনারেশন।</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 leading-relaxed">২. আনলিমিটেড স্লো ইমেজ জেনারেশন।</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 leading-relaxed">৩. আনলিমিটেড ChatGPT, Gemini, DeepSeek ইত্যাদি</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 leading-relaxed">৪. ১০,০০০ মেটাডাটা জেনারেশন এবং ইমেজ থেকে প্রম্পট জেনারেশন</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 leading-relaxed">৫. ১,০০০ ইমেজ এনহ্যান্সার এবং ব্যাকগ্রাউন্ড রিমুভার</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 leading-relaxed">৬. ভিডিও জেনারেশন</span>
                </div>
              </div>
              
              <div className="pt-8 flex gap-4">
                {/* How It Works Button */}
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                  onClick={() => window.open('https://youtu.be/BHR5tTtFG5E?si=7zfsFBKbgyKa6Ku2', '_blank')}
                >
                  <span className="flex items-center justify-center">
                    <Play className="w-4 h-4 mr-2" />
                    Watch Now
                  </span>
                </Button>
                
                {/* Buy Now Button */}
                <Button 
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                  onClick={() => window.open('https://pixcraftai.com/', '_blank')}
                >
                  Buy Now
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default AutomationScripts;