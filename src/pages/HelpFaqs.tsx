import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  HelpCircle, 
  Book, 
  MapPin, 
  Users, 
  Brain, 
  Workflow, 
  CreditCard,
  MessageSquare,
  Mail
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { helpCategories, faqs } from '@/lib/helpCenterData';

export default function HelpFaqs() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

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

  // Filter FAQs based on search term and active category
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeTab === 'all' || faq.category === activeTab;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
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
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h1>
        <p className="text-sm text-gray-600 mb-6">
          Find quick answers to common questions about using our platform
        </p>
      </motion.div>

      <div className="mb-8">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">FAQs</CardTitle>
              <CardDescription className="text-sm">
                Browse frequently asked questions by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                  {helpCategories.map(category => (
                    <TabsTrigger key={category.id} value={category.id} className="hidden md:inline-flex text-xs">
                      {category.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {/* Mobile category selector */}
                <div className="block md:hidden mb-4">
                  <Select value={activeTab} onValueChange={setActiveTab}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {helpCategories.map(category => (
                        <SelectItem key={category.id} value={category.id}>{category.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <TabsContent value="all" className="mt-0">
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFaqs.map((faq, index) => (
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
                  
                  {filteredFaqs.length === 0 && (
                    <div className="text-center py-8">
                      <HelpCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs found</h3>
                      <p className="text-sm text-gray-600">
                        {searchTerm 
                          ? `No FAQs matching "${searchTerm}"` 
                          : 'No FAQs available in this category'}
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                {helpCategories.map(category => (
                  <TabsContent key={category.id} value={category.id} className="mt-0">
                    <Accordion type="single" collapsible className="w-full">
                      {filteredFaqs
                        .filter(faq => faq.category === category.id)
                        .map((faq, index) => (
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
                    
                    {filteredFaqs.filter(faq => faq.category === category.id).length === 0 && (
                      <div className="text-center py-8">
                        <HelpCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs found</h3>
                        <p className="text-sm text-gray-600">
                          {searchTerm 
                            ? `No FAQs matching "${searchTerm}" in this category` 
                            : `No FAQs available in the ${category.title} category`}
                        </p>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {helpCategories.map((category) => {
                  const CategoryIcon = getCategoryIcon(category.icon);
                  const isActive = activeTab === category.id;
                  
                  return (
                    <button
                      key={category.id}
                      className={`flex items-center justify-between w-full p-2 rounded-lg text-left transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setActiveTab(category.id)}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`p-1.5 rounded-lg ${category.color}`}>
                          <CategoryIcon className="w-4 h-4" />
                        </div>
                        <span className="text-sm">{category.title}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {faqs.filter(faq => faq.category === category.id).length}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Need More Help */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Need More Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start text-sm" onClick={() => navigate('/contact')}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat with Support
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm" onClick={() => navigate('/email-support')}>
                <Mail className="w-4 h-4 mr-2" />
                Email Support
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm" onClick={() => navigate('/help')}>
                <HelpCircle className="w-4 h-4 mr-2" />
                Browse Help Articles
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}