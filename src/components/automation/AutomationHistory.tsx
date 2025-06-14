import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ArrowDown,
  ArrowUp,
  RefreshCw,
  Download,
  Calendar,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Automation, AutomationExecution } from '@/types/automation';
import { toast } from 'sonner';

interface AutomationHistoryProps {
  automations: Automation[];
}

export default function AutomationHistory({ automations }: AutomationHistoryProps) {
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [automationFilter, setAutomationFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadExecutionHistory();
  }, [automations]);

  const loadExecutionHistory = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, fetch from Firestore
      // For demo, generate mock data
      setTimeout(() => {
        const mockExecutions: AutomationExecution[] = [];
        
        // Generate mock executions for each automation
        automations.forEach(automation => {
          const executionCount = automation.stats.runs;
          
          for (let i = 0; i < executionCount; i++) {
            const isSuccess = i < automation.stats.successful;
            const daysAgo = Math.floor(Math.random() * 30);
            const hoursAgo = Math.floor(Math.random() * 24);
            
            const startTime = new Date();
            startTime.setDate(startTime.getDate() - daysAgo);
            startTime.setHours(startTime.getHours() - hoursAgo);
            
            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + Math.floor(Math.random() * 5) + 1);
            
            const execution: AutomationExecution = {
              id: `exec-${automation.id}-${i}`,
              automationId: automation.id,
              status: isSuccess ? 'success' : 'failed',
              startTime,
              endTime,
              trigger: {
                type: automation.trigger.type,
                data: {
                  id: `lead-${Math.floor(Math.random() * 1000)}`,
                  name: `Test Lead ${i}`,
                  email: `lead${i}@example.com`,
                  company: `Company ${i}`,
                  source: ['website', 'google-maps', 'linkedin'][Math.floor(Math.random() * 3)]
                }
              },
              actions: automation.actions.map(action => ({
                type: action.type,
                status: isSuccess ? 'success' : (Math.random() > 0.7 ? 'failed' : 'success'),
                executionTime: Math.floor(Math.random() * 5000) + 100,
                error: isSuccess ? undefined : 'Failed to execute action'
              })),
              error: isSuccess ? undefined : 'Automation execution failed'
            };
            
            mockExecutions.push(execution);
          }
        });
        
        // Sort by start time, most recent first
        mockExecutions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
        
        setExecutions(mockExecutions);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading execution history:', error);
      toast.error('Failed to load execution history');
      setIsLoading(false);
    }
  };

  const refreshHistory = async () => {
    setIsRefreshing(true);
    try {
      await loadExecutionHistory();
      toast.success('Execution history refreshed');
    } catch (error) {
      toast.error('Failed to refresh execution history');
    } finally {
      setIsRefreshing(false);
    }
  };

  const exportHistory = () => {
    if (filteredExecutions.length === 0) {
      toast.error('No executions to export');
      return;
    }

    // Create CSV content
    const headers = ['ID', 'Automation', 'Status', 'Start Time', 'End Time', 'Duration (ms)', 'Trigger', 'Error'];
    const csvContent = [
      headers.join(','),
      ...filteredExecutions.map(execution => {
        const automation = automations.find(a => a.id === execution.automationId);
        const duration = execution.endTime 
          ? execution.endTime.getTime() - execution.startTime.getTime() 
          : 0;
        
        return [
          execution.id,
          automation?.name || 'Unknown',
          execution.status,
          execution.startTime.toISOString(),
          execution.endTime?.toISOString() || '',
          duration,
          execution.trigger.type,
          execution.error || ''
        ].join(',');
      })
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `automation-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Execution history exported successfully');
  };

  // Apply filters
  const filteredExecutions = executions.filter(execution => {
    const matchesSearch = searchTerm === '' || 
      execution.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      execution.trigger.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (execution.error && execution.error.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || execution.status === statusFilter;
    
    const matchesAutomation = automationFilter === 'all' || execution.automationId === automationFilter;
    
    // Filter by date range
    const now = new Date();
    let startDate = new Date();
    
    switch (dateRange) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate = new Date(0); // All time
    }
    
    const matchesDateRange = execution.startTime >= startDate;
    
    return matchesSearch && matchesStatus && matchesAutomation && matchesDateRange;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading execution history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search executions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="running">Running</SelectItem>
              </SelectContent>
            </Select>
            <Select value={automationFilter} onValueChange={setAutomationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Automation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Automations</SelectItem>
                {automations.map(automation => (
                  <SelectItem key={automation.id} value={automation.id}>
                    {automation.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end mt-4 space-x-2">
            <Button 
              variant="outline" 
              onClick={refreshHistory}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              onClick={exportHistory}
              disabled={filteredExecutions.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Execution History */}
      {filteredExecutions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Execution History</CardTitle>
            <CardDescription>
              Showing {filteredExecutions.length} of {executions.length} executions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Automation</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExecutions.map((execution) => {
                    const automation = automations.find(a => a.id === execution.automationId);
                    const duration = execution.endTime 
                      ? Math.round((execution.endTime.getTime() - execution.startTime.getTime()) / 1000)
                      : 0;
                    
                    return (
                      <TableRow key={execution.id}>
                        <TableCell>
                          <Badge 
                            className={
                              execution.status === 'success' ? 'bg-green-100 text-green-800' :
                              execution.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }
                          >
                            {execution.status === 'success' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {execution.status === 'failed' && <XCircle className="w-3 h-3 mr-1" />}
                            {execution.status === 'running' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                            {execution.status.charAt(0).toUpperCase() + execution.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{automation?.name || 'Unknown'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Zap className="w-3 h-3 text-blue-600" />
                            <span>{formatTriggerType(execution.trigger.type)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span>{execution.startTime.toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {duration > 0 ? `${duration}s` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value={execution.id} className="border-0">
                              <AccordionTrigger className="py-0">
                                <span className="text-xs text-blue-600">View Details</span>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-3 pt-2">
                                  <div className="text-sm">
                                    <span className="font-medium">Trigger Data:</span>
                                    <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                                      {JSON.stringify(execution.trigger.data, null, 2)}
                                    </pre>
                                  </div>
                                  
                                  <div className="text-sm">
                                    <span className="font-medium">Actions:</span>
                                    <div className="mt-1 space-y-2">
                                      {execution.actions.map((action, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                          <Badge 
                                            className={
                                              action.status === 'success' ? 'bg-green-100 text-green-800' :
                                              action.status === 'failed' ? 'bg-red-100 text-red-800' :
                                              'bg-gray-100 text-gray-800'
                                            }
                                          >
                                            {action.status}
                                          </Badge>
                                          <span>{formatActionType(action.type)}</span>
                                          {action.executionTime && (
                                            <span className="text-xs text-gray-500">
                                              {(action.executionTime / 1000).toFixed(2)}s
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {execution.error && (
                                    <div className="text-sm">
                                      <span className="font-medium text-red-600">Error:</span>
                                      <p className="mt-1 text-xs text-red-600">{execution.error}</p>
                                    </div>
                                  )}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No execution history found</h3>
            <p className="text-gray-600 mb-4">
              {executions.length > 0 
                ? 'Try adjusting your filters to see more results' 
                : 'Run your automations to see execution history'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper functions to format trigger and action types for display
function formatTriggerType(type: string): string {
  const formatted = type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  return formatted;
}

function formatActionType(type: string): string {
  const typeMap: Record<string, string> = {
    'send_email': 'Send Email',
    'create_task': 'Create Task',
    'update_lead': 'Update Lead',
    'google_sheets': 'Google Sheets',
    'calendly': 'Schedule Meeting',
    'webhook': 'Webhook',
    'ai_generate': 'AI Generate',
    'make_workflow': 'Make.com',
    'n8n_workflow': 'n8n'
  };
  
  return typeMap[type] || type;
}