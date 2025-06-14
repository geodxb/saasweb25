import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  Filter,
  Download,
  Search,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  MessageSquare,
  Tag,
  Eye,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import ResponsiveLeadDetail from './ResponsiveLeadDetail';
import { Lead, leadOperations, getCurrentUserId } from '@/lib/firestore';
import { toast } from 'sonner';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  proposal: 'bg-purple-100 text-purple-800',
  converted: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800',
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

export default function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  const userId = getCurrentUserId();

  // Load leads on component mount
  useEffect(() => {
    loadLeads();
  }, []);

  // Filter leads when search term or filters change
  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, statusFilter, sourceFilter]);

  const loadLeads = async () => {
    try {
      setIsLoading(true);
      const fetchedLeads = await leadOperations.getLeads(userId);
      setLeads(fetchedLeads);
    } catch (error) {
      console.error('Error loading leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLeads = async () => {
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

  const filterLeads = () => {
    let filtered = leads.filter(lead => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
      
      return matchesSearch && matchesStatus && matchesSource;
    });

    setFilteredLeads(filtered);
    setCurrentPage(1);
  };

  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    try {
      setActionLoading(leadId);
      await leadOperations.updateLead(leadId, updates, userId);
      
      // Update local state
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, ...updates, updatedAt: new Date() } : lead
      ));
      
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
    try {
      setActionLoading(leadId);
      await leadOperations.deleteLead(leadId, userId);
      
      // Remove from local state
      setLeads(prev => prev.filter(lead => lead.id !== leadId));
      
      if (selectedLead?.id === leadId) {
        setSelectedLead(null);
      }
    } catch (error) {
      throw error;
    } finally {
      setActionLoading(null);
    }
  };

  const handleConvertLead = async (leadId: string) => {
    try {
      setActionLoading(leadId);
      await leadOperations.convertToClient(leadId, userId);
      
      // Update local state to show converted status
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status: 'converted' as const, updatedAt: new Date() } : lead
      ));
      
      if (selectedLead?.id === leadId) {
        setSelectedLead(prev => prev ? { ...prev, status: 'converted' as const, updatedAt: new Date() } : null);
      }
    } catch (error) {
      throw error;
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddNote = async (leadId: string, note: string) => {
    try {
      await leadOperations.addNote(leadId, note, userId);
      
      // Refresh the specific lead to get updated notes
      const updatedLead = await leadOperations.getLead(leadId, userId);
      if (updatedLead) {
        setLeads(prev => prev.map(lead => 
          lead.id === leadId ? updatedLead : lead
        ));
        
        if (selectedLead?.id === leadId) {
          setSelectedLead(updatedLead);
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateTags = async (leadId: string, tags: string[]) => {
    try {
      await leadOperations.updateLead(leadId, { tags }, userId);
      
      // Update local state
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, tags, updatedAt: new Date() } : lead
      ));
      
      if (selectedLead?.id === leadId) {
        setSelectedLead(prev => prev ? { ...prev, tags, updatedAt: new Date() } : null);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleQuickStatusUpdate = async (leadId: string, status: Lead['status']) => {
    try {
      await handleUpdateLead(leadId, { status });
      toast.success(`Lead status updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const exportLeads = () => {
    if (filteredLeads.length === 0) {
      toast.error('No leads to export');
      return;
    }

    const headers = ['Name', 'Email', 'Phone', 'Company', 'Source', 'Status', 'Priority', 'Tags', 'Created'];
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map(lead => [
        lead.name,
        lead.email,
        lead.phone || '',
        lead.company || '',
        lead.source,
        lead.status,
        lead.priority,
        lead.tags.join(';'),
        lead.createdAt.toLocaleDateString(),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Leads exported successfully');
  };

  const sources = Array.from(new Set(leads.map(lead => lead.source)));
  
  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  // Determine which columns to show based on screen size
  const getVisibleColumns = () => {
    if (isMobile) {
      return ['Lead', 'Status', 'Actions'];
    } else if (isTablet) {
      return ['Lead', 'Contact', 'Status', 'Actions'];
    } else {
      return ['Lead', 'Contact', 'Source', 'Status', 'Tags', 'Created', 'Actions'];
    }
  };
  
  const visibleColumns = getVisibleColumns();

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Leads Management</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshLeads}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button variant="outline" size="sm" onClick={exportLeads}>
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Add Lead</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {sources.map(source => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {filteredLeads.length !== leads.length && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Showing {filteredLeads.length} of {leads.length} leads
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setSourceFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Table */}
      {filteredLeads.length > 0 ? (
        <Card>
          <CardContent className="p-0 overflow-auto">
            <div className="responsive-table">
              <Table>
                <TableHeader>
                  <TableRow>
                    {visibleColumns.includes('Lead') && <TableHead>Lead</TableHead>}
                    {visibleColumns.includes('Contact') && <TableHead>Contact</TableHead>}
                    {visibleColumns.includes('Source') && <TableHead>Source</TableHead>}
                    {visibleColumns.includes('Status') && <TableHead>Status</TableHead>}
                    {visibleColumns.includes('Tags') && <TableHead>Tags</TableHead>}
                    {visibleColumns.includes('Created') && <TableHead>Created</TableHead>}
                    {visibleColumns.includes('Actions') && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLeads.map((lead, index) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      {visibleColumns.includes('Lead') && (
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8 hidden sm:flex">
                              <AvatarFallback className="text-xs">
                                {lead.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{lead.name}</div>
                              {lead.company && (
                                <div className="text-sm text-gray-500">{lead.company}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      )}
                      
                      {visibleColumns.includes('Contact') && (
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="w-3 h-3 mr-1 text-gray-400" />
                              {lead.email}
                            </div>
                            {lead.phone && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="w-3 h-3 mr-1 text-gray-400" />
                                {lead.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      )}
                      
                      {visibleColumns.includes('Source') && (
                        <TableCell>
                          <Badge variant="outline">{lead.source}</Badge>
                        </TableCell>
                      )}
                      
                      {visibleColumns.includes('Status') && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Badge className={`${statusColors[lead.status]} cursor-pointer hover:opacity-80`}>
                                {lead.status.toUpperCase()}
                              </Badge>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleQuickStatusUpdate(lead.id, 'new')}>
                                New
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleQuickStatusUpdate(lead.id, 'contacted')}>
                                Contacted
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleQuickStatusUpdate(lead.id, 'proposal')}>
                                Proposal
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleQuickStatusUpdate(lead.id, 'converted')}>
                                Converted
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleQuickStatusUpdate(lead.id, 'lost')}>
                                Lost
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                      
                      {visibleColumns.includes('Tags') && (
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {lead.tags.slice(0, 2).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className={`text-xs ${tagColors[tag] || 'bg-gray-100 text-gray-800'}`}
                              >
                                {tag}
                              </Badge>
                            ))}
                            {lead.tags.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{lead.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      )}
                      
                      {visibleColumns.includes('Created') && (
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {lead.createdAt.toLocaleDateString()}
                            </div>
                            {lead.lastContact && (
                              <div className="text-xs text-gray-500 mt-1">
                                Last: {lead.lastContact.toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      )}
                      
                      {visibleColumns.includes('Actions') && (
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" disabled={actionLoading === lead.id}>
                                {actionLoading === lead.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <MoreHorizontal className="w-4 h-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedLead(lead)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setSelectedLead(lead)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Lead
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="w-4 h-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Add Note
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleConvertLead(lead.id)}
                                disabled={lead.status === 'converted'}
                              >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Convert to Client
                              </DropdownMenuItem>
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
                                    <AlertDialogTitle>Delete Lead</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the lead
                                      "{lead.name}" and all associated data.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteLead(lead.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete Lead
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {leads.length === 0 ? 'No leads yet' : 'No leads match your filters'}
            </h3>
            <p className="text-gray-600 mb-6">
              {leads.length === 0 
                ? 'Start by adding your first lead or importing from other sources'
                : 'Try adjusting your search criteria or filters'
              }
            </p>
            {leads.length === 0 && (
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Lead
              </Button>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Pagination */}
      {filteredLeads.length > itemsPerPage && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredLeads.length)} of {filteredLeads.length} leads
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Lead Detail Modal/Drawer */}
      {selectedLead && (
        <ResponsiveLeadDetail
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
      )}
    </div>
  );
}