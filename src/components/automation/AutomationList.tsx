import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Play,
  Pause,
  Edit,
  Copy,
  Trash2,
  MoreHorizontal,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Loader2,
  AlertCircle,
  FileText,
  Mail,
  Table,
  Calendar,
  Webhook,
  Brain,
  Workflow
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { Automation } from '@/types/automation';

interface AutomationListProps {
  automations: Automation[];
  isLoading: boolean;
  onEdit: (automation: Automation) => void;
  onToggleStatus: (automationId: string) => void;
  onDuplicate: (automation: Automation) => void;
  onDelete: (automationId: string) => void;
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  draft: 'bg-gray-100 text-gray-800',
};

const triggerIcons: Record<string, any> = {
  new_lead: Zap,
  lead_updated: Edit,
  lead_converted: CheckCircle,
  form_submitted: FileText,
  payment_received: CheckCircle,
  email_opened: Mail,
  email_clicked: Mail,
  scheduled_trigger: Clock,
};

const actionIcons: Record<string, any> = {
  send_email: Mail,
  create_task: CheckCircle,
  update_lead: Edit,
  google_sheets: Table,
  calendly: Calendar,
  webhook: Webhook,
  ai_generate: Brain,
  make_workflow: Workflow,
  n8n_workflow: Workflow,
};

export default function AutomationList({
  automations,
  isLoading,
  onEdit,
  onToggleStatus,
  onDuplicate,
  onDelete
}: AutomationListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (automationId: string) => {
    onDelete(automationId);
    setDeletingId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading automations...</p>
        </div>
      </div>
    );
  }

  if (automations.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Zap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No automations found</h3>
          <p className="text-gray-600 mb-6">
            Create your first automation to start automating your workflow
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {automations.map((automation, index) => {
        const TriggerIcon = triggerIcons[automation.trigger.type] || Zap;
        const successRate = automation.stats.runs > 0 
          ? Math.round((automation.stats.successful / automation.stats.runs) * 100) 
          : 0;
        
        return (
          <motion.div
            key={automation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2 }}
          >
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer"
                  onClick={() => onEdit(automation)}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-lg">{automation.name}</CardTitle>
                    <Badge className={statusColors[automation.status]}>
                      {automation.status.toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription>{automation.description}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onEdit(automation);
                    }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(automation);
                    }}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onToggleStatus(automation.id);
                    }}>
                      {automation.status === 'active' ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog open={deletingId === automation.id} onOpenChange={(open) => !open && setDeletingId(null)}>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(automation.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the automation "{automation.name}".
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(automation.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Trigger and Actions */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <TriggerIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Trigger: {formatTriggerType(automation.trigger.type)}</p>
                      {automation.conditions.length > 0 && (
                        <p className="text-xs text-gray-500">
                          {automation.conditions.length} condition{automation.conditions.length > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-[18px] flex justify-center">
                      <div className="h-6 w-0.5 bg-gray-200"></div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 mx-2" />
                    <div className="flex flex-wrap gap-2">
                      {automation.actions.map((action, actionIndex) => {
                        const ActionIcon = actionIcons[action.type] || Zap;
                        return (
                          <Badge key={actionIndex} variant="outline" className="flex items-center space-x-1">
                            <ActionIcon className="w-3 h-3" />
                            <span>{formatActionType(action.type)}</span>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Stats */}
                {automation.stats.runs > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Success Rate</span>
                      <span className="font-medium">{successRate}%</span>
                    </div>
                    <Progress value={successRate} className="h-1.5" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{automation.stats.successful} successful</span>
                      <span>{automation.stats.failed} failed</span>
                    </div>
                    {automation.stats.lastRun && (
                      <div className="text-xs text-gray-500 mt-1">
                        Last run: {automation.stats.lastRun.toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex space-x-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStatus(automation.id);
                    }}
                  >
                    {automation.status === 'active' ? (
                      <>
                        <Pause className="w-3 h-3 mr-1" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(automation);
                    }}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
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