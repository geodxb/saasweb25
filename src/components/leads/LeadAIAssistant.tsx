import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Mail,
  Copy,
  Download,
  RefreshCw,
  Loader2,
  AlertCircle,
  Zap,
  FileText,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Lead, leadAIOperations } from '@/lib/firestore';
import { useAuth } from '@/hooks/useAuth';
import { analytics, AnalyticsEvents } from '@/lib/analytics';
import { toast } from 'sonner';

interface LeadAIAssistantProps {
  lead: Lead;
  onClose?: () => void;
}

export default function LeadAIAssistant({ lead, onClose }: LeadAIAssistantProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('summary');
  const [aiResult, setAiResult] = useState<{
    summary?: string;
    emailDraft?: string;
    lastUpdated?: Date;
  }>({});
  const [isLoading, setIsLoading] = useState<{ summary: boolean; email: boolean }>({
    summary: false,
    email: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Load existing AI data when component mounts
  useEffect(() => {
    if (lead?.id) {
      loadAIData();
    }
  }, [lead?.id]);

  const loadAIData = async () => {
    try {
      const aiData = await leadAIOperations.getLeadAI(lead.id);
      if (aiData) {
        setAiResult({
          summary: aiData.summary,
          emailDraft: aiData.emailDraft,
          lastUpdated: aiData.updatedAt,
        });
      }
    } catch (error) {
      console.error('Error loading AI data:', error);
    }
  };

  const generateSummary = async () => {
    if (!lead || !user) return;
    
    setIsLoading(prev => ({ ...prev, summary: true }));
    setError(null);
    
    try {
      // Generate summary using Firebase function
      const summary = await leadAIOperations.generateAIContent(lead.id, lead, 'summary');
      
      setAiResult(prev => ({
        ...prev,
        summary,
        lastUpdated: new Date(),
      }));
      
      // Track in analytics
      analytics.track({
        name: AnalyticsEvents.AI_PROMPT_USED,
        properties: { 
          feature: 'lead_summary',
          leadId: lead.id,
        },
        userId: user.uid,
      });
      
      toast.success('Lead summary generated successfully');
    } catch (error) {
      console.error('Error generating summary:', error);
      setError(error.message || 'Failed to generate summary');
      toast.error('Failed to generate summary');
    } finally {
      setIsLoading(prev => ({ ...prev, summary: false }));
    }
  };

  const generateEmail = async () => {
    if (!lead || !user) return;
    
    setIsLoading(prev => ({ ...prev, email: true }));
    setError(null);
    
    try {
      // Generate email using Firebase function
      const emailDraft = await leadAIOperations.generateAIContent(lead.id, lead, 'email');
      
      setAiResult(prev => ({
        ...prev,
        emailDraft,
        lastUpdated: new Date(),
      }));
      
      // Track in analytics
      analytics.track({
        name: AnalyticsEvents.AI_PROMPT_USED,
        properties: { 
          feature: 'cold_email',
          leadId: lead.id,
        },
        userId: user.uid,
      });
      
      toast.success('Cold email draft generated successfully');
    } catch (error) {
      console.error('Error generating email:', error);
      setError(error.message || 'Failed to generate email');
      toast.error('Failed to generate email');
    } finally {
      setIsLoading(prev => ({ ...prev, email: false }));
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`);
    
    // Track in analytics
    if (user) {
      analytics.track({
        name: AnalyticsEvents.FEATURE_DISCOVERED,
        properties: { 
          feature: `copy_${type.toLowerCase()}`,
          leadId: lead.id,
        },
        userId: user.uid,
      });
    }
  };

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`${filename} downloaded`);
    
    // Track in analytics
    if (user) {
      analytics.track({
        name: AnalyticsEvents.FEATURE_DISCOVERED,
        properties: { 
          feature: `download_${filename.split('.')[0].toLowerCase()}`,
          leadId: lead.id,
        },
        userId: user.uid,
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle>Lead AI Assistant</CardTitle>
              <CardDescription>
                Generate insights and content for {lead.name}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Lead Summary</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>Cold Email</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-medium">AI-Generated Lead Summary</h3>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={generateSummary}
                disabled={isLoading.summary}
              >
                {isLoading.summary ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : aiResult.summary ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Summary
                  </>
                )}
              </Button>
            </div>
            
            {error && activeTab === 'summary' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Error generating summary</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {isLoading.summary ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <Loader2 className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
                <p className="text-gray-600">Analyzing lead data and generating insights...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
              </div>
            ) : aiResult.summary ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap">{aiResult.summary}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-2 mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(aiResult.summary || '', 'Summary')}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => downloadText(aiResult.summary || '', `${lead.name.replace(/\s+/g, '_')}_summary.txt`)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
                
                {aiResult.lastUpdated && (
                  <p className="text-xs text-gray-500 mt-2">
                    Last updated: {aiResult.lastUpdated.toLocaleString()}
                  </p>
                )}
              </motion.div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No summary generated yet</h3>
                <p className="text-gray-600 mb-4">
                  Generate an AI-powered summary of this lead to get insights and recommendations.
                </p>
                <Button onClick={generateSummary}>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Summary
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="email" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-green-600" />
                <h3 className="text-sm font-medium">AI-Generated Cold Email</h3>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={generateEmail}
                disabled={isLoading.email}
              >
                {isLoading.email ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : aiResult.emailDraft ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Generate Email
                  </>
                )}
              </Button>
            </div>
            
            {error && activeTab === 'email' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Error generating email</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {isLoading.email ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <Loader2 className="w-8 h-8 mx-auto mb-4 text-green-600 animate-spin" />
                <p className="text-gray-600">Crafting a personalized cold email...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
              </div>
            ) : aiResult.emailDraft ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap">{aiResult.emailDraft}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-2 mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(aiResult.emailDraft || '', 'Email')}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => downloadText(aiResult.emailDraft || '', `${lead.name.replace(/\s+/g, '_')}_email.txt`)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
                
                {aiResult.lastUpdated && (
                  <p className="text-xs text-gray-500 mt-2">
                    Last updated: {aiResult.lastUpdated.toLocaleString()}
                  </p>
                )}
              </motion.div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No email draft generated yet</h3>
                <p className="text-gray-600 mb-4">
                  Generate a personalized cold email draft based on this lead's information.
                </p>
                <Button onClick={generateEmail}>
                  <Mail className="w-4 h-4 mr-2" />
                  Generate Email
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <Separator />
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800">AI Assistant Usage</p>
              <p className="text-sm text-blue-700">
                Each generation counts as one AI prompt. You have used 23 of 100 prompts this month.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}