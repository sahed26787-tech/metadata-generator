import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Play, Video, MessageCircle } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/context/AuthContext';

const AutomationScripts: React.FC = () => {
  const { profile } = useAuth();
  const remainingCredits = profile?.is_premium ? '∞' : profile ? `${Math.max(0, 5 - profile.credits_used)}` : '0';

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
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            <span className="text-orange-500">PixcraftAI-এর সার্ভিসসীমীর</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            সৃজনশীলতা ও ডিজিটাল সমাধানের জন্য আপনার বিশ্বস্ত সহায়ক
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-[1400px] mx-auto">
          
          {/* First Box - Pixcraftai (previously 3rd) */}
          <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl flex flex-col h-[500px]">
            <CardHeader className="text-center pb-4 px-6 pt-6">
              <div className="mx-auto mb-3 w-16 h-16 rounded-2xl flex items-center justify-center">
                <img 
                  src="/images/pixcraftai-icon.svg" 
                  alt="Pixcraftai Icon" 
                  className="w-16 h-16"
                />
              </div>
              <CardTitle className="text-xl font-bold text-white mb-2">Pixcraftai</CardTitle>
              <p className="text-gray-400 text-sm">আনলিমিটেড ছবি তৈরি করতে পারবেন।</p>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 px-6 pb-6">
              <div className="space-y-3 flex-1">
                <div className="flex items-start space-x-3">
                   <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                   <span className="text-gray-300 text-sm leading-relaxed">AI দিয়ে ইমেজ জেনারেশন (কমার্শিয়াল লাইসেন্স)</span>
                 </div>
                 <div className="flex items-start space-x-3">
                   <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                   <span className="text-gray-300 text-sm leading-relaxed">ChatGPT (আনলিমিটেড ব্যবহার)</span>
                 </div>
                 <div className="flex items-start space-x-3">
                   <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                   <span className="text-gray-300 text-sm leading-relaxed">মেটাডেটা জেনারেশন, ইমেজ আপস্কেলার ও ব্যাকগ্রাউন্ড রিমুভার</span>
                 </div>
                 <div className="flex items-start space-x-3">
                   <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                   <span className="text-gray-300 text-sm leading-relaxed">লিমিট ডেভেলপমেন্ট</span>
                 </div>
              </div>
              
              <div className="pt-4 flex flex-row gap-3 mt-auto">
                  {/* How It Works Button */}
                  <Button 
                    className="flex-1 text-white font-semibold py-2 text-sm rounded-lg transition-all duration-300 transform hover:scale-105"
                    style={{ backgroundColor: '#FF4C4C' }}
                    onClick={() => window.open('https://youtu.be/BHR5tTtFG5E?si=qYDYFzUbGAZJM1ir', '_blank')}
                  >
                    <span className="flex items-center justify-center">
                      <Play className="w-3 h-3 mr-1" />
                      Watch Now
                    </span>
                  </Button>
                  
                  {/* Buy Now Button */}
                  <Button 
                    className="flex-1 text-white font-semibold py-2 text-sm rounded-lg transition-all duration-300 transform hover:scale-105"
                    style={{ backgroundColor: '#4CAF50' }}
                    onClick={() => window.open('https://pixcraftai.com/', '_blank')}
                  >
                    Buy Now
                  </Button>
                </div>
            </CardContent>
          </Card>

          {/* Second Box - Website Builder (previously 4th) */}
          <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl flex flex-col h-[500px]">
            <CardHeader className="text-center pb-4 px-6 pt-6">
              <div className="mx-auto mb-3 w-16 h-16 rounded-2xl flex items-center justify-center">
                <img 
                  src="/images/website-builder-icon.svg" 
                  alt="Website Builder Icon" 
                  className="w-16 h-16"
                />
              </div>
              <CardTitle className="text-xl font-bold text-white mb-2">Build Any Types of Website</CardTitle>
              <p className="text-gray-400 text-sm">বিজনেস সাইট, ই-কমার্স, পোর্টফোলিও, ব্লগ বা কাস্টম ওয়েব অ্যাপ — দ্রুত, রেসপনসিভ এবং SEO-ফ্রেন্ডলি</p>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 px-6 pb-6">
               <div className="space-y-3 flex-1">
                 <div className="flex items-start space-x-3">
                   <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                   <span className="text-gray-300 text-sm leading-relaxed">সম্পূর্ণ রেসপনসিভ ডিজাইন (মোবাইল, ট্যাব, ডেস্কটপে মানানসই)</span>
                 </div>
                 <div className="flex items-start space-x-3">
                   <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                   <span className="text-gray-300 text-sm leading-relaxed">দ্রুত লোডিং ও অপটিমাইজড পারফরম্যান্স</span>
                 </div>
                 <div className="flex items-start space-x-3">
                   <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                   <span className="text-gray-300 text-sm leading-relaxed">SEO-ফ্রেন্ডলি স্ট্রাকচার ও সেটআপ</span>
                 </div>
                 <div className="flex items-start space-x-3">
                   <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                   <span className="text-gray-300 text-sm leading-relaxed">সহজে কাস্টমাইজযোগ্য ডিজাইন ও কনটেন্ট</span>
                 </div>
                 <div className="flex items-start space-x-3">
                   <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                   <span className="text-gray-300 text-sm leading-relaxed">নিরাপদ ও আধুনিক ওয়েব টেকনোলজি ব্যবহার</span>
                 </div>
               </div>
              
              <div className="pt-4 flex flex-row gap-3 mt-auto">
                {/* Portfolio Button */}
                <Button 
                  className="flex-1 text-white font-semibold py-2 text-sm rounded-lg transition-all duration-300 transform hover:scale-105"
                  style={{ backgroundColor: '#FF4C4C' }}
                  onClick={() => window.open('https://pixcraftai.com/', '_blank')}
                >
                  Portfolio
                </Button>
                
                {/* Order Now Button */}
                <Button 
                  className="flex-1 text-white font-semibold py-2 text-sm rounded-lg transition-all duration-300 transform hover:scale-105"
                  style={{ backgroundColor: '#4CAF50' }}
                  onClick={() => window.open('https://wa.me/8801335556641', '_blank')}
                >
                  Order Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Third Box - Auto PSD & EPS Scripts (previously 1st) */}
          <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl flex flex-col h-[500px]">
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
            <CardContent className="flex flex-col flex-1 px-6 pb-6">
              <div className="space-y-3 flex-1">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">ফটোশপের মাধ্যমে এক ক্লিকে আনলিমিটেড JPG/PNG ফাইলকে PSD ফরম্যাটে কনভার্ট করতে পারবেন।</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">PSD ফাইলের জন্য কাস্টমাইজ JPG প্রিভিউ তৈরি করতে পারবেন।</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">অ্যাডোব ইলাস্ট্রেটরের মাধ্যমে এক ক্লিকে আনলিমিটেড SVG ফাইলকে EPS 10 ফরম্যাট এবং JPG ফাইলে তৈরি করতে পারবেন।</span>
                </div>
              </div>
              
              <div className="pt-4 flex flex-row gap-3 mt-auto">
                 {/* How It Works Button */}
                 <Button 
                   className="flex-1 text-white font-semibold py-2 text-sm rounded-lg transition-all duration-300 transform hover:scale-105"
                   style={{ backgroundColor: '#FF4C4C' }}
                   onClick={() => window.open('https://youtu.be/IgxtKon5brg?si=APB-CO4p80mUcGSK', '_blank')}
                 >
                   <span className="flex items-center justify-center">
                     <Play className="w-3 h-3 mr-1" />
                     Watch Now
                   </span>
                 </Button>
                 
                 {/* Buy Now Button */}
                 <Button 
                   className="flex-1 text-white font-semibold py-2 text-sm rounded-lg transition-all duration-300 transform hover:scale-105"
                   style={{ backgroundColor: '#4CAF50' }}
                   onClick={() => window.open('https://pixcraftai.paymently.io/paymentlink/pay/7IRKlEWtpLMoGUkV4CmqG2hLH16yNhH1acUsJC72', '_blank')}
                 >
                   Buy Now
                 </Button>
               </div>
            </CardContent>
          </Card>

          {/* Fourth Box - Auto EPS Bundle & Coloring Maker Script (previously 2nd) */}
          <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl flex flex-col h-[500px]">
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
            <CardContent className="flex flex-col flex-1 px-6 pb-6">
              <div className="space-y-3 flex-1">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">ইলাস্ট্রেটর এ অটোমেটিক কালারিং এর জন্য ফাইল তৈরি করতে পারবেন।</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">ইলাস্ট্রেটর এ অটোমেটিক বান্ডেবল তৈরি করতে পারবেন।</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">এক ক্লিকে ফাইল এক্সপোর্ট করতে পারবেন।</span>
                </div>
              </div>
              
              <div className="pt-4 flex flex-row gap-3 mt-auto">
                <Button 
                  className="flex-1 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 hover:opacity-90"
                  style={{ backgroundColor: '#FF4C4C' }}
                  onClick={() => window.open('https://youtu.be/IgxtKon5brg?si=APB-CO4p80mUcGSK', '_blank')}
                >
                  ▶ Watch Now
                </Button>
                <Button 
                  className="flex-1 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 hover:opacity-90"
                  style={{ backgroundColor: '#4CAF50' }}
                  onClick={() => window.open('https://pixcraftai.paymently.io/paymentlink/pay/7IRKlEWtpLMoGUkV4CmqG2hLH16yNhH1acUsJC72', '_blank')}
                >
                  Buy Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Fifth Box - Video Editing & Poster Design */}
          <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl flex flex-col h-[500px]">
            <CardHeader className="text-center pb-4 px-6 pt-6">
              <div className="mx-auto mb-3 w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center">
                <Video className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-white mb-2">Video Editing & Poster Design</CardTitle>
              <p className="text-gray-400 text-sm">প্রফেশনাল ভিডিও এডিটিং এবং পোস্টার ডিজাইনের সম্পূর্ণ কোর্স</p>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 px-6 pb-6">
              <div className="space-y-3 flex-1">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">সব ধরনের ভিডিও এডিট করতে পারবেন, প্রিমিয়ার প্রো, এফটার ইফেক্ট এবং ফটোশপ দিয়ে।</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">কমার্শিয়াল এবং ইউটিউব ভিডিও এডিটিং শিখতে পারবেন।</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">অ্যাডোব ইলাস্ট্রেটর এবং ফটোশপ দিয়ে প্রফেশনাল পোস্টার ডিজাইন শিখতে পারবেন।</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">ফ্রিল্যান্সিং এর জন্য প্রয়োজনীয় সব টিপস এবং ট্রিকস।</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">প্রিমিয়াম টেমপ্লেট এবং রিসোর্স ফাইল পাবেন।</span>
                </div>
              </div>
              
              <div className="pt-4 flex flex-row gap-3 mt-auto">
                {/* Portfolio Button */}
                <Button 
                  className="flex-1 text-white font-semibold py-2 text-sm rounded-lg transition-all duration-300 transform hover:scale-105"
                  style={{ backgroundColor: '#FF4C4C' }}
                  onClick={() => window.open('https://www.behance.net/pixcraftai', '_blank')}
                >
                  Portfolio
                </Button>
                
                {/* Order Now Button */}
                <Button 
                  className="flex-1 text-white font-semibold py-2 text-sm rounded-lg transition-all duration-300 transform hover:scale-105"
                  style={{ backgroundColor: '#4CAF50' }}
                  onClick={() => window.open('https://pixcraftai.paymently.io/paymentlink/pay/7IRKlEWtpLMoGUkV4CmqG2hLH16yNhH1acUsJC72', '_blank')}
                >
                  Order Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sixth Box - Messenger Chat Automation */}
          <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl flex flex-col h-[500px]">
            <CardHeader className="text-center pb-4 px-6 pt-6">
              <div className="mx-auto mb-3 w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-white mb-2">Messenger Chat Automation</CardTitle>
              <p className="text-gray-400 text-sm">স্মার্ট চ্যাটবট এবং অটোমেশন সিস্টেম - ২৪/৭ কাস্টমার সাপোর্ট</p>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 px-6 pb-6">
              <div className="space-y-3 flex-1">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">অটো রিপ্লাই ও কাস্টম মেসেজ সেটআপ</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">২৪/৭ চ্যাট সাপোর্ট সিস্টেম</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">কাস্টমার ডেটা ম্যানেজমেন্ট ও অ্যানালিটিক্স</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">ইন্টিগ্রেশন সাপোর্ট ও কাস্টমাইজেশন</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">লিড জেনারেশন ও বিজনেস অটোমেশন সিস্টেম</span>
                </div>
              </div>
              
              <div className="pt-4 flex flex-row gap-3 mt-auto">
                {/* Check Button */}
                <Button 
                  className="flex-1 text-white font-semibold py-2 text-sm rounded-lg transition-all duration-300 transform hover:scale-105"
                  style={{ backgroundColor: '#FF4C4C' }}
                  onClick={() => window.open('https://m.me/pixcraftai1', '_blank')}
                >
                  Check
                </Button>
                
                {/* Order Now Button */}
                <Button 
                  className="flex-1 text-white font-semibold py-2 text-sm rounded-lg transition-all duration-300 transform hover:scale-105"
                  style={{ backgroundColor: '#4CAF50' }}
                  onClick={() => window.open('https://pixcraftai.paymently.io/paymentlink/pay/7IRKlEWtpLMoGUkV4CmqG2hLH16yNhH1acUsJC72', '_blank')}
                >
                  Order Now
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