import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  FormInput,
  Kanban,
  Table as TableIcon,
  Plus,
  Settings,
  Loader2,
  List,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import FormBuilder from '@/components/leads/FormBuilder';
import KanbanBoard from '@/components/leads/KanbanBoard';
import LeadsTable from '@/components/leads/LeadsTable';
import LeadList from '@/components/leads/LeadList';
import { Lead, leadOperations } from '@/lib/firestore';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Leads() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'list';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isFormBuilderOpen, setIsFormBuilderOpen] = useState(false);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'manual',
    status: 'new',
    tags: ['manual-entry'],
    priority: 'medium',
    industry: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    if (user) {
      loadLeads();
    }
  }, [user]);

  useEffect(() => {
    // Update URL when tab changes
    navigate(`/leads${activeTab !== 'list' ? `?tab=${activeTab}` : ''}`, { replace: true });
  }, [activeTab, navigate]);

  const loadLeads = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const fetchedLeads = await leadOperations.getLeads(user.uid, profile?.role);
      setLeads(fetchedLeads);
    } catch (error) {
      console.error('Error loading leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLeads = async () => {
    if (!user) return;
    
    try {
      setIsRefreshing(true);
      await loadLeads();
      toast.success('Leads refreshed');
    } catch (error) {
      toast.error('Failed to refresh leads');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSaveForm = (fields: any[]) => {
    console.log('Form saved:', fields);
    setIsFormBuilderOpen(false);
    toast.success('Form created successfully');
    // Here you would typically save the form to your backend
  };

  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    if (!user) return;
    
    try {
      setActionLoading(leadId);
      await leadOperations.updateLead(leadId, updates, user.uid, profile?.role);
      
      // Update local state
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, ...updates, updatedAt: new Date() } : lead
      ));
      
      return true;
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!user) return;
    
    try {
      setActionLoading(leadId);
      await leadOperations.deleteLead(leadId, user.uid, profile?.role);
      
      // Remove from local state
      setLeads(prev => prev.filter(lead => lead.id !== leadId));
      
      return true;
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    } finally {
      setActionLoading(null);
    }
  };

  const handleConvertLead = async (leadId: string) => {
    if (!user) return;
    
    try {
      setActionLoading(leadId);
      await leadOperations.convertToClient(leadId, user.uid, profile?.role);
      
      // Update local state
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status: 'converted' as const, updatedAt: new Date() } : lead
      ));
      
      return true;
    } catch (error) {
      console.error('Error converting lead:', error);
      throw error;
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddNote = async (leadId: string, note: string) => {
    if (!user) return;
    
    try {
      await leadOperations.addNote(leadId, note, user.uid, profile?.role);
      
      // Refresh the specific lead to get updated notes
      const updatedLead = await leadOperations.getLead(leadId, user.uid, profile?.role);
      if (updatedLead) {
        setLeads(prev => prev.map(lead => 
          lead.id === leadId ? updatedLead : lead
        ));
      }
      
      return true;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  };

  const handleUpdateTags = async (leadId: string, tags: string[]) => {
    if (!user) return;
    
    try {
      await leadOperations.updateLead(leadId, { tags }, user.uid, profile?.role);
      
      // Update local state
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, tags, updatedAt: new Date() } : lead
      ));
      
      return true;
    } catch (error) {
      console.error('Error updating tags:', error);
      throw error;
    }
  };

  const handleAddLead = async () => {
    if (!user) return;
    
    if (!newLead.name || !newLead.email) {
      toast.error('Name and email are required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare lead data
      const leadData = {
        ...newLead,
        ownerId: user.uid,
        assignedTo: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Create lead in Firestore
      const leadId = await leadOperations.createLead(leadData);
      
      // Refresh leads
      await loadLeads();
      
      toast.success('Lead added successfully');
      setIsAddLeadOpen(false);
      
      // Reset form
      setNewLead({
        name: '',
        email: '',
        phone: '',
        company: '',
        source: 'manual',
        status: 'new',
        tags: ['manual-entry'],
        priority: 'medium',
        industry: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error adding lead:', error);
      toast.error('Failed to add lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  const FormBuilderComponent = (
    <>
      <DialogHeader>
        <DialogTitle>Form Builder</DialogTitle>
        <DialogDescription>
          Create custom lead capture forms for your website
        </DialogDescription>
      </DialogHeader>
      <FormBuilder onSave={handleSaveForm} />
    </>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </motion.div>
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Leads Management</h1>
          <p className="text-gray-600 mt-1">Track, manage, and convert your leads into clients</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isMobile ? (
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" className="flex-1 sm:flex-auto">
                  <FormInput className="w-4 h-4 mr-2" />
                  Create Form
                </Button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[90vh] overflow-y-auto">
                <DrawerHeader>
                  <DrawerTitle>Form Builder</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-4">
                  <FormBuilder onSave={handleSaveForm} />
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={isFormBuilderOpen} onOpenChange={setIsFormBuilderOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FormInput className="w-4 h-4 mr-2" />
                  Create Form
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                {FormBuilderComponent}
              </DialogContent>
            </Dialog>
          )}
          <Button onClick={() => setIsAddLeadOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Add Lead</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lead Pipeline</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button variant="outline" size="sm" className="sm:hidden w-8 h-8 p-0">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="list" className="flex items-center space-x-2">
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">List View</span>
                </TabsTrigger>
                <TabsTrigger value="kanban" className="flex items-center space-x-2">
                  <Kanban className="w-4 h-4" />
                  <span className="hidden sm:inline">Kanban Board</span>
                </TabsTrigger>
                <TabsTrigger value="table" className="flex items-center space-x-2">
                  <TableIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Table View</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="list" className="mt-6">
                <LeadList 
                  leads={leads}
                  isLoading={isLoading || isRefreshing}
                  onRefresh={refreshLeads}
                  onUpdate={handleUpdateLead}
                  onDelete={handleDeleteLead}
                  onConvert={handleConvertLead}
                  onAddNote={handleAddNote}
                  onUpdateTags={handleUpdateTags}
                  onAddLead={() => setIsAddLeadOpen(true)}
                  canEdit={(leadOwnerId) => true} // Implement proper permission check
                  canDelete={(leadOwnerId) => true} // Implement proper permission check
                  canConvert={true} // Implement proper permission check
                />
              </TabsContent>
              
              <TabsContent value="kanban" className="mt-6">
                <KanbanBoard />
              </TabsContent>
              
              <TabsContent value="table" className="mt-6">
                <LeadsTable />
              </TabsContent>
              
              <TabsContent value="form" className="mt-6">
                <div className="p-6">
                  <FormBuilder onSave={handleSaveForm} />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Lead Modal */}
      <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Enter the lead's information below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addName">Name *</Label>
                <Input 
                  id="addName" 
                  value={newLead.name}
                  onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                  placeholder="John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addEmail">Email *</Label>
                <Input 
                  id="addEmail" 
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addPhone">Phone</Label>
                <Input 
                  id="addPhone" 
                  value={newLead.phone}
                  onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addCompany">Company</Label>
                <Input 
                  id="addCompany" 
                  value={newLead.company}
                  onChange={(e) => setNewLead({...newLead, company: e.target.value})}
                  placeholder="Acme Inc."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="addStatus">Status</Label>
              <Select 
                value={newLead.status} 
                onValueChange={(value) => setNewLead({...newLead, status: value as any})}
              >
                <SelectTrigger id="addStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="addIndustry">Industry</Label>
              <Input 
                id="addIndustry" 
                value={newLead.industry}
                onChange={(e) => setNewLead({...newLead, industry: e.target.value})}
                placeholder="Technology, Healthcare, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addNotes">Notes</Label>
              <Textarea 
                id="addNotes" 
                value={newLead.notes}
                onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                placeholder="Add any additional information..."
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleAddLead}
              disabled={isSubmitting || !newLead.name || !newLead.email}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lead
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}