import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Tag, 
  ArrowRight, 
  Rss, 
  Mail, 
  BookOpen,
  Zap,
  Target,
  Brain,
  Workflow,
  Users,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import BlogPostCard, { BlogPost } from '@/components/marketing/BlogPostCard';
import { analytics, AnalyticsEvents } from '@/lib/analytics';
import { useAuth } from '@/hooks/useAuth';

// Mock blog posts data
const mockPosts: BlogPost[] = [
  {
    id: '1',
    title: 'How to Generate Leads from Google Maps in 2025',
    excerpt: 'Learn how to use Google Maps as a powerful lead generation tool for your business with these proven strategies and automation techniques.',
    slug: 'generate-leads-google-maps-2025',
    coverImage: 'https://images.pexels.com/photos/3760529/pexels-photo-3760529.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    date: 'May 15, 2025',
    author: {
      name: 'Sarah Johnson',
      avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
    },
    readTime: '8 min read',
    category: 'Lead Generation',
    tags: ['google-maps', 'lead-generation', 'automation', 'tutorial']
  },
  {
    id: '2',
    title: 'Automating LinkedIn Outreach in 2025: What Works Now',
    excerpt: 'Discover the latest strategies and tools for automating your LinkedIn outreach while avoiding detection and maximizing response rates.',
    slug: 'automating-linkedin-outreach-2025',
    coverImage: 'https://images.pexels.com/photos/4348404/pexels-photo-4348404.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    date: 'May 10, 2025',
    author: {
      name: 'Michael Chen',
      avatar: 'https://randomuser.me/api/portraits/men/46.jpg',
    },
    readTime: '12 min read',
    category: 'Outreach',
    tags: ['linkedin', 'automation', 'outreach', 'b2b']
  },
  {
    id: '3',
    title: 'Best Tools for Lead Generation in Small Agencies',
    excerpt: 'A comprehensive comparison of the top lead generation tools specifically tailored for small agencies and consultancies.',
    slug: 'best-lead-generation-tools-small-agencies',
    coverImage: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    date: 'May 5, 2025',
    author: {
      name: 'Emily Rodriguez',
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    },
    readTime: '10 min read',
    category: 'Tools',
    tags: ['tools', 'agencies', 'comparison', 'lead-generation']
  },
  {
    id: '4',
    title: '7 AI Prompts That Generate High-Converting Email Templates',
    excerpt: 'Learn how to craft AI prompts that consistently produce email templates with high open and response rates for your outreach campaigns.',
    slug: 'ai-prompts-high-converting-email-templates',
    coverImage: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    date: 'April 28, 2025',
    author: {
      name: 'David Kim',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    },
    readTime: '7 min read',
    category: 'AI',
    tags: ['ai', 'email-templates', 'copywriting', 'conversion']
  },
  {
    id: '5',
    title: 'The Ultimate Guide to Client Onboarding Automation',
    excerpt: 'Streamline your client onboarding process with these automation workflows that save time and improve the client experience.',
    slug: 'ultimate-guide-client-onboarding-automation',
    coverImage: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    date: 'April 20, 2025',
    author: {
      name: 'Lisa Thompson',
      avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
    },
    readTime: '15 min read',
    category: 'Automation',
    tags: ['onboarding', 'automation', 'client-management', 'workflows']
  },
  {
    id: '6',
    title: 'How to Qualify Leads Faster with AI Scoring',
    excerpt: 'Implement an AI-powered lead scoring system to quickly identify your most promising leads and prioritize your outreach efforts.',
    slug: 'qualify-leads-faster-ai-scoring',
    coverImage: 'https://images.pexels.com/photos/7567434/pexels-photo-7567434.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    date: 'April 15, 2025',
    author: {
      name: 'James Wilson',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    readTime: '9 min read',
    category: 'AI',
    tags: ['lead-scoring', 'ai', 'qualification', 'sales']
  },
  {
    id: '7',
    title: '5 Outreach Sequence Templates That Get Responses',
    excerpt: 'Copy these proven outreach sequence templates that have been tested across industries to maximize response rates and conversions.',
    slug: '5-outreach-sequence-templates',
    coverImage: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    date: 'April 8, 2025',
    author: {
      name: 'Alex Martinez',
      avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    },
    readTime: '11 min read',
    category: 'Outreach',
    tags: ['templates', 'sequences', 'email', 'conversion']
  },
];

export default function Blog() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(mockPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (user) {
      analytics.track({
        name: AnalyticsEvents.FEATURE_DISCOVERED,
        properties: { feature: 'blog_visited' },
        userId: user.uid,
      });
    }
  }, [user]);

  useEffect(() => {
    filterPosts();
  }, [searchTerm, categoryFilter]);

  const filterPosts = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      let filtered = mockPosts;
      
      if (searchTerm) {
        filtered = filtered.filter(post => 
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      if (categoryFilter !== 'all') {
        filtered = filtered.filter(post => 
          post.category.toLowerCase() === categoryFilter.toLowerCase()
        );
      }
      
      setFilteredPosts(filtered);
      setIsLoading(false);
    }, 300);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !email.includes('@')) {
      return;
    }
    
    // In a real implementation, send to your backend
    // For demo, just log and track
    console.log('Subscribed:', email);
    
    if (user) {
      analytics.track({
        name: AnalyticsEvents.FEATURE_DISCOVERED,
        properties: { feature: 'blog_subscribed' },
        userId: user.uid,
      });
    }
    
    setEmail('');
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'lead generation', label: 'Lead Generation' },
    { value: 'outreach', label: 'Outreach' },
    { value: 'ai', label: 'AI' },
    { value: 'automation', label: 'Automation' },
    { value: 'tools', label: 'Tools' },
    { value: 'growth', label: 'Growth' },
  ];

  const popularTags = [
    'lead-generation',
    'automation',
    'ai',
    'outreach',
    'linkedin',
    'email-templates',
    'workflows',
    'tools',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <Badge className="mb-4">ClientFlow Blog</Badge>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Insights & Strategies for Growth
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Expert tips, tutorials, and case studies to help you generate more leads, 
          close more deals, and grow your business.
        </p>
      </motion.div>

      {/* Featured Post */}
      <div className="mb-12">
        <BlogPostCard post={mockPosts[0]} featured={true} />
      </div>

      {/* Filters */}
      <div className="mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Blog Posts */}
        <div className="lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Latest Articles</h2>
            {isLoading && (
              <div className="flex items-center text-sm text-gray-500">
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </div>
            )}
          </div>
          
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPosts.map((post, index) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
          
          {filteredPosts.length > 0 && (
            <div className="mt-8 flex justify-center">
              <Button variant="outline">
                Load More Articles
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.slice(1).map((category) => (
                <button
                  key={category.value}
                  className={`flex items-center justify-between w-full p-2 rounded-lg text-left transition-colors ${
                    categoryFilter === category.value
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setCategoryFilter(category.value)}
                >
                  <span>{category.label}</span>
                  <Badge variant="outline">
                    {mockPosts.filter(post => post.category.toLowerCase() === category.value).length}
                  </Badge>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Popular Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Popular Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setSearchTerm(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Newsletter Signup */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">Subscribe to Our Newsletter</CardTitle>
              <CardDescription>
                Get the latest articles and resources directly to your inbox
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubscribe} className="space-y-3">
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Subscribe
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Featured Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Featured Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  title: '50 Proven Lead Generation Strategies',
                  type: 'Guide',
                  icon: Target,
                },
                {
                  title: 'AI Prompt Templates for Sales',
                  type: 'Template Pack',
                  icon: Brain,
                },
                {
                  title: 'Client Onboarding Workflow',
                  type: 'Template',
                  icon: Workflow,
                },
              ].map((resource, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="p-2 bg-gray-100 rounded">
                    <resource.icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{resource.title}</p>
                    <p className="text-xs text-gray-500">{resource.type}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}