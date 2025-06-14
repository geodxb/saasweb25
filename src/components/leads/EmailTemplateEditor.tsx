import { useState, useEffect } from 'react';
import { Send, Loader2, User, Mail, Building, Phone, MapPin, Globe, Calendar, Clock, CheckCircle, ArrowRight, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Lead } from '@/lib/firestore';
import { gmailService, emailService } from '@/lib/gmail';
import { toast } from 'sonner';
import { emailAnalyticsOperations } from '@/lib/emailAnalytics';

interface EmailTemplateEditorProps {
  lead: Lead;
  onSend: (success: boolean) => void;
  onClose: () => void;
}

export default function EmailTemplateEditor({ lead, onSend, onClose }: EmailTemplateEditorProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isGmailAuthorized, setIsGmailAuthorized] = useState(false);

  useEffect(() => {
    // Check Gmail authorization status
    const checkAuth = async () => {
      try {
        await gmailService.initialize();
        setIsGmailAuthorized(gmailService.isUserAuthorized());
      } catch (error) {
        console.error('Error checking Gmail auth:', error);
        setIsGmailAuthorized(false);
      }
    };

    checkAuth();

    // Generate default email template
    generateDefaultTemplate();
  }, [lead]);

  const generateDefaultTemplate = () => {
    const businessName = lead.name || 'Business Owner';
    const companyName = lead.company || 'your business';
    
    setSubject(`Partnership Opportunity for ${companyName}`);
    
    const defaultBody = `Hi ${businessName},

I hope this email finds you well. I came across ${companyName} and was impressed by your work in the ${lead.industry || 'industry'}.

I'd love to discuss a potential partnership opportunity that could benefit your business. We specialize in helping businesses like yours grow and reach new customers.

Would you be available for a brief 15-minute call this week to explore how we might work together?

Best regards,
[Your Name]

P.S. I noticed you're located in ${lead.address || 'the area'} - we've helped several local businesses in your region achieve great results.`;

    setBody(defaultBody);
  };

  const handleAuthorizeGmail = async () => {
    try {
      await gmailService.authorize();
      setIsGmailAuthorized(true);
      toast.success('Gmail authorized successfully!');
    } catch (error) {
      console.error('Gmail authorization error:', error);
      toast.error('Failed to authorize Gmail. Please try again.');
    }
  };

  const handleSendEmail = async () => {
    if (!isGmailAuthorized) {
      toast.error('Please authorize Gmail first');
      return;
    }

    if (!lead.email) {
      toast.error('No email address found for this lead');
      onSend(false);
      return;
    }

    if (!subject.trim() || !body.trim()) {
      toast.error('Please fill in both subject and message');
      return;
    }

    setIsSending(true);

    try {
      // Create email tracking record
      const emailId = await emailAnalyticsOperations.createEmailTracking({
        userId: lead.ownerId,
        leadId: lead.id,
        leadName: lead.name,
        leadEmail: lead.email,
        subject: subject.trim()
      });
      
      // Process email body to add tracking
      let processedMessage = body;
      
      // Add link tracking
      processedMessage = emailAnalyticsOperations.processEmailLinks(processedMessage, emailId);
      
      // Add tracking pixel
      processedMessage = emailAnalyticsOperations.addTrackingPixelToEmail(processedMessage, emailId);
      
      // Send the email using emailService
      const result = await emailService.sendEmailToLead(
        lead,
        {
          subject: subject.trim(),
          body: processedMessage
        },
        lead.ownerId
      );
      
      if (result.success) {
        toast.success('Email sent successfully!');
        onSend(true);
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email: ' + (error instanceof Error ? error.message : 'Unknown error'));
      onSend(false);
    } finally {
      setIsSending(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className="space-y-6">
      {/* Lead Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Lead Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{lead.name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">{lead.company || 'Business name not available'}</p>
                </div>
              </div>
              
              {lead.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{lead.email}</span>
                </div>
              )}
              
              {lead.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{formatPhoneNumber(lead.phone)}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              {lead.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{lead.address}</span>
                </div>
              )}
              
              {lead.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <a 
                    href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {lead.website}
                  </a>
                </div>
              )}
              
              {lead.industry && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{lead.industry}</Badge>
                </div>
              )}
              
              {lead.rating && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">Rating: {lead.rating} ⭐</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Added: {new Date(lead.createdAt).toLocaleDateString()}</span>
            <Clock className="w-4 h-4 ml-4" />
            <span>Status: <Badge variant="outline">{lead.status}</Badge></span>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Gmail Authorization */}
      {!isGmailAuthorized && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-orange-900">Gmail Authorization Required</h3>
                <p className="text-sm text-orange-700 mt-1">
                  You need to authorize Gmail to send emails from your account.
                </p>
              </div>
              <Button onClick={handleAuthorizeGmail} variant="outline">
                Authorize Gmail
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Composer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Compose Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              value={lead.email || ''}
              disabled
              className="bg-muted"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
              disabled={!isGmailAuthorized}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter your message..."
              rows={12}
              disabled={!isGmailAuthorized}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={isSending}>
          Cancel
        </Button>
        <Button 
          onClick={handleSendEmail} 
          disabled={!isGmailAuthorized || isSending || !lead.email}
        >
          {isSending ? (
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
  );
}