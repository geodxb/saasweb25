import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Plus,
  Play,
  Pause,
  Settings,
  MoreHorizontal,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Trash2,
  Copy,
  Eye,
  Filter,
  Mail,
  FileText,
  Calendar,
  Table,
  Webhook,
  Brain,
  Database,
  Workflow,
  AlertCircle,
  Loader2,
  Search,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronRight,
  Edit,
  Save,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import GoBackButton from '@/components/common/GoBackButton';
import AutomationEditor from '@/components/automation/AutomationEditor';
import AutomationList from '@/components/automation/AutomationList';
import AutomationHistory from '@/components/automation/AutomationHistory';
import { Automation } from '@/types/automation';

export default function AutomationBuilder() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('automations');
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user) {
      loadAutomations();
    }
  }, [user]);

  const loadAutomations = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, fetch from Firestore
      // For demo, use mock data
      setTimeout(() => {
        const mockAutomations: Automation[] = [
          {
            id: 'auto-1',
            name: 'New Lead Follow-up',
            description: 'Automatically send a follow-up email when a new lead is created',
            status: 'active',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            ownerId: user?.uid || 'user123',
            trigger: {
              type: 'new_lead',
              config: {}
            },
            conditions: [
              {
                field: 'lead.source',
                operator: 'equals',
                value: 'website'
              }
            ],
            actions: [
              {
                type: 'send_email',
                config: {
                  template: 'follow-up-email',
                  useAI: true,
                  aiPrompt: 'Write a personalized follow-up email to {{lead.name}} about their interest in our services.',
                  subject: 'Following up on your inquiry',
                  delay: 24 // hours
                }
              },
              {
                type: 'create_task',
                config: {
                  title: 'Follow up with {{lead.name}}',
                  description: 'Check if they received the follow-up email and answer any questions.',
                  dueDate: '{{now+3d}}',
                  assignTo: 'owner'
                }
              }
            ],
            stats: {
              runs: 24,
              successful: 22,
              failed: 2,
              lastRun: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            }
          },
          {
            id: 'auto-2',
            name: 'Lead to Google Sheets',
            description: 'Export new leads to Google Sheets for tracking',
            status: 'active',
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            ownerId: user?.uid || 'user123',
            trigger: {
              type: 'new_lead',
              config: {}
            },
            conditions: [],
            actions: [
              {
                type: 'google_sheets',
                config: {
                  spreadsheetId: '1xyzABC123',
                  sheetName: 'Leads',
                  mappings: {
                    'A': '{{lead.name}}',
                    'B': '{{lead.email}}',
                    'C': '{{lead.phone}}',
                    'D': '{{lead.company}}',
                    'E': '{{lead.source}}',
                    'F': '{{now}}'
                  }
                }
              }
            ],
            stats: {
              runs: 47,
              successful: 45,
              failed: 2,
              lastRun: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            }
          },
          {
            id: 'auto-3',
            name: 'High-Value Lead Notification',
            description: 'Send SMS and create task for high-value leads',
            status: 'paused',
            createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            ownerId: user?.uid || 'user123',
            trigger: {
              type: 'lead_updated',
              config: {}
            },
            conditions: [
              {
                field: 'lead.value',
                operator: 'greater_than',
                value: '5000'
              }
            ],
            actions: [
              {
                type: 'send_email',
                config: {
                  to: '{{user.email}}',
                  subject: 'High-Value Lead Alert: {{lead.name}}',
                  body: 'A high-value lead ({{lead.value}}) has been identified: {{lead.name}} from {{lead.company}}.',
                  useAI: false
                }
              },
              {
                type: 'create_task',
                config: {
                  title: 'Contact high-value lead: {{lead.name}}',
                  description: 'This lead is valued at {{lead.value}} and requires immediate attention.',
                  priority: 'high',
                  dueDate: '{{now+1d}}',
                  assignTo: 'owner'
                }
              }
            ],
            stats: {
              runs: 12,
              successful: 10,
              failed: 2,
              lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        ];
        
        setAutomations(mockAutomations);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading automations:', error);
      toast.error('Failed to load automations');
      setIsLoading(false);
    }
  };

  const refreshAutomations = async () => {
    setIsRefreshing(true);
    try {
      await loadAutomations();
      toast.success('Automations refreshed');
    } catch (error) {
      toast.error('Failed to refresh automations');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateAutomation = () => {
    if (!user) {
      toast.error('You must be logged in to create automations');
      return;
    }

    const newAutomation: Automation = {
      id: `auto-${Date.now()}`,
      name: 'New Automation',
      description: 'Describe your automation here',
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: user.uid,
      trigger: {
        type: 'new_lead',
        config: {}
      },
      conditions: [],
      actions: [],
      stats: {
        runs: 0,
        successful: 0,
        failed: 0
      }
    };
    
    setSelectedAutomation(newAutomation);
    setIsEditorOpen(true);
  };

  const handleEditAutomation = (automation: Automation) => {
    setSelectedAutomation(automation);
    setIsEditorOpen(true);
  };

  const handleSaveAutomation = async (automation: Automation) => {
    try {
      // In a real implementation, save to Firestore
      // For demo, update local state
      const isNew = !automations.some(a => a.id === automation.id);
      
      if (isNew) {
        setAutomations([...automations, automation]);
      } else {
        setAutomations(automations.map(a => a.id === automation.id ? automation : a));
      }
      
      setIsEditorOpen(false);
      setSelectedAutomation(null);
      
      toast.success(`Automation ${isNew ? 'created' : 'updated'} successfully`);
    } catch (error) {
      console.error('Error saving automation:', error);
      toast.error('Failed to save automation');
    }
  };

  const handleToggleAutomationStatus = (automationId: string) => {
    setAutomations(automations.map(a => {
      if (a.id === automationId) {
        const newStatus = a.status === 'active' ? 'paused' : 'active';
        toast.success(`Automation ${newStatus === 'active' ? 'activated' : 'paused'} successfully`);
        return { ...a, status: newStatus, updatedAt: new Date() };
      }
      return a;
    }));
  };

  const handleDuplicateAutomation = (automation: Automation) => {
    if (!user) return;
    
    const newAutomation: Automation = {
      ...automation,
      id: `auto-${Date.now()}`,
      name: `${automation.name} (Copy)`,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: user.uid,
      stats: {
        runs: 0,
        successful: 0,
        failed: 0
      }
    };
    
    setAutomations([...automations, newAutomation]);
    toast.success('Automation duplicated successfully');
  };

  const handleDeleteAutomation = (automationId: string) => {
    setAutomations(automations.filter(a => a.id !== automationId));
    toast.success('Automation deleted successfully');
  };

  const filteredAutomations = automations.filter(automation => {
    const matchesSearch = automation.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         automation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || automation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Automation Builder</h1>
          <p className="text-gray-600 mt-1">Create custom automations to streamline your workflow</p>
        </div>
        <Button onClick={handleCreateAutomation}>
          <Plus className="w-4 h-4 mr-2" />
          Create Automation
        </Button>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="automations" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>My Automations</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Execution History</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="automations" className="space-y-6 pt-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search automations..."
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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    onClick={refreshAutomations}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Automation Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Start Templates</CardTitle>
              <CardDescription>Get started with pre-built automation templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2"
                        onClick={handleCreateAutomation}>
                  <Mail className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium">Lead Follow-up</div>
                    <div className="text-sm text-gray-500">Automated email sequence</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2"
                        onClick={handleCreateAutomation}>
                  <Table className="w-6 h-6 text-green-600" />
                  <div className="text-left">
                    <div className="font-medium">Data Export</div>
                    <div className="text-sm text-gray-500">Export to spreadsheets</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2"
                        onClick={handleCreateAutomation}>
                  <Brain className="w-6 h-6 text-purple-600" />
                  <div className="text-left">
                    <div className="font-medium">AI Content Generator</div>
                    <div className="text-sm text-gray-500">Auto-generate content</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Automations List */}
          <AutomationList 
            automations={filteredAutomations}
            isLoading={isLoading}
            onEdit={handleEditAutomation}
            onToggleStatus={handleToggleAutomationStatus}
            onDuplicate={handleDuplicateAutomation}
            onDelete={handleDeleteAutomation}
          />
        </TabsContent>
        
        <TabsContent value="history" className="space-y-6 pt-6">
          <AutomationHistory automations={automations} />
        </TabsContent>
      </Tabs>

      {/* Automation Editor Dialog */}
      {selectedAutomation && (
        <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
          <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Automation Builder</DialogTitle>
              <DialogDescription>
                Design your custom automation workflow
              </DialogDescription>
            </DialogHeader>
            <AutomationEditor
              automation={selectedAutomation}
              onSave={handleSaveAutomation}
              onCancel={() => setIsEditorOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}