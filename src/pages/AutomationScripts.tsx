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
            <span className="text-orange-500">অটোমেশন স্ক্রিপ্ট</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            কাজের গতি বৃদ্ধি করুন।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-[1400px] mx-auto">
          
          {/* Auto PSD & EPS Scripts Card */}
          <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl min-h-[500px]">
            <CardHeader className="text-center pb-4 px-6 pt-6">
              <div className="mx-auto mb-3 w-16 h-16 rounded-2xl flex items-center justify-center">
                <img 
                  src="/images/automation-script-icon.svg" 
                  alt="Automation Script Icon" 
                  className="w-16 h-16"
                />
              </div>
              <CardTitle className="text-xl font-bold text-white mb-2">Auto JPG/PNG to PSD & SVG to EPS Scripts</CardTitle>
              <p className="text-gray-400 text-sm">লাইফটাইমের জন্য ব্যবহার করতে পারবেন।</p>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">১. ফটোশপের মাধ্যমে এক ক্লিকে আনলিমিটেড JPG/PNG ফাইলকে PSD ফরম্যাটে কনভার্ট করতে পারবেন।</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">২. PSD ফাইলের জন্য কাস্টমাইজ JPG প্রিভিউ তৈরি করতে পারবেন।</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">৩. অ্যাডোব ইলাস্ট্রেটরের মাধ্যমে এক ক্লিকে আনলিমিটেড SVG ফাইলকে EPS 10 ফরম্যাট এবং JPG ফাইলে তৈরি করতে পারবেন।</span>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                {/* How It Works Button */}
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 text-sm rounded-lg transition-all duration-300 transform hover:scale-105"
                  onClick={() => window.open('https://youtu.be/hGPWbIPJSXc?si=J0BP0YkmieGuouey', '_blank')}
                >
                  <span className="flex items-center justify-center">
                    <Play className="w-3 h-3 mr-1" />
                    Watch Now
                  </span>
                </Button>
                
                {/* Buy Now Button */}
                <Button 
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold py-2 text-sm rounded-lg transition-all duration-300 transform hover:scale-105"
                  onClick={() => window.open('https://pixcraftai.paymently.io/paymentlink/pay/h7w3lr5WK9kO5cnYlIo9mYHTChODMOgABKxxRxRQ', '_blank')}
                >
                  Buy Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Auto EPS Bundle & Coloring Maker Script Card */}
          <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl min-h-[500px]">
            <CardHeader className="text-center pb-4 px-6 pt-6">
              <div className="mx-auto mb-3 w-16 h-16 rounded-2xl flex items-center justify-center">
                <img 
                  src="/images/eps-bundle-icon.svg" 
                  alt="EPS Bundle Icon" 
                  className="w-16 h-16"
                />
              </div>
              <CardTitle className="text-xl font-bold text-white mb-2">Auto EPS Bundle & Coloring Maker Script</CardTitle>
              <p className="text-gray-400 text-sm">লাইফটাইমের জন্য ব্যবহার করতে পারবেন।</p>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">১. ইলাস্ট্রেটর এ অটোমেটিক কালারিং এর জন্য ফাইল তৈরি করতে পারবেন।</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">২. ইলাস্ট্রেটর এ অটোমেটিক বান্ডেল তৈরি করতে পারবেন।</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">৩. এক ক্লিকে ফাইল এক্সপোর্ট করতে পারবেন।</span>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                {/* How It Works Button */}
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 text-sm rounded-lg transition-all duration-300 transform hover:scale-105"
                  onClick={() => window.open('https://youtu.be/IgxtKon5brg?si=APB-CO4p80mUcGSK', '_blank')}
                >
                  <span className="flex items-center justify-center">
                    <Play className="w-3 h-3 mr-1" />
                    Watch Now
                  </span>
                </Button>
                
                {/* Buy Now Button */}
                <Button 
                  className="flex-1 bg-gradient-to-r from-gray-600 to-black hover:from-gray-700 hover:to-gray-900 text-white font-semibold py-2 text-sm rounded-lg transition-all duration-300 transform hover:scale-105"
                  onClick={() => window.open('https://pixcraftai.paymently.io/paymentlink/pay/7IRKlEWtpLMoGUkV4CmqG2hLH16yNhH1acUsJC72', '_blank')}
                >
                  Buy Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Third Demo Box - Pixcraftai */}
          <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl min-h-[500px]">
            <CardHeader className="text-center pb-4 px-6 pt-6">
              <div className="mx-auto mb-3 w-16 h-16 rounded-2xl flex items-center justify-center">
                <img 
                  src="/images/pixcraftai-icon.svg" 
                  alt="Pixcraftai Icon" 
                  className="w-16 h-16"
                />
              </div>
              <CardTitle className="text-xl font-bold text-white mb-2">Pixcraftai</CardTitle>
              <p className="text-gray-400 text-sm">অটোমেশন স্ক্রিপ্ট ও AI টুলস</p>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">১. AI দিয়ে ইমেজ জেনারেশন (কমার্শিয়াল লাইসেন্স)</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">২. ChatGPT (আনলিমিটেড ব্যবহার)</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">৩. মেটাডেটা জেনারেশন, ইমেজ আপস্কেলার ও ব্যাকগ্রাউন্ড রিমুভার</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">৪. ১,০০০ টাকার এনভাটোমার্কেট ব্যাকগ্রাউন্ড রিমুভার</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">৫. লিমিট ডেভেলপমেন্ট</span>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                {/* How It Works Button */}
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 text-sm rounded-lg transition-all duration-300 transform hover:scale-105"
                  onClick={() => window.open('https://youtu.be/hGPWbIPJSXc?si=J0BP0YkmieGuouey', '_blank')}
                >
                  <span className="flex items-center justify-center">
                    <Play className="w-3 h-3 mr-1" />
                    Watch Now
                  </span>
                </Button>
                
                {/* Buy Now Button */}
                <Button 
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-2 text-sm rounded-lg transition-all duration-300 transform hover:scale-105"
                  onClick={() => window.open('https://pixcraftai.paymently.io/paymentlink/pay/h7w3lr5WK9kO5cnYlIo9mYHTChODMOgABKxxRxRQ', '_blank')}
                >
                  Buy Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Fourth Demo Box - Design Tools */}
          <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl min-h-[500px]">
            <CardHeader className="text-center pb-4 px-6 pt-6">
              <div className="mx-auto mb-3 w-16 h-16 rounded-2xl flex items-center justify-center">
                <img 
                  src="/images/design-tools-icon.svg" 
                  alt="Design Tools Icon" 
                  className="w-16 h-16"
                />
              </div>
              <CardTitle className="text-xl font-bold text-white mb-2">Professional Design Tools</CardTitle>
              <p className="text-gray-400 text-sm">ডিজাইনের জন্য প্রফেশনাল টুলস</p>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">১. অ্যাডভান্সড ডিজাইন টুলস ও টেমপ্লেট</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">২. কালার প্যালেট ও গ্রাডিয়েন্ট জেনারেটর</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">৩. ভেক্টর এডিটিং ও ইলাস্ট্রেশন টুলস</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">৪. টাইপোগ্রাফি ও ফন্ট ম্যানেজমেন্ট</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">৫. প্রিমিয়াম ডিজাইন রিসোর্স</span>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                {/* How It Works Button */}
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 text-sm rounded-lg transition-all duration-300 transform hover:scale-105"
                  onClick={() => window.open('https://youtu.be/hGPWbIPJSXc?si=J0BP0YkmieGuouey', '_blank')}
                >
                  <span className="flex items-center justify-center">
                    <Play className="w-3 h-3 mr-1" />
                    Watch Now
                  </span>
                </Button>
                
                {/* Buy Now Button */}
                <Button 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 text-sm rounded-lg transition-all duration-300 transform hover:scale-105"
                  onClick={() => window.open('https://pixcraftai.paymently.io/paymentlink/pay/h7w3lr5WK9kO5cnYlIo9mYHTChODMOgABKxxRxRQ', '_blank')}
                >
                  Buy Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Fifth Demo Box - Video Editor */}
          <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl min-h-[500px]">
            <CardHeader className="text-center pb-4 px-6 pt-6">
              <div className="mx-auto mb-3 w-16 h-16 rounded-2xl flex items-center justify-center">
                <img 
                  src="/images/video-editor-icon.svg" 
                  alt="Video Editor Icon" 
                  className="w-16 h-16"
                />
              </div>
              <CardTitle className="text-xl font-bold text-white mb-2">Advanced Video Editor</CardTitle>
              <p className="text-gray-400 text-sm">প্রফেশনাল ভিডিও এডিটিং সলিউশন</p>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">১. 4K ভিডিও এডিটিং ও রেন্ডারিং</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">২. অ্যাডভান্সড ইফেক্টস ও ট্রানজিশন</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">৩. অডিও মিক্সিং ও সাউন্ড ডিজাইন</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">৪. কালার গ্রেডিং ও কারেকশন</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">৫. মাল্টি-ফরম্যাট এক্সপোর্ট সাপোর্ট</span>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                {/* How It Works Button */}
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 text-sm rounded-lg transition-all duration-300 transform hover:scale-105"
                  onClick={() => window.open('https://youtu.be/hGPWbIPJSXc?si=J0BP0YkmieGuouey', '_blank')}
                >
                  <span className="flex items-center justify-center">
                    <Play className="w-3 h-3 mr-1" />
                    Watch Now
                  </span>
                </Button>
                
                {/* Buy Now Button */}
                <Button 
                  className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-2 text-sm rounded-lg transition-all duration-300 transform hover:scale-105"
                  onClick={() => window.open('https://pixcraftai.paymently.io/paymentlink/pay/h7w3lr5WK9kO5cnYlIo9mYHTChODMOgABKxxRxRQ', '_blank')}
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