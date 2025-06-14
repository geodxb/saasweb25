import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  HelpCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  Printer, 
  Clock, 
  User, 
  Tag, 
  ChevronRight,
  MessageSquare,
  Mail
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { APP_INFO } from '@/lib/config';
import { helpArticles } from '@/lib/helpCenterData';

export default function HelpArticle() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);

  useEffect(() => {
    if (articleId) {
      // Find the article in our data
      const foundArticle = helpArticles.find(a => a.id === articleId);
      
      if (foundArticle) {
        setArticle(foundArticle);
        
        // Find related articles (same category, different article)
        const related = helpArticles
          .filter(a => a.category === foundArticle.category && a.id !== articleId)
          .slice(0, 3);
        
        setRelatedArticles(related);
      } else {
        // Article not found
        toast.error('Article not found');
        navigate('/help');
      }
      
      setIsLoading(false);
    }
  }, [articleId, navigate]);

  const handleFeedback = (type: 'helpful' | 'not-helpful') => {
    setFeedback(type);
    toast.success(type === 'helpful' 
      ? 'Thank you for your feedback!' 
      : 'Thanks for letting us know. We\'ll work to improve this article.');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: `Check out this helpful article from ${APP_INFO.name}`,
        url: window.location.href,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback to copying the URL
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-1/3 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-2/3 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <HelpCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h1>
        <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been moved.</p>
        <Button onClick={() => navigate('/help')}>
          Return to Help Center
        </Button>
      </div>
    );
  }

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
        
        <div className="flex items-center space-x-2 mb-2">
          <Badge className="bg-blue-100 text-blue-800">
            {article.category}
          </Badge>
          <span className="text-sm text-gray-500">
            <Clock className="w-3 h-3 inline mr-1" />
            {article.readTime}
          </span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
        
        <div className="flex items-center space-x-4 mb-8 text-sm text-gray-600">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-1" />
            <span>By {article.author}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>Updated {article.updatedAt}</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardContent className="p-6">
              <div className="prose prose-sm max-w-none text-gray-700">
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              </div>
              
              <Separator className="my-8" />
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Was this article helpful?</h3>
                  <div className="flex space-x-2">
                    <Button 
                      variant={feedback === 'helpful' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => handleFeedback('helpful')}
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Yes
                    </Button>
                    <Button 
                      variant={feedback === 'not-helpful' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => handleFeedback('not-helpful')}
                    >
                      <ThumbsDown className="w-4 h-4 mr-2" />
                      No
                    </Button>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Related Articles */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-medium mb-4">Related Articles</h3>
              <div className="space-y-3">
                {relatedArticles.length > 0 ? (
                  relatedArticles.map((relatedArticle) => (
                    <Link 
                      key={relatedArticle.id} 
                      to={`/help/article/${relatedArticle.id}`}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-sm font-medium">{relatedArticle.title}</div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No related articles found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Need More Help */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-medium mb-4">Need More Help?</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start text-sm" onClick={() => navigate('/contact')}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat with Support
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm" onClick={() => navigate('/email-support')}>
                  <Mail className="w-4 h-4 mr-2" />
                  Email Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}