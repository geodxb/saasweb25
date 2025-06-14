import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Plus,
  Trash2,
  ArrowRight,
  Settings,
  Save,
  Play,
  Filter,
  Mail,
  FileText,
  Calendar,
  Table,
  Webhook,
  Brain,
  Database,
  Workflow,
  CheckCircle,
  Edit,
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Automation, AutomationTrigger, AutomationCondition, AutomationAction } from '@/types/automation';
import { toast } from 'sonner';
import TriggerConfig from './TriggerConfig';
import ConditionConfig from './ConditionConfig';
import ActionConfig from './ActionConfig';

interface AutomationEditorProps {
  automation: Automation;
  onSave: (automation: Automation) => Promise<void>;
  onCancel: () => void;
}

export default function AutomationEditor({ automation, onSave, onCancel }: AutomationEditorProps) {
  const [name, setName] = useState(automation.name);
  const [description, setDescription] = useState(automation.description);
  const [status, setStatus] = useState(automation.status);
  const [trigger, setTrigger] = useState<AutomationTrigger>(automation.trigger);
  const [conditions, setConditions] = useState<AutomationCondition[]>(automation.conditions);
  const [actions, setActions] = useState<AutomationAction[]>(automation.actions);
  const [activeStep, setActiveStep] = useState<'trigger' | 'conditions' | 'actions'>('trigger');
  const [isEditingCondition, setIsEditingCondition] = useState<number | null>(null);
  const [isEditingAction, setIsEditingAction] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = async () => {
    // Validate
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!trigger.type) {
      newErrors.trigger = 'Trigger is required';
    }
    
    if (actions.length === 0) {
      newErrors.actions = 'At least one action is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors before saving');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const updatedAutomation: Automation = {
        ...automation,
        name,
        description,
        status,
        trigger,
        conditions,
        actions,
        updatedAt: new Date()
      };
      
      await onSave(updatedAutomation);
    } catch (error) {
      console.error('Error saving automation:', error);
      toast.error('Failed to save automation');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCondition = () => {
    const newCondition: AutomationCondition = {
      field: 'lead.name',
      operator: 'contains',
      value: ''
    };
    
    setConditions([...conditions, newCondition]);
    setIsEditingCondition(conditions.length);
  };

  const handleUpdateCondition = (index: number, condition: AutomationCondition) => {
    const newConditions = [...conditions];
    newConditions[index] = condition;
    setConditions(newConditions);
    setIsEditingCondition(null);
  };

  const handleDeleteCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleAddAction = () => {
    const newAction: AutomationAction = {
      type: 'send_email',
      config: {
        template: '',
        subject: '',
        body: '',
        useAI: false
      }
    };
    
    setActions([...actions, newAction]);
    setIsEditingAction(actions.length);
  };

  const handleUpdateAction = (index: number, action: AutomationAction) => {
    const newActions = [...actions];
    newActions[index] = action;
    setActions(newActions);
    setIsEditingAction(null);
  };

  const handleDeleteAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'new_lead':
        return <Zap className="w-5 h-5 text-blue-600" />;
      case 'lead_updated':
        return <Edit className="w-5 h-5 text-orange-600" />;
      case 'lead_converted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'form_submitted':
        return <FileText className="w-5 h-5 text-purple-600" />;
      case 'payment_received':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'email_opened':
      case 'email_clicked':
        return <Mail className="w-5 h-5 text-red-600" />;
      case 'scheduled_trigger':
        return <Calendar className="w-5 h-5 text-indigo-600" />;
      default:
        return <Zap className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'send_email':
        return <Mail className="w-5 h-5 text-red-600" />;
      case 'create_task':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'update_lead':
        return <Edit className="w-5 h-5 text-orange-600" />;
      case 'google_sheets':
        return <Table className="w-5 h-5 text-green-600" />;
      case 'calendly':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'webhook':
        return <Webhook className="w-5 h-5 text-purple-600" />;
      case 'ai_generate':
        return <Brain className="w-5 h-5 text-indigo-600" />;
      case 'make_workflow':
      case 'n8n_workflow':
        return <Workflow className="w-5 h-5 text-blue-600" />;
      default:
        return <Zap className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Details</CardTitle>
          <CardDescription>Configure the basic information for your automation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter automation name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this automation does"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as Automation['status'])}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Builder</CardTitle>
          <CardDescription>Configure the trigger, conditions, and actions for your automation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={activeStep} onValueChange={(value) => setActiveStep(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trigger" className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Trigger</span>
              </TabsTrigger>
              <TabsTrigger value="conditions" className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>Conditions</span>
                {conditions.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{conditions.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="actions" className="flex items-center space-x-2">
                <Play className="w-4 h-4" />
                <span>Actions</span>
                {actions.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{actions.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="trigger" className="space-y-4 pt-4">
              <TriggerConfig 
                trigger={trigger} 
                onUpdate={setTrigger} 
                error={errors.trigger}
              />
              
              <div className="flex justify-end">
                <Button onClick={() => setActiveStep('conditions')}>
                  Next: Conditions
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="conditions" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Conditions (Optional)</h3>
                  <Button variant="outline" size="sm" onClick={handleAddCondition}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Condition
                  </Button>
                </div>
                
                {conditions.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <Filter className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No conditions</h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Add conditions to filter when this automation should run
                    </p>
                    <Button variant="outline" size="sm" onClick={handleAddCondition}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Condition
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conditions.map((condition, index) => (
                      <Card key={index} className="relative">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Filter className="w-5 h-5 text-blue-600" />
                              <div>
                                <p className="font-medium">
                                  {formatCondition(condition)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setIsEditingCondition(index)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteCondition(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                {isEditingCondition !== null && (
                  <Dialog open={isEditingCondition !== null} onOpenChange={() => setIsEditingCondition(null)}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Configure Condition</DialogTitle>
                        <DialogDescription>
                          Set up a condition to filter when this automation should run
                        </DialogDescription>
                      </DialogHeader>
                      <ConditionConfig 
                        condition={conditions[isEditingCondition] || {
                          field: 'lead.name',
                          operator: 'contains',
                          value: ''
                        }}
                        onSave={(condition) => handleUpdateCondition(isEditingCondition, condition)}
                        onCancel={() => setIsEditingCondition(null)}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveStep('trigger')}>
                  Back: Trigger
                </Button>
                <Button onClick={() => setActiveStep('actions')}>
                  Next: Actions
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="actions" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Actions</h3>
                  <Button variant="outline" size="sm" onClick={handleAddAction}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Action
                  </Button>
                </div>
                
                {actions.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <Play className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No actions</h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Add actions to perform when this automation runs
                    </p>
                    <Button variant="outline" size="sm" onClick={handleAddAction}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Action
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {actions.map((action, index) => (
                      <Card key={index} className="relative">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getActionIcon(action.type)}
                              <div>
                                <p className="font-medium">
                                  {formatActionType(action.type)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatActionConfig(action)}
                                </p>
                                {action.config.useAI && (
                                  <Badge className="mt-1 bg-purple-100 text-purple-800">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    AI-Powered
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setIsEditingAction(index)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteAction(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                {isEditingAction !== null && (
                  <Dialog open={isEditingAction !== null} onOpenChange={() => setIsEditingAction(null)}>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Configure Action</DialogTitle>
                        <DialogDescription>
                          Set up an action to perform when this automation runs
                        </DialogDescription>
                      </DialogHeader>
                      <ActionConfig 
                        action={actions[isEditingAction] || {
                          type: 'send_email',
                          config: {}
                        }}
                        onSave={(action) => handleUpdateAction(isEditingAction, action)}
                        onCancel={() => setIsEditingAction(null)}
                      />
                    </DialogContent>
                  </Dialog>
                )}
                
                {errors.actions && (
                  <div className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errors.actions}
                  </div>
                )}
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveStep('conditions')}>
                  Back: Conditions
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Automation
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Automation
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Helper functions to format condition and action for display
function formatCondition(condition: AutomationCondition): string {
  const fieldDisplay = condition.field.split('.').map(part => 
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join(' ');
  
  const operatorDisplay = {
    'equals': 'equals',
    'not_equals': 'does not equal',
    'contains': 'contains',
    'greater_than': 'is greater than',
    'less_than': 'is less than',
    'exists': 'exists',
    'not_exists': 'does not exist'
  }[condition.operator] || condition.operator;
  
  if (condition.operator === 'exists' || condition.operator === 'not_exists') {
    return `${fieldDisplay} ${operatorDisplay}`;
  }
  
  return `${fieldDisplay} ${operatorDisplay} "${condition.value}"`;
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

function formatActionConfig(action: AutomationAction): string {
  switch (action.type) {
    case 'send_email':
      return action.config.subject 
        ? `Subject: ${action.config.subject}` 
        : 'Send an email';
    case 'create_task':
      return action.config.title 
        ? `Task: ${action.config.title}` 
        : 'Create a task';
    case 'update_lead':
      return 'Update lead properties';
    case 'google_sheets':
      return action.config.spreadsheetId 
        ? `Add to Google Sheet` 
        : 'Add to Google Sheets';
    case 'calendly':
      return 'Schedule a meeting';
    case 'webhook':
      return action.config.url 
        ? `Send to webhook` 
        : 'Send to webhook';
    case 'ai_generate':
      return 'Generate content with AI';
    case 'make_workflow':
      return 'Trigger Make.com workflow';
    case 'n8n_workflow':
      return 'Trigger n8n workflow';
    default:
      return 'Perform action';
  }
}