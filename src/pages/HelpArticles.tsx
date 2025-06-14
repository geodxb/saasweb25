import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Book, 
  MapPin, 
  Users, 
  Brain, 
  Workflow, 
  CreditCard,
  HelpCircle,
  Tag
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { helpCategories, helpArticles } from '@/lib/helpCenterData';

export default function HelpArticles() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Book': return Book;
      case 'MapPin': return MapPin;
      case 'Users': return Users;
      case 'Brain': return Brain;
      case 'Workflow': return Workflow;
      case 'CreditCard': return CreditCard;
      default: return HelpCircle;
    }
  };

  // Filter and sort articles
  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = searchTerm === '' || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (sortBy === 'popular') {
      return b.views - a.views;
    } else if (sortBy === 'recent') {
      const dateA = new Date(a.updatedAt);
      const dateB = new Date(b.updatedAt);
      return dateB.getTime() - dateA.getTime();
    } else if (sortBy === 'a-z') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4" 
          onClick={() => navigate('/help')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Help Center
        </Button>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Help Articles</h1>
        <p className="text-sm text-gray-600 mb-6">
          Browse all help articles or filter by category
        </p>
      </motion.div>

      <div className="mb-8">
        <Card>
          <CardContent className="p-6">
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
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full md:w-auto">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {helpCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>{category.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="recent">Recently Updated</SelectItem>
                    <SelectItem value="a-z">Alphabetical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Summary */}
      {(searchTerm || categoryFilter !== 'all') && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Showing {filteredArticles.length} of {helpArticles.length} articles
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedArticles.length > 0 ? (
          sortedArticles.map((article) => {
            const category = helpCategories.find(c => c.id === article.category);
            const CategoryIcon = category ? getCategoryIcon(category.icon) : HelpCircle;
            
            return (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
              >
                <Link to={`/help/article/${article.id}`}>
                  <Card className="h-full hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2 mb-3">
                        {category && (
                          <Badge className={category.color}>
                            <CategoryIcon className="w-3 h-3 mr-1" />
                            {category.title}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">{article.readTime}</span>
                      </div>
                      
                      <h3 className="text-sm font-medium mb-2">{article.title}</h3>
                      <p className="text-xs text-gray-600 mb-4 line-clamp-2">{article.excerpt}</p>
                      
                      <div className="flex items-center justify-between mt-auto pt-2 text-xs text-gray-500">
                        <span>By {article.author}</span>
                        <span>{article.views} views</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-3">
                        {article.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {article.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{article.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <HelpCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h2>
            <p className="text-sm text-gray-600 mb-6">
              {searchTerm 
                ? `No articles matching "${searchTerm}"` 
                : 'No articles available in this category'}
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}