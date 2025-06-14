import { useState, useEffect } from 'react';
import { Calendar, Link2, Check, AlertCircle, Loader2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { userProfileOperations } from '@/lib/firestore';
import { useAuth } from '@/hooks/useAuth';

interface CalendlyLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLinkInsert: (link: string) => void;
}

export default function CalendlyLinkDialog({ isOpen, onClose, onLinkInsert }: CalendlyLinkDialogProps) {
  const { user } = useAuth();
  const [calendlyLink, setCalendlyLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingLink, setHasExistingLink] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadCalendlyLink();
    }
  }, [isOpen, user]);

  const loadCalendlyLink = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const link = await userProfileOperations.getCalendlyLink(user.uid);
      if (link) {
        setCalendlyLink(link);
        setHasExistingLink(true);
      } else {
        setCalendlyLink('');
        setHasExistingLink(false);
      }
    } catch (error) {
      console.error('Error loading Calendly link:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateCalendlyLink = (link: string): boolean => {
    // Basic validation to ensure it's a Calendly link
    return link.trim().startsWith('https://calendly.com/') || 
           link.trim().startsWith('http://calendly.com/');
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('You must be logged in to save your Calendly link');
      return;
    }

    if (!validateCalendlyLink(calendlyLink)) {
      toast.error('Please enter a valid Calendly link (https://calendly.com/...)');
      return;
    }

    setIsSaving(true);
    try {
      await userProfileOperations.saveCalendlyLink(user.uid, calendlyLink);
      toast.success('Calendly link saved successfully');
      onLinkInsert(calendlyLink);
      onClose();
    } catch (error) {
      console.error('Error saving Calendly link:', error);
      toast.error('Failed to save Calendly link');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUseExisting = () => {
    onLinkInsert(calendlyLink);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <span>Calendly Scheduling Link</span>
          </DialogTitle>
          <DialogDescription>
            Add your Calendly booking link to make it easy for leads to schedule meetings with you.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : hasExistingLink ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Calendly Link Found</p>
                  <p className="text-sm text-green-700 mt-1">
                    We found your saved Calendly link. You can use it or update it below.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="calendlyLink">Your Calendly Link</Label>
              <Input
                id="calendlyLink"
                value={calendlyLink}
                onChange={(e) => setCalendlyLink(e.target.value)}
                placeholder="https://calendly.com/yourusername/30min"
              />
              <p className="text-xs text-gray-500">
                This link will be saved to your profile for future use.
              </p>
            </div>
            
            <DialogFooter className="flex sm:justify-between gap-2">
              <Button 
                variant="outline" 
                onClick={handleUseExisting}
                className="sm:w-auto w-full"
              >
                <Link2 className="w-4 h-4 mr-2" />
                Use Existing Link
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving || !calendlyLink.trim()}
                className="sm:w-auto w-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Update Link
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">No Calendly Link Found</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Please enter your Calendly booking link below. This will be saved for future use.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="calendlyLink">Your Calendly Link</Label>
              <Input
                id="calendlyLink"
                value={calendlyLink}
                onChange={(e) => setCalendlyLink(e.target.value)}
                placeholder="https://calendly.com/yourusername/30min"
              />
              <p className="text-xs text-gray-500">
                You can find this in your Calendly account under "Share" for any event type.
              </p>
            </div>
            
            <DialogFooter>
              <Button 
                onClick={handleSave}
                disabled={isSaving || !calendlyLink.trim()}
                className="w-full sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save Link
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}