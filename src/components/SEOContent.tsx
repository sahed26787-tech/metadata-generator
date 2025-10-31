import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Zap, Target, Award, Users } from 'lucide-react';

const SEOContent: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero SEO Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            AI-Powered Image Metadata Generator
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-gray-300">
            Boost Your Stock Photo Sales with SEO-Optimized Keywords & Descriptions
          </h2>
          <p className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Generate high-converting <strong>SEO metadata</strong>, <strong>keywords</strong>, and <strong>descriptions</strong> for your stock images using advanced AI. 
            Perfect for <strong>Freepik</strong>, <strong>Shutterstock</strong>, <strong>Adobe Stock</strong>, and <strong>Getty Images</strong>. 
            Increase your image sales with professionally optimized titles, tags, and descriptions.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700">
            <div className="flex items-center mb-4">
              <Sparkles className="h-8 w-8 text-blue-400 mr-3" />
              <h3 className="text-xl font-semibold">AI-Powered SEO Optimization</h3>
            </div>
            <p className="text-gray-400">
              Our advanced AI analyzes your images and generates <strong>SEO-optimized metadata</strong> that ranks higher in search results. 
              Boost your visibility on stock photo platforms with AI-generated keywords and descriptions.
            </p>
          </div>

          <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-8 w-8 text-green-400 mr-3" />
              <h3 className="text-xl font-semibold">Increase Stock Photo Sales</h3>
            </div>
            <p className="text-gray-400">
              Generate <strong>high-converting titles</strong> and <strong>keyword-rich descriptions</strong> that help your images get discovered. 
              Perfect for photographers selling on Freepik, Shutterstock, Adobe Stock, and Getty Images.
            </p>
          </div>

          <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700">
            <div className="flex items-center mb-4">
              <Zap className="h-8 w-8 text-yellow-400 mr-3" />
              <h3 className="text-xl font-semibold">Bulk Processing & Automation</h3>
            </div>
            <p className="text-gray-400">
              Process multiple images simultaneously with our <strong>bulk metadata generator</strong>. 
              Save hours of manual work with automated SEO optimization for your entire image portfolio.
            </p>
          </div>
        </div>

        {/* Platform Support */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-8">Optimized for All Major Stock Photo Platforms</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-slate-800/30 p-6 rounded-lg border border-slate-600">
              <h4 className="font-semibold text-lg mb-2">Freepik Metadata</h4>
              <p className="text-gray-400 text-sm">Generate AI prompts, base models, and SEO keywords specifically for Freepik's algorithm</p>
            </div>
            <div className="bg-slate-800/30 p-6 rounded-lg border border-slate-600">
              <h4 className="font-semibold text-lg mb-2">Shutterstock SEO</h4>
              <p className="text-gray-400 text-sm">Create category-specific metadata and trending keywords for Shutterstock optimization</p>
            </div>
            <div className="bg-slate-800/30 p-6 rounded-lg border border-slate-600">
              <h4 className="font-semibold text-lg mb-2">Adobe Stock Keywords</h4>
              <p className="text-gray-400 text-sm">Generate Adobe Stock compliant titles and descriptions with proper categorization</p>
            </div>
            <div className="bg-slate-800/30 p-6 rounded-lg border border-slate-600">
              <h4 className="font-semibold text-lg mb-2">Getty Images Tags</h4>
              <p className="text-gray-400 text-sm">Professional metadata generation following Getty Images editorial and commercial standards</p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-12 rounded-2xl border border-blue-500/20 mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose PixCraftAI for Image SEO?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <Target className="h-6 w-6 text-blue-400 mr-4 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-lg mb-2">Targeted SEO Keywords</h4>
                <p className="text-gray-400">
                  Our AI generates <strong>long-tail keywords</strong> and <strong>trending search terms</strong> that buyers actually use. 
                  Increase your image discoverability with data-driven keyword optimization.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Award className="h-6 w-6 text-green-400 mr-4 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-lg mb-2">Professional Quality Descriptions</h4>
                <p className="text-gray-400">
                  Generate <strong>compelling image descriptions</strong> that convert browsers into buyers. 
                  Our AI creates engaging, SEO-friendly content that ranks higher in search results.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Users className="h-6 w-6 text-purple-400 mr-4 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-lg mb-2">Trusted by 10,000+ Photographers</h4>
                <p className="text-gray-400">
                  Join thousands of successful stock photographers who use PixCraftAI to optimize their images. 
                  Increase your <strong>passive income</strong> with better SEO metadata.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Zap className="h-6 w-6 text-yellow-400 mr-4 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-lg mb-2">Lightning Fast Processing</h4>
                <p className="text-gray-400">
                  Process hundreds of images in minutes with our <strong>AI-powered batch processing</strong>. 
                  Scale your stock photography business with automated metadata generation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Keywords Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-8">Popular Search Terms & Keywords</h2>
          <div className="bg-slate-800/30 p-8 rounded-xl border border-slate-600">
            <p className="text-gray-400 leading-relaxed">
              <strong>AI metadata generator</strong> • <strong>stock photo SEO</strong> • <strong>image keywords generator</strong> • 
              <strong>Freepik metadata</strong> • <strong>Shutterstock SEO</strong> • <strong>Adobe Stock optimization</strong> • 
              <strong>Getty Images keywords</strong> • <strong>AI image tagging</strong> • <strong>stock photography tools</strong> • 
              <strong>SEO image descriptions</strong> • <strong>metadata automation</strong> • <strong>image title generator</strong> • 
              <strong>photo keywords</strong> • <strong>stock image optimization</strong> • <strong>AI-powered SEO</strong> • 
              <strong>digital asset management</strong> • <strong>image marketing tools</strong> • <strong>photo metadata</strong> • 
              <strong>stock photo success</strong> • <strong>image SEO optimization</strong>
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Start Optimizing Your Images Today</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of photographers earning more with AI-optimized metadata
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/auth" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Get Started Free
            </Link>
            <Link 
              to="/pricing" 
              className="bg-transparent border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              View Pricing Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOContent;