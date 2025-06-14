import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  Loader2,
  AlertCircle,
  RefreshCw,
  Download,
  List,
  Grid3X3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lead } from '@/lib/firestore';
import LeadCard from './LeadCard';
import LeadListItem from './LeadListItem';
import ResponsiveLeadDetail from './ResponsiveLeadDetail';
import { toast } from 'sonner';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface LeadListProps {
  leads: Lead[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onUpdate?: (leadId: string, updates: Partial<Lead>) => Promise<void>;
  onDelete?: (leadId: string) => Promise<void>;
  onConvert?: (leadId: string) => Promise<void>;
  onAddNote?: (leadId: string, note: string) => Promise<void>;
  onUpdateTags?: (leadId: string, tags: string[]) => Promise<void>;
  onAddLead?: () => void;
  canEdit?: (leadId: string) => boolean;
  canDelete?: (leadId: string) => boolean;
  canConvert?: boolean;
}

export default function LeadList({
  leads,
  isLoading = false,
  onRefresh,
  onUpdate,
  onDelete,
  onConvert,
  onAddNote,
  onUpdateTags,
  onAddLead,
  canEdit = () => true,
  canDelete = () => true,
  canConvert = true,
}: LeadListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const isMobile = useMediaQuery('(max-width: 640px)');

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      lead.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    if (!onUpdate) return;
    
    try {
      setActionLoading(leadId);
      await onUpdate(leadId, updates);
      
      // Update selected lead if it's the one being updated
      if (selectedLead?.id === leadId) {
        setSelectedLead(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
      }
      
      toast.success('Lead updated successfully');
    } catch (error) {
      toast.error('Failed to update lead');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!onDelete) return;
    
    try {
      setActionLoading(leadId);
      await onDelete(leadId);
      
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
    if (!onConvert) return;
    
    try {
      setActionLoading(leadId);
      await onConvert(leadId);
      
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
    if (!onAddNote) return;
    
    try {
      await onAddNote(leadId, note);
      toast.success('Note added successfully');
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const handleUpdateTags = async (leadId: string, tags: string[]) => {
    if (!onUpdateTags) return;
    
    try {
      await onUpdateTags(leadId, tags);
      
      if (selectedLead?.id === leadId) {
        setSelectedLead(prev => prev ? { ...prev, tags, updatedAt: new Date() } : null);
      }
      
      toast.success('Tags updated successfully');
    } catch (error) {
      toast.error('Failed to update tags');
    }
  };

  const exportLeads = () => {
    if (filteredLeads.length === 0) {
      toast.error('No leads to export');
      return;
    }

    const headers = ['Name', 'Email', 'Phone', 'Company', 'Value', 'Source', 'Status', 'Tags', 'Created'];
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map(lead => [
        `"${lead.name.replace(/"/g, '""')}"`,
        `"${lead.email.replace(/"/g, '""')}"`,
        `"${lead.phone?.replace(/"/g, '""') || ''}"`,
        `"${lead.company?.replace(/"/g, '""') || ''}"`,
        `"${lead.value?.replace(/"/g, '""') || '$0'}"`,
        `"${lead.source.replace(/"/g, '""')}"`,
        lead.status,
        `"${lead.tags.join(';').replace(/"/g, '""')}"`,
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

  // Get unique sources for filter
  const sources = Array.from(new Set(leads.map(lead => lead.source)));

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4 md:px-6 md:pb-3 md:pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-lg md:text-xl">Leads</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              {onRefresh && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="h-8 md:h-9"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={exportLeads} className="h-8 md:h-9">
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              {onAddLead && (
                <Button size="sm" onClick={onAddLead} className="h-8 md:h-9">
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Add Lead</span>
                </Button>
              )}
              <div className="flex border rounded-md overflow-hidden">
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                  size="sm" 
                  className="rounded-none h-8 md:h-9"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'ghost'} 
                  size="sm" 
                  className="rounded-none h-8 md:h-9"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-2 md:pt-3">
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

      {/* Lead Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading leads...</p>
          </div>
        </div>
      ) : filteredLeads.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onClick={setSelectedLead}
                onEdit={setSelectedLead}
                onDelete={handleDeleteLead}
                onConvert={handleConvertLead}
                isLoading={actionLoading === lead.id}
                canEdit={canEdit(lead.ownerId)}
                canDelete={canDelete(lead.ownerId)}
                canConvert={canConvert}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <LeadListItem
                    key={lead.id}
                    lead={lead}
                    onClick={setSelectedLead}
                    onEdit={setSelectedLead}
                    onDelete={handleDeleteLead}
                    onConvert={handleConvertLead}
                    isLoading={actionLoading === lead.id}
                    canEdit={canEdit(lead.ownerId)}
                    canDelete={canDelete(lead.ownerId)}
                    canConvert={canConvert}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )
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
            {leads.length === 0 && onAddLead && (
              <Button onClick={onAddLead}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Lead
              </Button>
            )}
          </CardContent>
        </Card>
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