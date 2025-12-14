import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Play, Video, MessageCircle, Info } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/context/AuthContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const AutomationScripts: React.FC = () => {
  const { profile } = useAuth();
  const remainingCredits = profile?.is_premium ? '∞' : profile ? `${Math.max(0, 5 - profile.credits_used)}` : '0';

  return (
    <div className="bg-[#171717] flex flex-col min-h-screen">
      <AppHeader
        remainingCredits={remainingCredits}
        apiKey=""
        onApiKeyChange={() => {}}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 flex-1">
        {/* Main Heading Section */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl lg:text-4xl font-bold text-[#1F71DC] mb-6 leading-tight">
            PixcraftAI এর আলাদা সেবাসমূহ:
          </h1>
          <p className="text-lg md:text-xl text-white max-w-4xl mx-auto leading-relaxed">
            আপনার প্রয়োজন অনুযায়ী ব্যবহার করুন
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-[1100px] mx-auto">
          
          {/* First Box - Pixcraftai */}
          <Card className="bg-[#212121] border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl flex flex-col min-h-[440px]">
            <CardHeader className="text-center pb-2 px-4 pt-4">
              <div className="mx-auto mb-2 w-14 h-14 rounded-2xl flex items-center justify-center">
                <img 
                  src="/images/pixcraftai-icon.svg" 
                  alt="Pixcraftai Icon" 
                  className="w-14 h-14"
                />
              </div>
              <CardTitle className="text-xl md:text-2xl font-bold text-white mb-1">Pixcraftai</CardTitle>
              <p className="text-white text-xs md:text-sm font-medium mt-6">আনলিমিটেড ইমেজ, এবং AI মডেল ব্যবহার করুন</p>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 px-4 pb-4">
              <div className="space-y-3 flex-1 mt-8">
                 <div className="flex items-start space-x-3">
                   <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                   <span className="text-gray-300 text-xs md:text-sm leading-relaxed mt-1">আনলিমিটেড ছবি তৈরি করতে পারবেন</span>
                   <Tooltip>
                     <TooltipTrigger asChild>
                       <Info className="w-4 h-4 text-gray-400 mt-0.5 cursor-help" />
                     </TooltipTrigger>
                     <TooltipContent side="right" className="text-xs">
                       240-480s per image
                     </TooltipContent>
                   </Tooltip>
                 </div>
                 <div className="flex items-start space-x-3">
                   <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                   <span className="text-gray-300 text-xs md:text-sm leading-relaxed mt-1">API key সেটআপ না করেই metadata তৈরি করতে পারবেন</span>
                 </div>
                 <div className="flex items-start space-x-3">
                   <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                   <span className="text-gray-300 text-xs md:text-sm leading-relaxed mt-1">ইমেজ আপস্কেলার অথবা ব্যাকগ্রাউন্ড রিমুভ করতে পারবেন</span>
                 </div>
                 <div className="flex items-start space-x-3">
                   <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                   <span className="text-gray-300 text-xs md:text-sm leading-relaxed mt-1">ভিডিও তৈরি করতে পারবেন</span>
                 </div>
              </div>
              
              <div className="pt-0 -mt-2">
                <div className="text-center">
                  <span className="text-white font-semibold text-lg">300Tk/Month</span>
                </div>
                <div className="flex flex-row gap-3 mt-1">
                  <Button 
                    className="flex-1 text-white font-semibold py-1 text-[11px] md:text-xs px-2 rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    style={{ backgroundColor: '#171717' }}
                    onClick={() => window.open('https://youtu.be/BHR5tTtFG5E?si=qYDYFzUbGAZJM1ir', '_blank')}
                  >
                    <span className="flex items-center justify-center">
                      <Play className="w-3 h-3 mr-1" />
                      Watch Now
                    </span>
                  </Button>
                  
                  <Button 
                    className="flex-1 text-black font-semibold py-1 text-[11px] md:text-xs px-2 rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    style={{ backgroundColor: '#ffffff' }}
                    onClick={() => window.open('https://pixcraftai.com/', '_blank')}
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Second Box - Auto EPS Bundle & Coloring Maker Script (moved here) */}
          <Card className="bg-[#212121] border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl flex flex-col min-h-[440px]">
            <CardHeader className="text-center pb-2 px-4 pt-4">
              <div className="mx-auto mb-2 w-14 h-14 rounded-2xl flex items-center justify-center">
                <img 
                  src="/images/eps-bundle-icon.svg" 
                  alt="EPS Bundle Icon" 
                  className="w-14 h-14"
                />
              </div>
              <CardTitle className="text-lg md:text-xl font-bold text-white mb-1 whitespace-nowrap">EPS Bundle & Coloring Maker Script</CardTitle>
              <p className="text-white text-xs md:text-sm font-medium mt-6">লাইফটাইমের জন্য ব্যবহার করতে পারবেন।</p>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 px-4 pb-4">
              <div className="space-y-3 flex-1 mt-8">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-xs md:text-sm leading-relaxed">ইলাস্ট্রেটর এ অটোমেটিক কালারিং এর জন্য ফাইল তৈরি করতে পারবেন।</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-xs md:text-sm leading-relaxed">ইলাস্ট্রেটরে একসাথে অনেকগুলি অটোমেটিক্যালি বান্ডেল ফাইল তৈরি করতে পারবেন।</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-xs md:text-sm leading-relaxed">এক ক্লিকে ফাইল এক্সপোর্ট করতে পারবেন।</span>
                </div>
              </div>
              
              <div className="pt-0 -mt-6">
                <div className="text-center">
                  <span className="text-white font-semibold text-lg">200Tk/Permanent</span>
                </div>
                <div className="flex flex-row gap-3 mt-1">
                <Button 
                  className="flex-1 text-white font-semibold py-1 text-[11px] md:text-xs px-2 rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  style={{ backgroundColor: '#171717' }}
                  onClick={() => window.open('https://youtu.be/IgxtKon5brg?si=APB-CO4p80mUcGSK', '_blank')}
                >
                  <span className="flex items-center justify-center">
                    <Play className="w-3 h-3 mr-1" />
                    Watch Now
                  </span>
                </Button>
                <Button 
                  className="flex-1 text-black font-semibold py-1 text-[11px] md:text-xs px-2 rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  style={{ backgroundColor: '#ffffff' }}
                  onClick={() => window.open('https://pg.eps.com.bd/PaymentLink?id=3AF30A52', '_blank')}
                >
                  Buy Now
                </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Third Box - Auto PSD & EPS Scripts */}
          <Card className="bg-[#212121] border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl flex flex-col min-h-[440px]">
            <CardHeader className="text-center pb-2 px-4 pt-4">
              <div className="mx-auto mb-2 w-14 h-14 rounded-2xl flex items-center justify-center">
                <img 
                  src="/images/automation-script-icon.svg" 
                  alt="Automation Script Icon" 
                  className="w-14 h-14"
                />
              </div>
              <CardTitle className="text-lg md:text-xl font-bold text-white mb-1 whitespace-nowrap">IMAGE to PSD & SVG to EPS Script</CardTitle>
              <p className="text-white text-xs md:text-sm font-medium mt-6">লাইফটাইমের জন্য ব্যবহার করতে পারবেন।</p>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 px-4 pb-4">
              <div className="space-y-3 flex-1 mt-10">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-xs md:text-sm leading-relaxed">আনলিমিটেড JPG/PNG ফাইলকে PSD ফরম্যাটে কনভার্ট করতে পারবেন।</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-xs md:text-sm leading-relaxed">PSD ফাইলের জন্য কাস্টমাইজ JPG প্রিভিউ তৈরি করতে পারবেন।</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-xs md:text-sm leading-relaxed">আনলিমিটেড SVG ফাইলকে EPS 10 ফরম্যাট এবং JPG ফাইলে রূপান্তর করতে পারবেন।</span>
                </div>
              </div>
              
              <div className="pt-0 -mt-6">
                <div className="text-center">
                  <span className="text-white font-semibold text-lg">200Tk/Permanent</span>
                </div>
                <div className="flex flex-row gap-3 mt-1">
                 <Button 
                   className="flex-1 text-white font-semibold py-1 text-[11px] md:text-xs px-2 rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                   style={{ backgroundColor: '#171717' }}
                   onClick={() => window.open('https://youtu.be/IgxtKon5brg?si=APB-CO4p80mUcGSK', '_blank')}
                 >
                   <span className="flex items-center justify-center">
                     <Play className="w-3 h-3 mr-1" />
                     Watch Now
                   </span>
                 </Button>
                 
                 <Button 
                   className="flex-1 text-black font-semibold py-1 text-[11px] md:text-xs px-2 rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                   style={{ backgroundColor: '#ffffff' }}
                   onClick={() => window.open('https://pg.eps.com.bd/PaymentLink?id=3AF30A52', '_blank')}
                 >
                   Buy Now
                 </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fourth Box - Website Builder (moved here) */}
          <Card className="bg-[#212121] border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl flex flex-col min-h-[440px]">
            <CardHeader className="text-center pb-2 px-4 pt-4">
              <div className="mx-auto mb-2 w-14 h-14 rounded-2xl flex items-center justify-center">
                <img 
                  src="/images/website-builder-icon.svg" 
                  alt="Website Builder Icon" 
                  className="w-14 h-14"
                />
              </div>
              <CardTitle className="text-xl md:text-2xl font-bold text-white mb-1">Build Any Types of Website</CardTitle>
              <p className="text-white text-xs md:text-sm font-medium mt-6">বিজনেস সাইট, ই-কমার্স, পোর্টফোলিও, ব্লগ বা যেকোনো কাস্টম ওয়েব অ্যাপ তৈরি করুন</p>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 px-4 pb-4">
              <div className="space-y-3 flex-1 mt-8">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-xs md:text-sm leading-relaxed">ওয়ান পেইজ টুলস, ই-কমার্স, ব্লগিং, নিউজ ওয়েবসাইটসহ যেকোনো ধরনের সাইট (বেটিং সাইট ব্যতীত) তৈরি করতে পারবেন</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-xs md:text-sm leading-relaxed">৭ দিন পর্যন্ত ফ্রি রিভিশন</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-xs md:text-sm leading-relaxed">রেসপনসিভ ডিজাইন (মোবাইল, ট্যাব, ডেস্কটপে মানানসই)</span>
                </div>
              </div>
              
              <div className="pt-3 mt-2">
                <div className="flex flex-row gap-3 mt-2">
                  <Button 
                    className="flex-1 text-white font-semibold py-1 text-[11px] md:text-xs px-2 rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    style={{ backgroundColor: '#171717' }}
                    onClick={() => window.open('https://pixcraftai.com/', '_blank')}
                  >
                    <span className="flex items-center justify-center">Portfolio</span>
                  </Button>
                  
                  <Button 
                    className="flex-1 text-black font-semibold py-1 text-[11px] md:text-xs px-2 rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    style={{ backgroundColor: '#ffffff' }}
                    onClick={() => window.open('https://wa.me/8801335556641', '_blank')}
                  >
                    Contract Us
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fifth Box - Video Editing & Poster Design */}
          <Card className="bg-[#212121] border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl flex flex-col min-h-[440px]">
            <CardHeader className="text-center pb-2 px-4 pt-4">
              <div className="mx-auto mb-2 w-14 h-14 rounded-2xl flex items-center justify-center">
                <img 
                  src="/images/video-editor-icon.svg" 
                  alt="Video Editor Icon" 
                  className="w-14 h-14"
                />
              </div>
              <CardTitle className="text-xl md:text-2xl font-bold text-white mb-1">Video Editing & Poster Design</CardTitle>
              <p className="text-white text-xs md:text-sm font-medium mt-6">ভিডিও এডিটিং অথবা থাম্বনেইল ডিজাইন করুন</p>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 px-4 pb-4">
              <div className="space-y-3 flex-1 mt-8">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-xs md:text-sm leading-relaxed">YouTube লং ভিডিও এবং শর্টস ভিডিও এডিটিং</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-xs md:text-sm leading-relaxed">কাস্টম পোস্টার ও থাম্বনেইল ডিজাইন সেবা</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-xs md:text-sm leading-relaxed">৩টি ফ্রি রিভিশন অন্তর্ভুক্ত</span>
                </div>
                
              </div>
              
              <div className="pt-3 mt-2">
                <div className="flex flex-row gap-3 mt-2">
                <Button 
                  className="flex-1 text-white font-semibold py-1 text-[11px] md:text-xs px-2 rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  style={{ backgroundColor: '#171717' }}
                  onClick={() => window.open('https://m.me/pixcraftai1', '_blank')}
                >
                  <span className="flex items-center justify-center">Portfolio</span>
                </Button>
                
                <Button 
                  className="flex-1 text-black font-semibold py-1 text-[11px] md:text-xs px-2 rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  style={{ backgroundColor: '#ffffff' }}
                  onClick={() => window.open('https://wa.me/8801335556641', '_blank')}
                >
                  Contract Us
                </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sixth Box - Messenger Chat Automation */}
          <Card className="bg-[#212121] border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl flex flex-col min-h-[440px]">
            <CardHeader className="text-center pb-2 px-4 pt-4">
              <div className="mx-auto mb-2 w-14 h-14 rounded-2xl flex items-center justify-center">
                <img 
                  src="/images/messenger-chat-icon.svg" 
                  alt="Messenger Chat Icon" 
                  className="w-14 h-14"
                />
              </div>
              <CardTitle className="text-xl md:text-2xl font-bold text-white mb-1">Messenger Chat Automation</CardTitle>
              <p className="text-white text-xs md:text-sm font-medium mt-6">স্মার্ট চ্যাটবট এবং অটোমেশন সিস্টেম - ২৪/৭ কাস্টমার সাপোর্ট</p>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 px-4 pb-4">
              <div className="space-y-3 flex-1 mt-8">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-xs md:text-sm leading-relaxed">অটো রিপ্লাই ও কাস্টম মেসেজ সেটআপ</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-xs md:text-sm leading-relaxed">২৪/৭ চ্যাট সাপোর্ট সিস্টেম</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-xs md:text-sm leading-relaxed">কাস্টমার ডেটা ম্যানেজমেন্ট ও অ্যানালিটিক্স</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-xs md:text-sm leading-relaxed">ইন্টিগ্রেশন সাপোর্ট ও কাস্টমাইজেশন</span>
                </div>
                
              </div>
              
              <div className="pt-0 mt-2">
                <div className="flex flex-row gap-3 mt-1">
                <Button 
                  className="flex-1 text-white font-semibold py-1 text-[11px] md:text-xs px-2 rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  style={{ backgroundColor: '#171717' }}
                  onClick={() => window.open('https://m.me/pixcraftai1', '_blank')}
                >
                  <span className="flex items-center justify-center">Portfolio</span>
                </Button>
                
                <Button 
                  className="flex-1 text-black font-semibold py-1 text-[11px] md:text-xs px-2 rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  style={{ backgroundColor: '#ffffff' }}
                  onClick={() => window.open('https://wa.me/8801335556641', '_blank')}
                >
                  Contract Us
                </Button>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default AutomationScripts;
