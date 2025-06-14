import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, Tag, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  coverImage: string;
  date: string;
  author: {
    name: string;
    avatar?: string;
  };
  readTime: string;
  category: string;
  tags: string[];
}

interface BlogPostCardProps {
  post: BlogPost;
  featured?: boolean;
}

export default function BlogPostCard({ post, featured = false }: BlogPostCardProps) {
  const categoryColors: Record<string, string> = {
    'lead-generation': 'bg-blue-100 text-blue-800',
    'outreach': 'bg-green-100 text-green-800',
    'ai': 'bg-purple-100 text-purple-800',
    'automation': 'bg-orange-100 text-orange-800',
    'growth': 'bg-red-100 text-red-800',
    'tips': 'bg-indigo-100 text-indigo-800',
  };

  const getCategoryColor = (category: string) => {
    const key = category.toLowerCase().replace(/\s+/g, '-');
    return categoryColors[key] || 'bg-gray-100 text-gray-800';
  };

  if (featured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="col-span-full"
      >
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="relative h-64 md:h-auto">
              <img 
                src={post.coverImage} 
                alt={post.title} 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-8">
              <Badge className={getCategoryColor(post.category)}>
                {post.category}
              </Badge>
              
              <h2 className="text-2xl font-bold mt-4 mb-3 text-gray-900">
                {post.title}
              </h2>
              
              <p className="text-gray-600 mb-4">
                {post.excerpt}
              </p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {post.date}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {post.readTime}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {post.author.avatar ? (
                    <img 
                      src={post.author.avatar} 
                      alt={post.author.name} 
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                  <span className="text-sm font-medium">{post.author.name}</span>
                </div>
                
                <Link to={`/blog/${post.slug}`}>
                  <Button>
                    Read More
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative h-48">
          <img 
            src={post.coverImage} 
            alt={post.title} 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3">
            <Badge className={getCategoryColor(post.category)}>
              {post.category}
            </Badge>
          </div>
        </div>
        <CardContent className="p-5">
          <div className="flex items-center space-x-3 text-xs text-gray-500 mb-3">
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {post.date}
            </div>
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {post.readTime}
            </div>
          </div>
          
          <h3 className="text-lg font-bold mb-2 text-gray-900 line-clamp-2">
            {post.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {post.excerpt}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {post.author.avatar ? (
                <img 
                  src={post.author.avatar} 
                  alt={post.author.name} 
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 text-gray-500" />
                </div>
              )}
              <span className="text-xs font-medium">{post.author.name}</span>
            </div>
            
            <Link to={`/blog/${post.slug}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
              Read
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}