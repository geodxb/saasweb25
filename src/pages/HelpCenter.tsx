import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  HelpCircle, 
  Book, 
  MapPin, 
  Users, 
  Brain, 
  Workflow, 
  CreditCard,
  ChevronRight,
  ArrowRight,
  MessageSquare,
  Mail
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { APP_INFO } from '@/lib/config';
import { 
  helpCategories, 
  helpArticles, 
  faqs, 
  getPopularArticles, 
  getRecentArticles 
} from '@/lib/helpCenterData';

export default function HelpCenter() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const popularArticles = getPopularArticles();
  const recentArticles = getRecentArticles();

  // Filter articles based on search term
  const filteredArticles = searchTerm 
    ? helpArticles.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <Badge className="mb-4">Help Center</Badge>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          How can we help you?
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Find answers to common questions and learn how to get the most out of {APP_INFO.name}
        </p>
        
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search for help articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 py-6 text-lg rounded-xl"
          />
        </div>

        {searchTerm && filteredArticles.length > 0 && (
          <div className="max-w-2xl mx-auto mt-4 bg-white border rounded-lg shadow-lg p-4 text-left">
            <h3 className="font-medium mb-2">Search Results ({filteredArticles.length})</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredArticles.map(article => (
                <Link 
                  key={article.id}
                  to={`/help/article/${article.id}`}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{article.title}</p>
                    <p className="text-xs text-gray-500">{article.category} • {article.readTime}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Help Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
        {helpCategories.map((category) => {
          const CategoryIcon = getCategoryIcon(category.icon);
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              transition={{ delay: 0.1 }}
            >
              <Link to={`/help/category/${category.id}`}>
                <Card 
                  className="cursor-pointer hover:shadow-md transition-all h-full text-center"
                >
                  <CardContent className="p-4">
                    <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                      <CategoryIcon className="w-5 h-5" />
                    </div>
                    <h3 className="font-medium text-sm mb-1">{category.title}</h3>
                    <p className="text-xs text-gray-500">{category.description}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Help Articles */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="popular">
            <TabsList className="mb-4">
              <TabsTrigger value="popular">Popular Articles</TabsTrigger>
              <TabsTrigger value="recent">Recent Articles</TabsTrigger>
            </TabsList>
            
            <TabsContent value="popular">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Articles</CardTitle>
                  <CardDescription>
                    Most frequently read help articles
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {popularArticles.map((article) => {
                    const category = helpCategories.find(c => c.id === article.category);
                    const CategoryIcon = category ? getCategoryIcon(category.icon) : HelpCircle;
                    
                    return (
                      <Link 
                        key={article.id}
                        to={`/help/article/${article.id}`}
                      >
                        <motion.div
                          whileHover={{ x: 5 }}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start space-x-3">
                            {category && (
                              <div className={`p-2 rounded-lg ${category.color}`}>
                                <CategoryIcon className="w-4 h-4" />
                              </div>
                            )}
                            <div>
                              <h4 className="font-medium">{article.title}</h4>
                              <p className="text-sm text-gray-500">
                                {category?.title} • {article.views} views
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </motion.div>
                      </Link>
                    );
                  })}
                  
                  <Button variant="outline" className="w-full" onClick={() => navigate('/help/articles')}>
                    View All Articles
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="recent">
              <Card>
                <CardHeader>
                  <CardTitle>Recently Updated</CardTitle>
                  <CardDescription>
                    Our latest help articles and updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentArticles.map((article) => {
                    const category = helpCategories.find(c => c.id === article.category);
                    const CategoryIcon = category ? getCategoryIcon(category.icon) : HelpCircle;
                    
                    return (
                      <Link 
                        key={article.id}
                        to={`/help/article/${article.id}`}
                      >
                        <motion.div
                          whileHover={{ x: 5 }}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start space-x-3">
                            {category && (
                              <div className={`p-2 rounded-lg ${category.color}`}>
                                <CategoryIcon className="w-4 h-4" />
                              </div>
                            )}
                            <div>
                              <h4 className="font-medium">{article.title}</h4>
                              <p className="text-sm text-gray-500">
                                Updated {article.updatedAt} • {article.readTime}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </motion.div>
                      </Link>
                    );
                  })}
                  
                  <Button variant="outline" className="w-full" onClick={() => navigate('/help/articles')}>
                    View All Articles
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Getting Started Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Getting Started with {APP_INFO.name}</CardTitle>
              <CardDescription>
                A step-by-step guide to help you get up and running
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: 'Set up your account',
                    description: 'Create your account and complete your profile information.',
                  },
                  {
                    step: 2,
                    title: 'Find your first leads',
                    description: 'Use the Google Maps Scraper to discover potential clients in your area.',
                  },
                  {
                    step: 3,
                    title: 'Organize your leads',
                    description: 'Categorize and tag your leads for better organization.',
                  },
                  {
                    step: 4,
                    title: 'Reach out with AI assistance',
                    description: 'Use the AI Assistant to create personalized outreach messages.',
                  },
                ].map((item) => (
                  <div key={item.step} className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center flex-shrink-0 font-medium">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link to="/help/article/getting-started-guide">
                <Button className="w-full">
                  View Complete Guide
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* FAQs */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.slice(0, 5).map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/help/faqs')}>
                View All FAQs
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need More Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/contact')}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat with Support
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/email-support')}>
                <Mail className="w-4 h-4 mr-2" />
                Email Support
              </Button>
            </CardContent>
          </Card>

          {/* Video Tutorials */}
          <Card>
            <CardHeader>
              <CardTitle>Video Tutorials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                'Getting Started with Locafyr',
                'Advanced Google Maps Scraping',
                'Using the AI Assistant',
                'Creating Automated Workflows',
              ].map((title, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Brain className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-sm">{title}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}