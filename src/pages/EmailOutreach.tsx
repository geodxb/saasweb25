import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Mail,
  User,
  Building,
  Phone,
  MapPin,
  Globe,
  Search,
  Filter,
  Plus,
  Loader2,
  Zap,
  AlertCircle,
  CheckCircle,
  Edit,
  Calendar,
  Link2,
  HelpCircle,
  BarChart,
  MousePointer,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  X,
  Copy,
  Download,
  Paperclip
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Lead, leadOperations, userProfileOperations } from '@/lib/firestore';
import { useNavigate } from 'react-router-dom';
import GoBackButton from '@/components/common/GoBackButton';
import { generateEmailWithAI } from '@/lib/openai';
import CalendlyLinkDialog from '@/components/calendly/CalendlyLinkDialog';
import EmailAnalyticsDashboard from '@/components/email/EmailAnalyticsDashboard';
import { emailAnalyticsOperations } from '@/lib/emailAnalytics';
import { gmailService, emailService } from '@/lib/gmail';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  tags: string[];
}

const mockTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Initial Outreach',
    subject: 'Interested in boosting your lead generation?',
    body: `Hi {{lead.name}},

I noticed that {{lead.company}} has been growing steadily, and I wanted to reach out to discuss how our lead generation platform could help accelerate your growth even further.

Our clients typically see a 30% increase in qualified leads within the first month. Would you be open to a quick 15-minute call this week to explore if our solution might be a good fit for your needs?

Best regards,
{{user.name}}`,
    category: 'cold-outreach',
    tags: ['initial', 'introduction']
  },
  {
    id: '2',
    name: 'Follow-up',
    subject: 'Following up on our previous conversation',
    body: `Hi {{lead.name}},

I wanted to follow up on my previous email about how our lead generation platform could benefit {{lead.company}}.

I understand you're busy, so I'll keep this brief. Our platform has helped companies like yours increase their qualified leads by 30% on average.

Would you be available for a quick 15-minute call this week to discuss how we might be able to help you achieve similar results?

Best regards,
{{user.name}}`,
    category: 'follow-up',
    tags: ['follow-up', 'reminder']
  },
  {
    id: '3',
    name: 'Demo Invitation',
    subject: 'Exclusive demo invitation for {{lead.company}}',
    body: `Hi {{lead.name}},

I'd like to invite you to an exclusive demo of our lead generation platform, specifically tailored for businesses in the {{lead.industry}} industry.

During this 30-minute session, we'll show you:
- How to automate your lead generation process
- Strategies to qualify leads more effectively
- Tools to increase your conversion rates

Would any of these times work for you?
- Tuesday at 10:00 AM
- Wednesday at 2:00 PM
- Thursday at 11:00 AM

Looking forward to connecting!

Best regards,
{{user.name}}`,
    category: 'demo',
    tags: ['demo', 'invitation']
  }
];

