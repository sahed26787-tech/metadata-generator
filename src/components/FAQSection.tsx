import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp, HelpCircle, Sparkles, Image, Zap, Shield } from 'lucide-react';

const FAQSection: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqs = [
    {
      category: "Getting Started",
      icon: <Sparkles className="w-5 h-5" />,
      questions: [
        {
          question: "What is TimesCraft AI and how does it work?",
          answer: "TimesCraft AI is an advanced AI-powered image generation platform that transforms text descriptions into stunning visual content. Using cutting-edge artificial intelligence and machine learning algorithms, our platform analyzes your text prompts and generates high-quality images optimized for various social media platforms, marketing materials, and professional use cases."
        },
        {
          question: "How do I get started with AI image generation?",
          answer: "Getting started is simple! First, sign up for a free account, then upload an image or enter a text description of what you want to create. Select your target platforms (Instagram, Facebook, Twitter, etc.), choose your generation mode, and let our AI create professional-quality images in seconds. No design experience required!"
        },
        {
          question: "What file formats does TimesCraft AI support?",
          answer: "TimesCraft AI supports a wide range of file formats including JPG, PNG, WebP, SVG, EPS, and even video files. Our platform automatically optimizes images for different social media platforms while maintaining the highest quality standards."
        }
      ]
    },
    {
      category: "AI Image Generation",
      icon: <Image className="w-5 h-5" />,
      questions: [
        {
          question: "How accurate is the AI image generation?",
          answer: "Our AI image generation technology achieves over 95% accuracy in interpreting text prompts and creating relevant visual content. We use advanced machine learning models trained on millions of high-quality images to ensure consistent, professional results that match your creative vision."
        },
        {
          question: "Can I generate images for commercial use?",
          answer: "Yes! All images generated through TimesCraft AI come with commercial usage rights. You can use them for marketing campaigns, social media posts, website content, advertisements, and any other commercial purposes without additional licensing fees."
        },
        {
          question: "What makes TimesCraft AI different from other AI image generators?",
          answer: "TimesCraft AI specializes in social media optimization, offering platform-specific image dimensions, batch processing capabilities, and advanced prompt engineering. Our AI is specifically trained for marketing and social media content, ensuring better engagement rates and professional quality."
        },
        {
          question: "How long does it take to generate an image?",
          answer: "Most images are generated within 3-10 seconds, depending on complexity and current server load. Our batch processing feature allows you to generate multiple images simultaneously, making it perfect for content creators and marketing teams who need to produce large volumes of visual content quickly."
        }
      ]
    },
    {
      category: "Features & Optimization",
      icon: <Zap className="w-5 h-5" />,
      questions: [
        {
          question: "What social media platforms are supported?",
          answer: "TimesCraft AI supports all major social media platforms including Instagram (posts, stories, reels), Facebook (posts, covers, ads), Twitter/X (posts, headers), LinkedIn (posts, banners), Pinterest (pins, boards), TikTok (videos, thumbnails), YouTube (thumbnails, banners), and many more. Each platform has optimized dimensions and formats."
        },
        {
          question: "Can I batch process multiple images at once?",
          answer: "Absolutely! Our batch processing feature allows you to upload multiple images or prompts and generate optimized content for all your selected platforms simultaneously. This saves hours of manual work and ensures consistent branding across all your social media channels."
        },
        {
          question: "How does the platform optimization work?",
          answer: "Our AI automatically adjusts image dimensions, aspect ratios, resolution, and file sizes based on each platform's specific requirements. For example, Instagram posts are optimized to 1080x1080px, while Instagram stories use 1080x1920px, ensuring your content looks perfect on every platform."
        },
        {
          question: "Can I customize the generated images?",
          answer: "Yes! You can refine your prompts, adjust generation parameters, regenerate specific images, and use our advanced editing tools to fine-tune the results. Our platform also learns from your preferences to improve future generations."
        }
      ]
    },
    {
      category: "Pricing & Plans",
      icon: <Shield className="w-5 h-5" />,
      questions: [
        {
          question: "Is there a free plan available?",
          answer: "Yes! We offer a generous free plan that includes 50 image generations per month, access to all basic features, and support for major social media platforms. This is perfect for individuals and small businesses getting started with AI image generation."
        },
        {
          question: "What are the premium plan benefits?",
          answer: "Premium plans include unlimited image generations, priority processing, advanced AI models, batch processing for up to 100 images, commercial usage rights, priority customer support, and access to exclusive features like custom brand templates and API access."
        },
        {
          question: "Can I upgrade or downgrade my plan anytime?",
          answer: "Absolutely! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect immediately, and we offer prorated billing for upgrades and credits for downgrades."
        }
      ]
    },
    {
      category: "Technical Support",
      icon: <HelpCircle className="w-5 h-5" />,
      questions: [
        {
          question: "What if I'm not satisfied with the generated images?",
          answer: "We offer unlimited regenerations and a 30-day money-back guarantee. Our AI learns from feedback, so you can refine prompts and regenerate images until you're completely satisfied. Our support team is also available 24/7 to help optimize your results."
        },
        {
          question: "Is my data and content secure?",
          answer: "Yes! We use enterprise-grade security with end-to-end encryption, secure cloud storage, and strict privacy policies. Your images and prompts are never shared or used for training without explicit permission. We're GDPR compliant and SOC 2 certified."
        },
        {
          question: "Do you offer API access for developers?",
          answer: "Yes! Our RESTful API allows developers to integrate TimesCraft AI's image generation capabilities into their own applications, websites, or workflows. We provide comprehensive documentation, SDKs for popular programming languages, and dedicated developer support."
        },
        {
          question: "How can I get help if I have issues?",
          answer: "We offer multiple support channels: 24/7 live chat, email support, comprehensive documentation, video tutorials, and a community forum. Premium users get priority support with guaranteed response times under 2 hours."
        }
      ]
    }
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Everything you need to know about AI image generation, platform optimization, and getting the most out of TimesCraft AI
            </p>
          </div>
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  {category.icon}
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {category.category}
                </h3>
              </div>

              <div className="space-y-4">
                {category.questions.map((faq, questionIndex) => {
                  const globalIndex = categoryIndex * 100 + questionIndex;
                  const isOpen = openItems.includes(globalIndex);

                  return (
                    <Card key={questionIndex} className="border border-gray-200 dark:border-gray-700">
                      <CardContent className="p-0">
                        <button
                          onClick={() => toggleItem(globalIndex)}
                          className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white pr-4">
                            {faq.question}
                          </h4>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          )}
                        </button>
                        
                        {isOpen && (
                          <div className="px-6 pb-6">
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Additional SEO Content */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Still Have Questions?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Our expert support team is here to help you maximize your AI image generation results. 
              Get personalized assistance with prompt optimization, platform strategies, and advanced features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Contact Support
              </button>
              <button className="px-6 py-3 border border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors font-medium">
                View Documentation
              </button>
            </div>
          </div>
        </div>

        {/* SEO Keywords Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
            <strong>Popular searches:</strong> AI image generator, text to image AI, social media image creator, 
            automated image generation, AI art generator, marketing visual creator, batch image processing, 
            platform-optimized images, AI design tools, content creation automation, visual marketing AI, 
            social media optimization, AI-powered graphics, digital content creator, artificial intelligence art
          </p>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;