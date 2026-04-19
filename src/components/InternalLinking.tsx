import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ExternalLink, Sparkles, Image, Zap, Target, BookOpen, HelpCircle } from 'lucide-react';

const InternalLinking: React.FC = () => {
  const internalLinks = [
    {
      category: "AI Image Generation",
      icon: <Sparkles className="w-5 h-5" />,
      links: [
        { title: "AI Image Generator", url: "#ai-generator", description: "Create stunning AI-generated images" },
        { title: "Text to Image AI", url: "#text-to-image", description: "Transform text into visual content" },
        { title: "Batch Image Processing", url: "#batch-processing", description: "Process multiple images simultaneously" },
        { title: "AI Art Creator", url: "#ai-art", description: "Generate artistic visuals with AI" }
      ]
    },
    {
      category: "Social Media Optimization",
      icon: <Target className="w-5 h-5" />,
      links: [
        { title: "Instagram Image Optimizer", url: "#instagram-optimizer", description: "Perfect images for Instagram posts and stories" },
        { title: "Facebook Image Sizes", url: "#facebook-sizes", description: "Optimize for Facebook posts and ads" },
        { title: "Twitter Image Generator", url: "#twitter-generator", description: "Create Twitter-optimized visuals" },
        { title: "LinkedIn Visual Creator", url: "#linkedin-creator", description: "Professional images for LinkedIn" }
      ]
    },
    {
      category: "Features & Tools",
      icon: <Zap className="w-5 h-5" />,
      links: [
        { title: "Platform Selector", url: "#platform-selector", description: "Choose your target social media platforms" },
        { title: "Generation Modes", url: "#generation-modes", description: "Different AI generation options" },
        { title: "Image Uploader", url: "#image-uploader", description: "Upload and process your images" },
        { title: "Results Display", url: "#results-display", description: "View and manage generated images" }
      ]
    },
    {
      category: "Learning Resources",
      icon: <BookOpen className="w-5 h-5" />,
      links: [
        { title: "AI Image Generation Guide", url: "#guide", description: "Complete guide to AI image creation" },
        { title: "Prompt Engineering Tips", url: "#prompt-tips", description: "Master the art of AI prompts" },
        { title: "Social Media Best Practices", url: "#best-practices", description: "Optimize your social media strategy" },
        { title: "Video Tutorials", url: "#tutorials", description: "Step-by-step video guides" }
      ]
    },
    {
      category: "Support & Help",
      icon: <HelpCircle className="w-5 h-5" />,
      links: [
        { title: "FAQ", url: "#faq", description: "Frequently asked questions" },
        { title: "Getting Started", url: "#getting-started", description: "Quick start guide for beginners" },
        { title: "API Documentation", url: "#api-docs", description: "Developer resources and API" },
        { title: "Contact Support", url: "#support", description: "Get help from our team" }
      ]
    }
  ];

  const popularPages = [
    { title: "AI Image Generator Free", url: "#free-generator", visits: "50K+ monthly" },
    { title: "Social Media Image Creator", url: "#social-creator", visits: "35K+ monthly" },
    { title: "Batch Image Processing", url: "#batch-processing", visits: "28K+ monthly" },
    { title: "AI Art Generator", url: "#art-generator", visits: "42K+ monthly" },
    { title: "Instagram Story Creator", url: "#instagram-stories", visits: "31K+ monthly" },
    { title: "Marketing Visual Creator", url: "#marketing-visuals", visits: "25K+ monthly" }
  ];

  const relatedTools = [
    { title: "Image Resizer", description: "Resize images for different platforms" },
    { title: "Background Remover", description: "Remove backgrounds with AI" },
    { title: "Color Palette Generator", description: "Extract colors from images" },
    { title: "Image Compressor", description: "Optimize image file sizes" },
    { title: "Format Converter", description: "Convert between image formats" },
    { title: "Watermark Creator", description: "Add watermarks to images" }
  ];

  return (
    <section className="py-12 bg-gray-50 dark:bg-slate-800">
      <div className="container mx-auto px-4">
        {/* Main Navigation Links */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Explore TimesCraft AI Features
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internalLinks.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      {category.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {category.category}
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {category.links.map((link, linkIndex) => (
                      <a
                        key={linkIndex}
                        href={link.url}
                        className="block group hover:bg-gray-50 dark:hover:bg-slate-700 p-2 rounded-lg transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                              {link.title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {link.description}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                        </div>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Popular Pages */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Most Popular Features
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularPages.map((page, index) => (
              <a
                key={index}
                href={page.url}
                className="group block p-4 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {page.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {page.visits}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Related Tools */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Related AI Tools
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedTools.map((tool, index) => (
              <div
                key={index}
                className="group p-4 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg">
                    <Image className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tool.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {tool.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SEO Footer Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Access Links
            </h4>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {[
                "AI Image Generator", "Text to Image", "Social Media Creator", "Batch Processing",
                "Instagram Optimizer", "Facebook Images", "Twitter Graphics", "LinkedIn Visuals",
                "AI Art Creator", "Marketing Images", "Brand Visuals", "Content Creator",
                "Image Resizer", "Background Remover", "Format Converter", "API Access"
              ].map((link, index) => (
                <a
                  key={index}
                  href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InternalLinking;