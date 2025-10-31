import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowRight, Sparkles, Image, Zap, Target } from 'lucide-react';

const BlogSection: React.FC = () => {
  const blogPosts = [
    {
      id: 1,
      title: "AI Image Generation: Complete Guide to Creating Professional Visuals",
      excerpt: "Learn how to create stunning AI-generated images for social media, marketing, and professional use. Master the art of prompt engineering and image optimization.",
      date: "2024-01-15",
      author: "PixCraftAI Team",
      category: "AI Image Generation",
      tags: ["AI", "Image Generation", "Social Media", "Marketing"],
      readTime: "8 min read"
    },
    {
      id: 2,
      title: "Social Media Image Optimization: Best Practices for 2024",
      excerpt: "Discover the latest social media image dimensions, formats, and optimization techniques to maximize engagement across all platforms.",
      date: "2024-01-12",
      author: "Digital Marketing Expert",
      category: "Social Media",
      tags: ["Social Media", "Optimization", "Engagement", "Branding"],
      readTime: "6 min read"
    },
    {
      id: 3,
      title: "From Concept to Creation: AI-Powered Visual Content Strategy",
      excerpt: "Transform your content marketing with AI-generated visuals. Learn how to create consistent, brand-aligned images that convert.",
      date: "2024-01-10",
      author: "Content Strategist",
      category: "Content Marketing",
      tags: ["Content Strategy", "AI Tools", "Visual Marketing", "Brand Identity"],
      readTime: "10 min read"
    }
  ];

  const tutorials = [
    {
      title: "Getting Started with AI Image Generation",
      description: "Step-by-step guide to creating your first AI-generated image",
      icon: <Sparkles className="w-5 h-5" />,
      difficulty: "Beginner"
    },
    {
      title: "Advanced Prompt Engineering Techniques",
      description: "Master the art of crafting perfect prompts for better results",
      icon: <Target className="w-5 h-5" />,
      difficulty: "Advanced"
    },
    {
      title: "Batch Processing for Efficiency",
      description: "Learn to process multiple images simultaneously",
      icon: <Zap className="w-5 h-5" />,
      difficulty: "Intermediate"
    },
    {
      title: "Platform-Specific Optimization",
      description: "Optimize images for different social media platforms",
      icon: <Image className="w-5 h-5" />,
      difficulty: "Intermediate"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4">
        {/* Blog Posts Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Latest Insights & Tutorials
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Stay updated with the latest AI image generation techniques, social media trends, and optimization strategies
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {post.category}
                    </Badge>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{post.readTime}</span>
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                    <span className="text-sm font-medium">Read More</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tutorials Section */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Step-by-Step Tutorials
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Master AI image generation with our comprehensive tutorials and guides
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tutorials.map((tutorial, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                      {tutorial.icon}
                    </div>
                    <Badge 
                      variant={tutorial.difficulty === 'Beginner' ? 'default' : tutorial.difficulty === 'Intermediate' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {tutorial.difficulty}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {tutorial.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {tutorial.description}
                  </p>

                  <div className="flex items-center text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                    <span className="text-sm font-medium">Start Tutorial</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* SEO Keywords Section */}
        <div className="mt-16 text-center">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Popular AI Image Generation Topics
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "AI image generator", "text to image", "AI art creator", "social media images",
                "AI photo editor", "image optimization", "visual content creation", "AI design tools",
                "automated image generation", "digital art AI", "marketing visuals", "brand imagery",
                "AI graphics generator", "content creation tools", "visual marketing", "image AI",
                "artificial intelligence art", "automated design", "creative AI tools", "digital content"
              ].map((keyword) => (
                <Badge key={keyword} variant="outline" className="px-3 py-1 text-sm hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors cursor-pointer">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;