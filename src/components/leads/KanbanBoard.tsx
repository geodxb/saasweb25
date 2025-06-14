import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  MoreHorizontal,
  Plus,
  Loader2,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import LeadDetailModal from './LeadDetailModal';
import { Lead, leadOperations } from '@/lib/firestore';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface KanbanColumn {
  id: Lead['status'];
  title: string;
  color: string;
  leads: Lead[];
}

const columnConfig: Record<Lead['status'], { title: string; color: string }> = {
  new: { title: 'New Leads', color: 'bg-blue-500' },
  contacted: { title: 'Contacted', color: 'bg-yellow-500' },
  proposal: { title: 'Proposal Sent', color: 'bg-purple-500' },
  converted: { title: 'Converted', color: 'bg-green-500' },
  lost: { title: 'Lost', color: 'bg-red-500' },
};

const tagColors: Record<string, string> = {
  hot: 'bg-red-100 text-red-800',
  warm: 'bg-yellow-100 text-yellow-800',
  cold: 'bg-blue-100 text-blue-800',
  enterprise: 'bg-purple-100 text-purple-800',
  startup: 'bg-green-100 text-green-800',
  design: 'bg-pink-100 text-pink-800',
  local: 'bg-gray-100 text-gray-800',
};

interface LeadCardProps {
  lead: Lead;
  isDragging?: boolean;
  onView: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
  onConvert: (leadId: string) => void;
  isLoading?: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canConvert: boolean;
}

