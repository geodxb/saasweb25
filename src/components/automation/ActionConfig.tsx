import { useState, useEffect } from 'react';
import {
  Mail,
  CheckCircle,
  Edit,
  Table,
  Calendar,
  Webhook,
  Brain,
  Workflow,
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
import { AutomationAction } from '@/types/automation';

interface ActionConfigProps {
  action: AutomationAction;
  onSave: (action: AutomationAction) => void;
  onCancel: () => void;
}

export default function ActionConfig({ action, onSave, onCancel }: ActionConfigProps) {
  const [type, setType] = useState(action.type);
  const [config, setConfig] = useState(action.config);
  const [error, setError] = useState<string | null>(null);

  // Update config when action type changes
  useEffect(() => {
    // Set default config based on action type
    switch (type) {
      case 'send_email':
        setConfig({
          to: '{{lead.email}}',
          subject: '',
          body: '',
          useAI: false,
          aiPrompt: '',
          delay: 0
        });
        break;
      case 'create_task':
        setConfig({
          title: '',
          description: '',
          dueDate: '{{now+3d}}',
          priority: 'medium',
          assignTo: 'owner'
        });
        break;
      case 'update_lead':
        setConfig({
          status: '',
          tags: [],
          customFields: {}
        });
        break;
      case 'google_sheets':
        setConfig({
          spreadsheetId: '',
          sheetName: '',
          mappings: {}
        });
        break;
      case 'calendly':
        setConfig({
          eventType: '',
          inviteeEmail: '{{lead.email}}',
          inviteeName: '{{lead.name}}'
        });
        break;
      case 'webhook':
        setConfig({
          url: '',
          method: 'POST',
          headers: {},
          body: '{}'
        });
        break;
      case 'ai_generate':
        setConfig({
          prompt: '',
          model: 'gpt-4',
          outputField: '',
          temperature: 0.7
        });
        break;
      case 'make_workflow':
      case 'n8n_workflow':
        setConfig({
          webhookUrl: '',
          payload: '{}'
        });
        break;
      default:
        setConfig({});
    }
  }, [type]);

  const handleSave = () => {
    // Validate based on action type
    switch (type) {
      case 'send_email':
        if (!config.subject) {
          setError('Subject is required');
          return;
        }
        if (!config.body && !config.useAI) {
          setError('Body is required unless using AI');
          return;
        }
        if (config.useAI && !config.aiPrompt) {
          setError('AI prompt is required when using AI');
          return;
        }
        break;
      case 'create_task':
        if (!config.title) {
          setError('Task title is required');
          return;
        }
        break;
      case 'google_sheets':
        if (!config.spreadsheetId) {
          setError('Spreadsheet ID is required');
          return;
        }
        if (!config.sheetName) {
          setError('Sheet name is required');
          return;
        }
        break;
      case 'webhook':
        if (!config.url) {
          setError('Webhook URL is required');
          return;
        }
        break;
      case 'ai_generate':
        if (!config.prompt) {
          setError('Prompt is required');
          return;
        }
        if (!config.outputField) {
          setError('Output field is required');
          return;
        }
        break;
      case 'make_workflow':
      case 'n8n_workflow':
        if (!config.webhookUrl) {
          setError('Webhook URL is required');
          return;
        }
        break;
    }
    
    onSave({
      type,
      config
    });
  };

  const renderActionConfig = () => {
    switch (type) {
      case 'send_email':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                value={config.to || '{{lead.email}}'}
                onChange={(e) => setConfig({ ...config, to: e.target.value })}
                placeholder="{{lead.email}}"
              />
              <p className="text-xs text-gray-500">
                Use {'{{lead.email}}'} to send to the lead's email address
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={config.subject || ''}
                onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                placeholder="Enter email subject"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.useAI || false}
                onCheckedChange={(checked) => setConfig({ ...config, useAI: checked })}
                id="useAI"
              />
              <Label htmlFor="useAI" className="flex items-center cursor-pointer">
                <Sparkles className="w-4 h-4 mr-1 text-purple-600" />
                Use AI to generate email content
              </Label>
            </div>
            
            {config.useAI ? (
              <div className="space-y-2">
                <Label htmlFor="aiPrompt">AI Prompt</Label>
                <Textarea
                  id="aiPrompt"
                  value={config.aiPrompt || ''}
                  onChange={(e) => setConfig({ ...config, aiPrompt: e.target.value })}
                  placeholder="Write a personalized follow-up email to {{lead.name}} about their interest in our services."
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500">
                  Use variables like {'{{lead.name}}'}, {'{{lead.company}}'}, etc. to personalize the prompt
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="body">Email Body</Label>
                <Textarea
                  id="body"
                  value={config.body || ''}
                  onChange={(e) => setConfig({ ...config, body: e.target.value })}
                  placeholder="Enter email body"
                  className="min-h-[150px]"
                />
                <p className="text-xs text-gray-500">
                  Use variables like {'{{lead.name}}'}, {'{{lead.company}}'}, etc. to personalize the email
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="delay">Delay (hours)</Label>
              <Input
                id="delay"
                type="number"
                min="0"
                value={config.delay || 0}
                onChange={(e) => setConfig({ ...config, delay: parseInt(e.target.value) })}
                placeholder="0"
              />
              <p className="text-xs text-gray-500">
                Delay sending the email by this many hours (0 for immediate)
              </p>
            </div>
          </div>
        );
      
      case 'create_task':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={config.title || ''}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={config.description || ''}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                placeholder="Enter task description"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                value={config.dueDate || '{{now+3d}}'}
                onChange={(e) => setConfig({ ...config, dueDate: e.target.value })}
                placeholder="{{now+3d}}"
              />
              <p className="text-xs text-gray-500">
                Use {'{{now+Xd}}'} for X days from now, or {'{{now+Xh}}'} for X hours
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={config.priority || 'medium'} 
                onValueChange={(value) => setConfig({ ...config, priority: value })}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assignTo">Assign To</Label>
              <Select 
                value={config.assignTo || 'owner'} 
                onValueChange={(value) => setConfig({ ...config, assignTo: value })}
              >
                <SelectTrigger id="assignTo">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Lead Owner</SelectItem>
                  <SelectItem value="me">Me</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 'update_lead':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={config.status || ''} 
                onValueChange={(value) => setConfig({ ...config, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Don't change</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={Array.isArray(config.tags) ? config.tags.join(', ') : config.tags || ''}
                onChange={(e) => {
                  const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                  setConfig({ ...config, tags: tagsArray });
                }}
                placeholder="tag1, tag2, tag3"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Add Note</Label>
              <Textarea
                id="notes"
                value={config.notes || ''}
                onChange={(e) => setConfig({ ...config, notes: e.target.value })}
                placeholder="Enter note to add to lead"
              />
            </div>
          </div>
        );
      
      case 'google_sheets':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="spreadsheetId">Spreadsheet ID</Label>
              <Input
                id="spreadsheetId"
                value={config.spreadsheetId || ''}
                onChange={(e) => setConfig({ ...config, spreadsheetId: e.target.value })}
                placeholder="Enter Google Sheets ID"
              />
              <p className="text-xs text-gray-500">
                Find this in your Google Sheets URL: docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sheetName">Sheet Name</Label>
              <Input
                id="sheetName"
                value={config.sheetName || ''}
                onChange={(e) => setConfig({ ...config, sheetName: e.target.value })}
                placeholder="Sheet1"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Column Mappings</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Column A"
                  value={config.mappings?.A || ''}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    mappings: { ...(config.mappings || {}), A: e.target.value } 
                  })}
                />
                <Input
                  placeholder="{{lead.name}}"
                  value={config.mappings?.B || ''}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    mappings: { ...(config.mappings || {}), B: e.target.value } 
                  })}
                />
                <Input
                  placeholder="Column C"
                  value={config.mappings?.C || ''}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    mappings: { ...(config.mappings || {}), C: e.target.value } 
                  })}
                />
                <Input
                  placeholder="{{lead.email}}"
                  value={config.mappings?.D || ''}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    mappings: { ...(config.mappings || {}), D: e.target.value } 
                  })}
                />
              </div>
              <p className="text-xs text-gray-500">
                Map lead data to spreadsheet columns using variables like {'{{lead.name}}'}
              </p>
            </div>
          </div>
        );
      
      case 'calendly':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type</Label>
              <Select 
                value={config.eventType || ''} 
                onValueChange={(value) => setConfig({ ...config, eventType: value })}
              >
                <SelectTrigger id="eventType">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15min">15 Minute Meeting</SelectItem>
                  <SelectItem value="30min">30 Minute Meeting</SelectItem>
                  <SelectItem value="60min">60 Minute Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="inviteeEmail">Invitee Email</Label>
              <Input
                id="inviteeEmail"
                value={config.inviteeEmail || '{{lead.email}}'}
                onChange={(e) => setConfig({ ...config, inviteeEmail: e.target.value })}
                placeholder="{{lead.email}}"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="inviteeName">Invitee Name</Label>
              <Input
                id="inviteeName"
                value={config.inviteeName || '{{lead.name}}'}
                onChange={(e) => setConfig({ ...config, inviteeName: e.target.value })}
                placeholder="{{lead.name}}"
              />
            </div>
          </div>
        );
      
      case 'webhook':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Webhook URL</Label>
              <Input
                id="url"
                value={config.url || ''}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                placeholder="https://example.com/webhook"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="method">HTTP Method</Label>
              <Select 
                value={config.method || 'POST'} 
                onValueChange={(value) => setConfig({ ...config, method: value })}
              >
                <SelectTrigger id="method">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="body">Request Body</Label>
              <Textarea
                id="body"
                value={config.body || '{}'}
                onChange={(e) => setConfig({ ...config, body: e.target.value })}
                placeholder='{"leadId": "{{lead.id}}", "name": "{{lead.name}}"}'
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Use JSON format with variables like {'{{lead.name}}'}
              </p>
            </div>
          </div>
        );
      
      case 'ai_generate':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">AI Prompt</Label>
              <Textarea
                id="prompt"
                value={config.prompt || ''}
                onChange={(e) => setConfig({ ...config, prompt: e.target.value })}
                placeholder="Write a personalized follow-up email to {{lead.name}} about their interest in our services."
                className="min-h-[100px]"
              />
              <p className="text-xs text-gray-500">
                Use variables like {'{{lead.name}}'}, {'{{lead.company}}'}, etc. to personalize the prompt
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="model">AI Model</Label>
              <Select 
                value={config.model || 'gpt-4'} 
                onValueChange={(value) => setConfig({ ...config, model: value })}
              >
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4 (Most Powerful)</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="outputField">Output Field</Label>
              <Select 
                value={config.outputField || ''} 
                onValueChange={(value) => setConfig({ ...config, outputField: value })}
              >
                <SelectTrigger id="outputField">
                  <SelectValue placeholder="Select where to store the output" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead.notes">Lead Notes</SelectItem>
                  <SelectItem value="email.body">Email Body</SelectItem>
                  <SelectItem value="task.description">Task Description</SelectItem>
                  <SelectItem value="custom_field">Custom Field</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {config.outputField === 'custom_field' && (
              <div className="space-y-2">
                <Label htmlFor="customFieldName">Custom Field Name</Label>
                <Input
                  id="customFieldName"
                  value={config.customFieldName || ''}
                  onChange={(e) => setConfig({ ...config, customFieldName: e.target.value })}
                  placeholder="e.g., aiGeneratedContent"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.temperature || 0.7}
                onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>More Predictable</span>
                <span>More Creative</span>
              </div>
            </div>
          </div>
        );
      
      case 'make_workflow':
      case 'n8n_workflow':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                value={config.webhookUrl || ''}
                onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                placeholder={`Enter ${type === 'make_workflow' ? 'Make.com' : 'n8n'} webhook URL`}
              />
              <p className="text-xs text-gray-500">
                {type === 'make_workflow' 
                  ? 'Find this in your Make.com scenario webhook settings'
                  : 'Find this in your n8n workflow webhook node'}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payload">Payload (JSON)</Label>
              <Textarea
                id="payload"
                value={config.payload || '{}'}
                onChange={(e) => setConfig({ ...config, payload: e.target.value })}
                placeholder='{"leadId": "{{lead.id}}", "name": "{{lead.name}}"}'
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Use JSON format with variables like {'{{lead.name}}'}
              </p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">Unknown action type</h3>
            <p className="text-xs text-gray-500">
              Please select a different action type
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="actionType">Action Type</Label>
        <Select value={type} onValueChange={(value) => setType(value as AutomationAction['type'])}>
          <SelectTrigger id="actionType">
            <SelectValue placeholder="Select an action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="send_email">Send Email</SelectItem>
            <SelectItem value="create_task">Create Task</SelectItem>
            <SelectItem value="update_lead">Update Lead</SelectItem>
            <SelectItem value="google_sheets">Add to Google Sheets</SelectItem>
            <SelectItem value="calendly">Schedule Calendly Meeting</SelectItem>
            <SelectItem value="webhook">Send to Webhook</SelectItem>
            <SelectItem value="ai_generate">Generate with AI</SelectItem>
            <SelectItem value="make_workflow">Trigger Make.com Workflow</SelectItem>
            <SelectItem value="n8n_workflow">Trigger n8n Workflow</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {renderActionConfig()}
      
      {error && (
        <div className="text-sm text-red-500 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Action
        </Button>
      </div>
    </div>
  );
}