export default function EmailOutreach() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    template: '',
    tone: 'professional' as 'friendly' | 'professional' | 'persuasive' | 'concise',
    emailGoal: 'introduction' as 'book_call' | 'follow_up' | 'introduction' | 'demo_pitch'
  });
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isCalendlyDialogOpen, setIsCalendlyDialogOpen] = useState(false);
  const [hasCalendlyLink, setHasCalendlyLink] = useState(false);
  const [activeTab, setActiveTab] = useState('compose');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isGmailAuthorized, setIsGmailAuthorized] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadLeads();
      checkCalendlyLink();
      checkGmailAuth();
    }
  }, [user]);

  useEffect(() => {
    // Update selected lead when selectedLeadId changes
    if (selectedLeadId) {
      const lead = leads.find(l => l.id === selectedLeadId);
      setSelectedLead(lead || null);
      
      // Reset email data when lead changes
      setEmailData({
        subject: '',
        message: '',
        template: '',
        tone: 'professional',
        emailGoal: 'introduction'
      });
      
      // Clear any previous AI errors
      setAiError(null);
      
      // Clear attachments
      setAttachments([]);
    } else {
      setSelectedLead(null);
    }
  }, [selectedLeadId, leads]);

  const loadLeads = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Use a simple query without composite index
      const fetchedLeads = await leadOperations.getLeads(user.uid);
      
      setLeads(fetchedLeads);
    } catch (error) {
      console.error('Error loading leads:', error);
      toast.error('Error loading leads');
    } finally {
      setIsLoading(false);
    }
  };

  const checkCalendlyLink = async () => {
    if (!user) return;
    
    try {
      const link = await userProfileOperations.getCalendlyLink(user.uid);
      setHasCalendlyLink(!!link);
    } catch (error) {
      console.error('Error checking Calendly link:', error);
    }
  };

  const checkGmailAuth = async () => {
    try {
      await gmailService.initialize();
      setIsGmailAuthorized(gmailService.isUserAuthorized());
    } catch (error) {
      console.error('Error checking Gmail auth:', error);
      setIsGmailAuthorized(false);
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    const template = mockTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    // Replace placeholders with actual values
    let subject = template.subject;
    let body = template.body;
    
    if (selectedLead) {
      subject = subject.replace(/{{lead\.name}}/g, selectedLead.name || '');
      subject = subject.replace(/{{lead\.company}}/g, selectedLead.company || '');
      
      body = body.replace(/{{lead\.name}}/g, selectedLead.name || '');
      body = body.replace(/{{lead\.company}}/g, selectedLead.company || '');
      body = body.replace(/{{lead\.industry}}/g, selectedLead.industry || '');
    }
    
    if (profile) {
      body = body.replace(/{{user\.name}}/g, profile.displayName || '');
    }
    
    setEmailData({
      ...emailData,
      subject,
      message: body,
      template: templateId,
    });
  };

  const handleSendEmail = async () => {
    if (!selectedLead || !emailData.subject || !emailData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!isGmailAuthorized) {
      toast.error('Please authorize Gmail first');
      return;
    }
    
    setIsSendingEmail(true);
    
    try {
      // Create email tracking record
      const emailId = await emailAnalyticsOperations.createEmailTracking({
        userId: user!.uid,
        leadId: selectedLead.id,
        leadName: selectedLead.name,
        leadEmail: selectedLead.email,
        subject: emailData.subject
      });
      
      // Process email body to add tracking
      let processedMessage = emailData.message;
      
      // Add link tracking
      processedMessage = emailAnalyticsOperations.processEmailLinks(processedMessage, emailId);
      
      // Add tracking pixel
      processedMessage = emailAnalyticsOperations.addTrackingPixelToEmail(processedMessage, emailId);
      
      // Send the email using emailService
      const result = await emailService.sendEmailToLead(
        selectedLead,
        {
          subject: emailData.subject,
          body: processedMessage,
          attachments: attachments
        },
        user!.uid
      );
      
      if (result.success) {
        // Update lead status to 'contacted'
        if (selectedLead.status === 'new') {
          await leadOperations.updateLead(
            selectedLead.id, 
            { 
              status: 'contacted',
              lastContact: new Date()
            }, 
            user!.uid
          );
          
          // Update local state
          setLeads(leads.map(lead => 
            lead.id === selectedLead.id 
              ? { ...lead, status: 'contacted', lastContact: new Date() } 
              : lead
          ));
        }
        
        toast.success(`Email sent to ${selectedLead.name}`);
        
        // Reset form
        setEmailData({
          subject: '',
          message: '',
          template: '',
          tone: 'professional',
          emailGoal: 'introduction'
        });
        
        setAttachments([]);
        setIsComposing(false);
        
        // Switch to analytics tab
        setActiveTab('analytics');
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleGenerateAIEmail = async () => {
    if (!selectedLead) {
      toast.error('Please select a lead first');
      return;
    }
    
    setIsGeneratingAI(true);
    setAiError(null);
    
    try {
      // Use the client-side AI email generation with tone and goal
      const result = await generateEmailWithAI({
        lead: selectedLead,
        tone: emailData.tone,
        emailGoal: emailData.emailGoal
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate email');
      }
      
      // Update email data with AI-generated content
      setEmailData({
        ...emailData,
        subject: result.email?.subject || 'AI-Generated Email',
        message: result.email?.body || '',
      });
      
      toast.success('AI-generated email created successfully');
    } catch (error) {
      console.error('Error generating AI email:', error);
      setAiError(error instanceof Error ? error.message : 'Unknown error occurred');
      toast.error('Failed to generate AI email');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleInsertCalendlyLink = () => {
    setIsCalendlyDialogOpen(true);
  };

  const handleCalendlyLinkInsert = (link: string) => {
    if (!link) return;
    
    // Insert the Calendly link at the end of the message
    const updatedMessage = emailData.message.trim() + 
      `\n\n---\n📅 Schedule a meeting with me: ${link}\n---`;
    
    setEmailData({
      ...emailData,
      message: updatedMessage
    });
    
    setHasCalendlyLink(true);
  };

  const handleAuthorizeGmail = async () => {
    try {
      await gmailService.initialize();
      const authorized = await gmailService.authorize();
      setIsGmailAuthorized(authorized);
      
      if (authorized) {
        toast.success('Gmail authorized successfully!');
      } else {
        toast.error('Failed to authorize Gmail');
      }
    } catch (error) {
      console.error('Gmail authorization error:', error);
      toast.error('Failed to authorize Gmail. Please try again.');
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleDownloadEmail = () => {
    const emailContent = `Subject: ${emailData.subject}\n\n${emailData.message}`;
    const blob = new Blob([emailContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-${selectedLead?.name.replace(/\s+/g, '-').toLowerCase() || 'draft'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Email downloaded');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <GoBackButton />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Outreach</h1>
          <p className="text-gray-600 mt-1">Send personalized emails to your leads</p>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="compose" className="flex items-center space-x-2">
            <Mail className="w-4 h-4" />
            <span>Compose</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="compose" className="space-y-6 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lead Selection */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Select Lead</CardTitle>
                  <CardDescription>Choose a lead to send an email to</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                  ) : leads.length > 0 ? (
                    <div className="space-y-4">
                      <Select
                        value={selectedLeadId}
                        onValueChange={(value) => {
                          setSelectedLeadId(value);
                          setIsComposing(false); // Reset compose state when lead changes
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a lead" />
                        </SelectTrigger>
                        <SelectContent>
                          {leads.map((lead) => (
                            <SelectItem key={lead.id} value={lead.id}>
                              <div className="flex items-center">
                                <span>{lead.name}</span>
                                {lead.company && (
                                  <span className="ml-2 text-gray-500">({lead.company})</span>
                                )}
                                <Badge className="ml-2" variant="outline">
                                  {lead.status}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {selectedLead && !isComposing && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-start space-x-4">
                            <div className="p-2 bg-gray-100 rounded-full">
                              <User className="w-6 h-6 text-gray-600" />
                            </div>
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium">{selectedLead.name}</h3>
                                <Badge className={
                                  selectedLead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                                  selectedLead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                                  selectedLead.status === 'proposal' ? 'bg-purple-100 text-purple-800' :
                                  selectedLead.status === 'converted' ? 'bg-green-100 text-green-800' :
                                  'bg-red-100 text-red-800'
                                }>
                                  {selectedLead.status.toUpperCase()}
                                </Badge>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="w-4 h-4 mr-1" />
                                {selectedLead.email}
                              </div>
                              {selectedLead.company && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Building className="w-4 h-4 mr-1" />
                                  {selectedLead.company}
                                </div>
                              )}
                              {selectedLead.phone && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone className="w-4 h-4 mr-1" />
                                  {selectedLead.phone}
                                </div>
                              )}
                              <div className="flex items-center text-xs text-gray-500 mt-2">
                                <span>Last contact: {selectedLead.lastContact ? new Date(selectedLead.lastContact).toLocaleDateString() : 'Never'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end">
                            <Button onClick={() => setIsComposing(true)}>
                              <Mail className="w-4 h-4 mr-2" />
                              Compose Email
                            </Button>
                          </div>
                        </div>
                      )}

                      {selectedLead && isComposing && (
                        <div className="space-y-6">
                          {/* Gmail Authorization Check */}
                          {!isGmailAuthorized && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-center">
                                <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                                <span className="text-sm text-yellow-800">Gmail authorization required</span>
                              </div>
                              <p className="text-xs text-yellow-700 mt-1">
                                You need to authorize Gmail to send emails from your account.
                              </p>
                              <Button 
                                onClick={handleAuthorizeGmail} 
                                variant="outline" 
                                className="mt-2 text-sm"
                              >
                                Authorize Gmail
                              </Button>
                            </div>
                          )}
                          
                          {/* AI Email Generator */}
                          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-3 mb-4">
                                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                                  <Zap className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-medium text-blue-800">AI Email Generator</h3>
                                  <p className="text-sm text-blue-700 mt-1">
                                    Generate a personalized email with AI
                                  </p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                  <Label htmlFor="emailTone" className="text-blue-800">Email Tone</Label>
                                  <Select 
                                    value={emailData.tone} 
                                    onValueChange={(value: any) => setEmailData({...emailData, tone: value})}
                                  >
                                    <SelectTrigger id="emailTone">
                                      <SelectValue placeholder="Select tone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="friendly">Friendly</SelectItem>
                                      <SelectItem value="professional">Professional</SelectItem>
                                      <SelectItem value="persuasive">Persuasive</SelectItem>
                                      <SelectItem value="concise">Concise</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="emailGoal" className="text-blue-800">Email Goal</Label>
                                  <Select 
                                    value={emailData.emailGoal} 
                                    onValueChange={(value: any) => setEmailData({...emailData, emailGoal: value})}
                                  >
                                    <SelectTrigger id="emailGoal">
                                      <SelectValue placeholder="Select goal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="book_call">Book a Call</SelectItem>
                                      <SelectItem value="follow_up">Follow-up</SelectItem>
                                      <SelectItem value="introduction">Introduction</SelectItem>
                                      <SelectItem value="demo_pitch">Demo Pitch</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              
                              <Button 
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                onClick={handleGenerateAIEmail}
                                disabled={isGeneratingAI || !isGmailAuthorized}
                              >
                                {isGeneratingAI ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating Email...
                                  </>
                                ) : (
                                  <>
                                    <Zap className="w-4 h-4 mr-2" />
                                    Generate Email with AI
                                  </>
                                )}
                              </Button>
                            </CardContent>
                          </Card>
                          
                          {/* Email Form */}
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="subject">Subject</Label>
                              <Input
                                id="subject"
                                placeholder="Email subject"
                                value={emailData.subject}
                                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                                disabled={!isGmailAuthorized}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="message">Message</Label>
                              <Textarea
                                id="message"
                                placeholder="Write your email message here..."
                                value={emailData.message}
                                onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                                className="min-h-[200px]"
                                disabled={!isGmailAuthorized}
                              />
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                              <Input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                multiple
                                ref={fileInputRef}
                                disabled={!isGmailAuthorized}
                              />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => fileInputRef.current?.click()}
                                      className="flex items-center gap-2"
                                      disabled={!isGmailAuthorized}
                                    >
                                      <Paperclip className="w-4 h-4" />
                                      <span>Attach Files</span>
                                      {attachments.length > 0 && (
                                        <Badge variant="secondary" className="ml-1">
                                          {attachments.length}
                                        </Badge>
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Attach files to your email</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={handleInsertCalendlyLink}
                                      className="flex items-center gap-2"
                                      disabled={!isGmailAuthorized}
                                    >
                                      <Calendar className="w-4 h-4" />
                                      <span>{hasCalendlyLink ? 'Insert' : 'Add'} Calendly Link</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Quickly schedule meetings with leads using your Calendly link.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            
                            {/* Display Attachments */}
                            {attachments.length > 0 && (
                              <div className="space-y-2 border rounded-lg p-3 bg-gray-50">
                                <Label>Attachments ({attachments.length})</Label>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                  {attachments.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                                      <div className="flex items-center">
                                        <Paperclip className="w-4 h-4 mr-2 text-gray-500" />
                                        <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                        <span className="text-xs text-gray-500 ml-2">
                                          ({(file.size / 1024).toFixed(0)} KB)
                                        </span>
                                      </div>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => removeAttachment(index)}
                                        className="h-6 w-6 p-0"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* AI Error Message */}
                            {aiError && (
                              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center">
                                  <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                                  <span className="text-sm text-red-800">{aiError}</span>
                                </div>
                              </div>
                            )}
                            
                            {/* Email Actions */}
                            <div className="flex flex-wrap justify-between items-center gap-2 pt-2">
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleCopyToClipboard(emailData.message)}
                                  disabled={!emailData.message}
                                >
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copy
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={handleDownloadEmail}
                                  disabled={!emailData.subject || !emailData.message}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => {
                                    setIsComposing(false);
                                    setEmailData({
                                      subject: '',
                                      message: '',
                                      template: '',
                                      tone: 'professional',
                                      emailGoal: 'introduction'
                                    });
                                    setAttachments([]);
                                  }}
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </Button>
                              </div>
                              
                              <Button 
                                onClick={handleSendEmail}
                                disabled={!isGmailAuthorized || !emailData.subject || !emailData.message || isSendingEmail}
                              >
                                {isSendingEmail ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Email
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Mail className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
                      <p className="text-gray-600 mb-4">
                        Add some leads to get started with email outreach
                      </p>
                      <Button onClick={() => navigate('/leads')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Leads
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Email Templates - Moved to bottom and displayed horizontally */}
          {leads.length > 0 && selectedLead && (
            <div className="mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Email Templates</CardTitle>
                  <CardDescription>Use a template to get started quickly</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex overflow-x-auto pb-2 space-x-4">
                    {mockTemplates.map((template) => (
                      <motion.div
                        key={template.id}
                        whileHover={{ y: -2 }}
                        className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer min-w-[280px] flex-shrink-0"
                        onClick={() => {
                          if (selectedLead && isComposing) {
                            handleSelectTemplate(template.id);
                          } else if (selectedLead) {
                            setIsComposing(true);
                            setTimeout(() => handleSelectTemplate(template.id), 100);
                          } else {
                            toast.error('Please select a lead first');
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{template.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
                          </div>
                          <Badge variant="outline">
                            {template.category}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6 pt-6">
          <EmailAnalyticsDashboard />
        </TabsContent>
      </Tabs>

      {/* Calendly Link Dialog */}
      <CalendlyLinkDialog 
        isOpen={isCalendlyDialogOpen}
        onClose={() => setIsCalendlyDialogOpen(false)}
        onLinkInsert={handleCalendlyLinkInsert}
      />
    </div>
  );
}