import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  ChevronRight, 
  Book, 
  MapPin, 
  Users, 
  Brain, 
  Workflow, 
  CreditCard,
  HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { helpCategories, getArticlesByCategory, getFaqsByCategory } from '@/lib/helpCenterData';

export default function HelpCenterCategory() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    if (categoryId) {
      // Find the category
      const foundCategory = helpCategories.find(c => c.id === categoryId);
      
      if (foundCategory) {
        setCategory(foundCategory);
        
        // Get articles for this category
        const categoryArticles = getArticlesByCategory(categoryId);
        setArticles(categoryArticles);
        
        // Get FAQs for this category
        const categoryFaqs = getFaqsByCategory(categoryId);
        setFaqs(categoryFaqs);
      } else {
        // Category not found
        navigate('/help');
      }
    }
  }, [categoryId, navigate]);

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

  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <HelpCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h1>
        <p className="text-gray-600 mb-6">The category you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/help')}>
          Return to Help Center
        </Button>
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(category.icon);

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
        
        <div className="flex items-center space-x-3 mb-6">
          <div className={`p-3 rounded-lg ${category.color}`}>
            <CategoryIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{category.title}</h1>
            <p className="text-sm text-gray-600">{category.description}</p>
          </div>
        </div>
      </motion.div>

      <div className="mb-8">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder={`Search ${category.title} articles...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Articles */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Articles</CardTitle>
              <CardDescription>
                Learn more about {category.title.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredArticles.length > 0 ? (
                filteredArticles.map((article) => (
                  <motion.div
                    key={article.id}
                    whileHover={{ x: 5 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/help/article/${article.id}`)}
                  >
                    <div>
                      <h3 className="text-sm font-medium mb-1">{article.title}</h3>
                      <p className="text-xs text-gray-600">{article.excerpt}</p>
                      <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                        <span>{article.readTime}</span>
                        <span>•</span>
                        <span>Updated {article.updatedAt}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <HelpCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                  <p className="text-sm text-gray-600">
                    {searchTerm 
                      ? `No articles matching "${searchTerm}" in this category` 
                      : `No articles available in this category yet`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* FAQs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              {faqs.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left text-sm font-medium">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-xs text-gray-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-center py-4 text-sm text-gray-500">No FAQs available for this category</p>
              )}
            </CardContent>
          </Card>

          {/* Other Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Other Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {helpCategories
                  .filter(c => c.id !== categoryId)
                  .map((otherCategory) => {
                    const OtherCategoryIcon = getCategoryIcon(otherCategory.icon);
                    return (
                      <Link
                        key={otherCategory.id}
                        to={`/help/category/${otherCategory.id}`}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`p-1.5 rounded-lg ${otherCategory.color}`}>
                            <OtherCategoryIcon className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium">{otherCategory.title}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </Link>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Need More Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start text-sm" onClick={() => navigate('/contact')}>
                <HelpCircle className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}