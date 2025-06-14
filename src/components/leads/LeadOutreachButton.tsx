import { useState, useEffect } from 'react';
import { Send, Loader2, CheckCircle, AlertCircle, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Lead } from '@/lib/firestore';
import { gmailService, emailService } from '@/lib/gmail';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import EmailTemplateEditor from '../email/EmailTemplateEditor';

interface LeadOutreachButtonProps {
  lead: Lead;
  onSuccess?: () => void;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export default function LeadOutreachButton({
  lead,
  onSuccess,
  className = '',
  variant = 'default',
  size = 'default'
}: LeadOutreachButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isGmailAuthorized, setIsGmailAuthorized] = useState(false);

  // Check Gmail authorization
  useEffect(() => {
    const checkGmailAuth = async () => {
      try {
        await gmailService.initialize();
        setIsGmailAuthorized(gmailService.isUserAuthorized());
      } catch (error) {
        console.error('Error checking Gmail auth:', error);
        setIsGmailAuthorized(false);
      }
    };
    
    checkGmailAuth();
  }, []);

  const handleSendOutreach = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    
    // Check Gmail authorization
    if (!isGmailAuthorized) {
      try {
        await gmailService.initialize();
        const authorized = await gmailService.authorize();
        setIsGmailAuthorized(authorized);
        
        if (!authorized) {
          toast.error('Gmail authorization required');
          return;
        }
      } catch (error) {
        console.error('Error authorizing Gmail:', error);
        toast.error('Failed to authorize Gmail');
        return;
      }
    }
    
    // Open the email editor
    setIsEditorOpen(true);
  };

  const handleEmailSent = (success: boolean) => {
    setIsEditorOpen(false);
    setResult(success ? 'success' : 'error');
    
    // Reset result status after 3 seconds
    setTimeout(() => {
      setResult(null);
    }, 3000);
    
    if (success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleSendOutreach}
        disabled={isProcessing || lead.status === 'converted' || lead.status === 'lost'}
        className={className}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span className="hidden md:inline">Sending...</span>
            <span className="md:hidden">...</span>
          </>
        ) : result === 'success' ? (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">Sent</span>
            <span className="md:hidden">Sent</span>
          </>
        ) : result === 'error' ? (
          <>
            <AlertCircle className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">Failed</span>
            <span className="md:hidden">Failed</span>
          </>
        ) : lead.status === 'contacted' ? (
          <>
            <Edit className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">Email Again</span>
            <span className="md:hidden">Email</span>
          </>
        ) : lead.status === 'converted' || lead.status === 'lost' ? (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">{lead.status === 'converted' ? 'Converted' : 'Lost'}</span>
            <span className="md:hidden">{lead.status === 'converted' ? 'Converted' : 'Lost'}</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">Send Email</span>
            <span className="md:hidden">Email</span>
          </>
        )}
      </Button>
      
      {/* Email Template Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto mobile-dialog-full">
          <DialogHeader>
            <DialogTitle>Gmail Outreach</DialogTitle>
          </DialogHeader>
          <EmailTemplateEditor 
            lead={lead}
            onSend={handleEmailSent}
            onClose={() => setIsEditorOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}