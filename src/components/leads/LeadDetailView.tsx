import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Globe, 
  Tag, 
  Calendar, 
  Clock, 
  FileText, 
  Edit, 
  Trash2, 
  UserPlus, 
  X, 
  Plus,
  MessageSquare,
  Check,
  Loader2,
  Send,
  AlertCircle
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Lead } from '@/lib/firestore';
import LeadDetailTabs from './LeadDetailTabs';
import { toast } from 'sonner';
import LeadOutreachButton from './LeadOutreachButton';
import { gmailService } from '@/lib/gmail';
import EmailTemplateEditor from './EmailTemplateEditor';

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (leadId: string, updates: Partial<Lead>) => Promise<void>;
  onDelete: (leadId: string) => Promise<void>;
  onConvert: (leadId: string) => Promise<void>;
  onAddNote?: (leadId: string, note: string) => Promise<void>;
  onUpdateTags?: (leadId: string, tags: string[]) => Promise<void>;
  isLoading?: boolean;
}

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  proposal: 'bg-purple-100 text-purple-800',
  converted: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-red-100 text-red-800',
};

export default function LeadDetailView({
  lead,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onConvert,
  onAddNote,
  onUpdateTags,
  isLoading = false,
}: LeadDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Lead>>({});
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGmailAuthorized, setIsGmailAuthorized] = useState(false);
  const [isEmailEditorOpen, setIsEmailEditorOpen] = useState(false);
  const [gmailConfigError, setGmailConfigError] = useState<string | null>(null);

  if (!lead) return null;

  const handleStartEdit = () => {
    setEditData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      company: lead.company || '',
      status: lead.status,
      priority: lead.priority,
      industry: lead.industry || '',
      notes: lead.notes || '',
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editData.name || !editData.email) {
      toast.error('Name and email are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate(lead.id, editData);
      setIsEditing(false);
      toast.success('Lead updated successfully');
    } catch (error) {
      toast.error('Failed to update lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !onAddNote) return;

    setIsSubmitting(true);
    try {
      await onAddNote(lead.id, newNote);
      setNewNote('');
      toast.success('Note added successfully');
    } catch (error) {
      toast.error('Failed to add note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    if (!newTag.trim() || !onUpdateTags) return;
    
    // Check if tag already exists
    if (lead.tags.includes(newTag.trim())) {
      toast.error('Tag already exists');
      return;
    }
    
    const updatedTags = [...lead.tags, newTag.trim()];
    onUpdateTags(lead.id, updatedTags);
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    if (!onUpdateTags) return;
    
    const updatedTags = lead.tags.filter(t => t !== tag);
    onUpdateTags(lead.id, updatedTags);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCallLead = () => {
    if (lead.phone) {
      window.location.href = `tel:${lead.phone}`;
      toast.success(`Calling ${lead.name}...`);
    } else {
      toast.error('No phone number available for this lead');
    }
  };

  const handleEmailLead = () => {
    if (lead.email) {
      window.location.href = `mailto:${lead.email}`;
      toast.success(`Composing email to ${lead.name}...`);
    } else {
      toast.error('No email address available for this lead');
    }
  };

  const checkGmailAuth = async () => {
    try {
      await gmailService.initialize();
      setIsGmailAuthorized(gmailService.isUserAuthorized());
      setGmailConfigError(null);
    } catch (error) {
      console.error('Error checking Gmail auth:', error);
      setGmailConfigError(error instanceof Error ? error.message : 'Gmail configuration error');
      setIsGmailAuthorized(false);
    }
  };

  const handleConnectGmail = async () => {
    try {
      setGmailConfigError(null);
      await gmailService.initialize();
      const authorized = await gmailService.authorize();
      setIsGmailAuthorized(authorized);
      
      if (authorized) {
        toast.success('Successfully connected to Gmail');
        setIsEmailEditorOpen(true);
      } else {
        toast.error('Failed to connect to Gmail');
      }
    } catch (error) {
      console.error('Error connecting to Gmail:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error connecting to Gmail';
      setGmailConfigError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleDisconnectGmail = async () => {
    try {
      const revoked = await gmailService.revokeAuthorization();
      if (revoked) {
        setIsGmailAuthorized(false);
        toast.success('Gmail connection revoked');
      } else {
        toast.error('Failed to revoke Gmail connection');
      }
    } catch (error) {
      console.error('Error disconnecting Gmail:', error);
      toast.error('Error disconnecting Gmail');
    }
  };

  // Check Gmail authorization on component mount
  useState(() => {
    checkGmailAuth();
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback>
                {lead.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl font-bold">{lead.name}</div>
              <div className="text-sm text-gray-600">{lead.company}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Quick Action Buttons */}
        <div className="flex space-x-2 mb-4">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleCallLead}
            disabled={!lead.phone}
          >
            <Phone className="w-4 h-4 mr-2" />
            Call
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleEmailLead}
            disabled={!lead.email}
          >
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => {
              if (gmailConfigError) {
                toast.error(gmailConfigError);
                return;
              }
              
              if (isGmailAuthorized) {
                setIsEmailEditorOpen(true);
              } else {
                handleConnectGmail();
              }
            }}
            disabled={!!gmailConfigError}
          >
            <Send className="w-4 h-4 mr-2" />
            {gmailConfigError ? 'Gmail Unavailable' : isGmailAuthorized ? 'Gmail' : 'Connect Gmail'}
          </Button>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={editData.company}
                  onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="w-full p-2 border rounded-md"
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value as Lead['status'] })}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="proposal">Proposal</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  className="w-full p-2 border rounded-md"
                  value={editData.priority}
                  onChange={(e) => setEditData({ ...editData, priority: e.target.value as Lead['priority'] })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={editData.industry}
                  onChange={(e) => setEditData({ ...editData, industry: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={editData.notes}
                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                rows={5}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <LeadDetailTabs 
            lead={lead} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
        )}

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{lead.email}</span>
                  </div>
                  {lead.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{lead.phone}</span>
                    </div>
                  )}
                  {lead.company && (
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span>{lead.company}</span>
                    </div>
                  )}
                  {lead.address && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{lead.address}</span>
                    </div>
                  )}
                  {lead.website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a 
                        href={lead.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {lead.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500">Lead Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className={statusColors[lead.status]}>
                      {lead.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Priority:</span>
                    <Badge className={priorityColors[lead.priority]}>
                      {lead.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Source:</span>
                    <span>{lead.source}</span>
                  </div>
                  {lead.industry && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Industry:</span>
                      <span>{lead.industry}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Created:</span>
                    <span>{formatDate(lead.createdAt)}</span>
                  </div>
                  {lead.lastContact && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Contact:</span>
                      <span>{formatDate(lead.lastContact)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">Tags</h3>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Add tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="h-8 w-32 text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button size="sm" variant="outline" onClick={handleAddTag}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {lead.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                    <span>{tag}</span>
                    <button 
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {lead.tags.length === 0 && (
                  <span className="text-sm text-gray-500">No tags</span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500">Notes</h3>
              <div className="border rounded-lg p-4 min-h-24 whitespace-pre-wrap">
                {lead.notes || <span className="text-gray-400">No notes</span>}
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleAddNote} 
                    disabled={!newNote.trim() || isSubmitting}
                    size="sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Add Note
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Gmail Integration Section */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">Gmail Integration</h3>
                {isGmailAuthorized ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDisconnectGmail}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Disconnect Gmail
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleConnectGmail}
                    disabled={!!gmailConfigError}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Connect Gmail
                  </Button>
                )}
              </div>
              
              {gmailConfigError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Gmail Configuration Error</p>
                      <p className="text-sm text-red-700 mt-1">
                        {gmailConfigError}
                      </p>
                      <p className="text-sm text-red-700 mt-2">
                        Please ensure your environment variables are properly configured.
                      </p>
                    </div>
                  </div>
                </div>
              ) : !isGmailAuthorized ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">Connect your Gmail account</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Connect your Gmail account to send personalized emails directly to this lead.
                      </p>
                      <Button 
                        onClick={handleConnectGmail} 
                        className="mt-2 bg-blue-600 hover:bg-blue-700"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Connect Gmail
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={() => setIsEmailEditorOpen(true)} 
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Compose Email with Gmail
                </Button>
              )}
            </div>
          </div>
        )}

        <Separator className="my-4" />

        <div className="flex justify-between">
          <div className="flex space-x-2">
            {!isEditing && (
              <Button variant="outline" onClick={handleStartEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            <Button 
              onClick={() => onConvert(lead.id)} 
              disabled={lead.status === 'converted' || isLoading}
              className={lead.status === 'converted' ? 'bg-gray-400' : ''}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {lead.status === 'converted' ? 'Converted' : 'Convert to Client'}
            </Button>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isLoading}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the lead
                  and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(lead.id)}>
                  Delete Lead
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Email Editor Modal */}
        {isEmailEditorOpen && (
          <Dialog open={isEmailEditorOpen} onOpenChange={setIsEmailEditorOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Gmail Outreach</DialogTitle>
              </DialogHeader>
              <EmailTemplateEditor 
                lead={lead}
                onSend={(success) => {
                  setIsEmailEditorOpen(false);
                  if (success) {
                    // Update lead status to contacted if successful
                    onUpdate(lead.id, { 
                      status: 'contacted',
                      lastContact: new Date()
                    });
                  }
                }}
                onClose={() => setIsEmailEditorOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}