function LeadCard({ 
  lead, 
  isDragging = false, 
  onView, 
  onEdit, 
  onDelete, 
  onConvert, 
  isLoading,
  canEdit,
  canDelete,
  canConvert
}: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <motion.div
        whileHover={{ y: -2 }}
        className="cursor-grab active:cursor-grabbing"
      >
        <Card className="mb-3 hover:shadow-md transition-shadow">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-start justify-between mb-2 md:mb-3">
              <div className="flex items-center space-x-2">
                <Avatar className="w-7 h-7 md:w-8 md:h-8">
                  <AvatarFallback className="text-xs">
                    {lead.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-xs md:text-sm">{lead.name}</h4>
                  {lead.company && (
                    <p className="text-xs text-gray-500">{lead.company}</p>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <MoreHorizontal className="w-3 h-3" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(lead)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  {canEdit && (
                    <DropdownMenuItem onClick={() => onEdit(lead)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Lead
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Add Note
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {canConvert && (
                    <DropdownMenuItem 
                      onClick={() => onConvert(lead.id)}
                      disabled={lead.status === 'converted'}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Convert to Client
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Lead
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the lead
                              "{lead.name}" and all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => onDelete(lead.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Lead
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2 mb-2 md:mb-3">
              <div className="flex items-center text-xs text-gray-600">
                <Mail className="w-3 h-3 mr-1" />
                <span className="truncate max-w-[150px]">{lead.email}</span>
              </div>
              {lead.phone && (
                <div className="flex items-center text-xs text-gray-600">
                  <Phone className="w-3 h-3 mr-1" />
                  {lead.phone}
                </div>
              )}
              {!isMobile && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Value:</span>
                  <span className="font-medium text-green-600">{lead.value || '$0'}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1 mb-2 md:mb-3">
              {lead.tags.slice(0, isMobile ? 2 : 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className={`text-xs ${tagColors[tag] || 'bg-gray-100 text-gray-800'}`}
                >
                  {tag}
                </Badge>
              ))}
              {lead.tags.length > (isMobile ? 2 : 3) && (
                <Badge variant="secondary" className="text-xs">
                  +{lead.tags.length - (isMobile ? 2 : 3)}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="truncate max-w-[100px]">Source: {lead.source}</span>
              {lead.lastContact && (
                <span>{lead.lastContact.toLocaleDateString()}</span>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

interface KanbanColumnProps {
  column: KanbanColumn;
  onView: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
  onConvert: (leadId: string) => void;
  actionLoading: string | null;
  canEdit: (leadId: string) => boolean;
  canDelete: (leadId: string) => boolean;
  canConvert: boolean;
}

function KanbanColumn({ 
  column, 
  onView, 
  onEdit, 
  onDelete, 
  onConvert, 
  actionLoading,
  canEdit,
  canDelete,
  canConvert
}: KanbanColumnProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <div className="flex-1 min-w-[250px] md:min-w-80">
      <Card className="h-full">
        <CardHeader className="pb-2 md:pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 md:w-3 h-2 md:h-3 rounded-full ${column.color}`}></div>
              <CardTitle className="text-xs md:text-sm font-medium">{column.title}</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {column.leads.length}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 p-2 md:p-4">
          <SortableContext items={column.leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 min-h-[200px] md:min-h-96 overflow-y-auto max-h-[calc(100vh-300px)]">
              {column.leads.map((lead) => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onConvert={onConvert}
                  isLoading={actionLoading === lead.id}
                  canEdit={canEdit(lead.id)}
                  canDelete={canDelete(lead.id)}
                  canConvert={canConvert}
                />
              ))}
              {column.leads.length === 0 && (
                <div className="flex items-center justify-center h-24 border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-500">No leads</p>
                </div>
              )}
            </div>
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  );
}

export default function KanbanBoard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { user, profile, canEditLead, canDeleteLead, canConvertLead } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Subscribe to leads with real-time updates
  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    const unsubscribe = leadOperations.subscribeToLeads(
      user.uid,
      (fetchedLeads) => {
        setLeads(fetchedLeads);
        setIsLoading(false);
      },
      profile?.role
    );

    return unsubscribe;
  }, [user, profile?.role]);

  // Update columns when leads change
  useEffect(() => {
    updateColumns();
  }, [leads]);

  const updateColumns = () => {
    const newColumns: KanbanColumn[] = Object.entries(columnConfig).map(([status, config]) => ({
      id: status as Lead['status'],
      title: config.title,
      color: config.color,
      leads: leads.filter(lead => lead.status === status),
    }));
    setColumns(newColumns);
  };

  const refreshLeads = async () => {
    if (!user) return;
    
    try {
      setIsRefreshing(true);
      const fetchedLeads = await leadOperations.getLeads(user.uid, profile?.role);
      setLeads(fetchedLeads);
      toast.success('Leads refreshed');
    } catch (error) {
      toast.error('Failed to refresh leads');
    } finally {
      setIsRefreshing(false);
    }
  };

  const findContainer = (id: string) => {
    if (columns.find(col => col.id === id)) {
      return id;
    }

    return columns.find(col => col.leads.find(lead => lead.id === id))?.id;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !user) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer) return;

    // If moving to a different column, update the lead status
    if (activeContainer !== overContainer) {
      const lead = leads.find(l => l.id === activeId);
      if (lead && canEditLead(lead.ownerId)) {
        try {
          setActionLoading(activeId);
          await leadOperations.updateLead(
            activeId, 
            { status: overContainer }, 
            user.uid, 
            profile?.role
          );
          
          toast.success(`Lead moved to ${columnConfig[overContainer].title}`);
        } catch (error) {
          toast.error('Failed to update lead status');
        } finally {
          setActionLoading(null);
        }
      } else {
        toast.error('You do not have permission to edit this lead');
      }
    }

    setActiveId(null);
  };

  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    if (!user) return;
    
    try {
      setActionLoading(leadId);
      await leadOperations.updateLead(leadId, updates, user.uid, profile?.role);
      
      // Update selected lead if it's the one being updated
      if (selectedLead?.id === leadId) {
        setSelectedLead(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
      }
    } catch (error) {
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
      
      if (selectedLead?.id === leadId) {
        setSelectedLead(null);
      }
      
      toast.success('Lead deleted successfully');
    } catch (error) {
      toast.error('Failed to delete lead');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConvertLead = async (leadId: string) => {
    if (!user) return;
    
    try {
      setActionLoading(leadId);
      await leadOperations.convertToClient(leadId, user.uid, profile?.role);
      
      if (selectedLead?.id === leadId) {
        setSelectedLead(prev => prev ? { ...prev, status: 'converted' as const, updatedAt: new Date() } : null);
      }
      
      toast.success('Lead converted to client successfully');
    } catch (error) {
      toast.error('Failed to convert lead');
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
      if (updatedLead && selectedLead?.id === leadId) {
        setSelectedLead(updatedLead);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateTags = async (leadId: string, tags: string[]) => {
    if (!user) return;
    
    try {
      await leadOperations.updateLead(leadId, { tags }, user.uid, profile?.role);
      
      if (selectedLead?.id === leadId) {
        setSelectedLead(prev => prev ? { ...prev, tags, updatedAt: new Date() } : null);
      }
    } catch (error) {
      throw error;
    }
  };

  const activeLead = activeId ? 
    leads.find(lead => lead.id === activeId) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">Lead Pipeline</h3>
          <Badge variant="outline">
            {leads.length} total leads
          </Badge>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshLeads}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-4 overflow-x-auto pb-4 md:pb-6 -mx-2 px-2 md:-mx-0 md:px-0">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onView={setSelectedLead}
              onEdit={setSelectedLead}
              onDelete={handleDeleteLead}
              onConvert={handleConvertLead}
              actionLoading={actionLoading}
              canEdit={canEditLead}
              canDelete={canDeleteLead}
              canConvert={canConvertLead}
            />
          ))}
        </div>
        
        <DragOverlay>
          {activeLead ? (
            <LeadCard 
              lead={activeLead} 
              isDragging 
              onView={() => {}}
              onEdit={() => {}}
              onDelete={() => {}}
              onConvert={() => {}}
              canEdit={canEditLead(activeLead.ownerId)}
              canDelete={canDeleteLead(activeLead.ownerId)}
              canConvert={canConvertLead}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Lead Detail Modal */}
      <LeadDetailModal
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdate={handleUpdateLead}
        onDelete={handleDeleteLead}
        onConvert={handleConvertLead}
        onAddNote={handleAddNote}
        onUpdateTags={handleUpdateTags}
        isLoading={!!actionLoading}
      />
    </div>
  );
}