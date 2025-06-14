import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Workflow,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  BarChart3,
  Play,
  Settings,
  Plus,
  Eye,
  Clock,
  ArrowRight,
  ExternalLink,
  Key,
  Copy,
  Zap,
  Code
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { userApiKeyOperations } from '@/lib/userApiKeys';
import { n8nIntegration, N8nWorkflow, N8nWebhook } from '@/lib/integrations/n8nIntegration';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

export default function N8nIntegration() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [activeTab, setActiveTab] = useState('workflows');
  const [workflows, setWorkflows] = useState<N8nWorkflow[]>([]);
  const [webhooks, setWebhooks] = useState<N8nWebhook[]>([]);
  const [executionLogs, setExecutionLogs] = useState<any[]>([]);
  const [config, setConfig] = useState({
    webhookUrl: '',
    apiKey: ''
  });
  const [testData, setTestData] = useState('{\n  "event": "test",\n  "data": {\n    "message": "Hello from Locafyr"\n  }\n}');
  const [isWebhookInfoOpen, setIsWebhookInfoOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadIntegration();
    }
  }, [user]);

  const loadIntegration = async () => {
    setIsLoading(true);
    try {
      // Initialize n8n integration
      const initialized = await n8nIntegration.initialize();
      setIsConnected(initialized);
      
      if (initialized) {
        // Load configuration
        const userKeys = await userApiKeyOperations.getUserApiKeys();
        setConfig({
          webhookUrl: userKeys?.n8nWebhookUrl || '',
          apiKey: userKeys?.n8nApiKey || ''
        });
        
        // Load workflows and webhooks
        await loadWorkflows();
      }
    } catch (error) {
      console.error('Error loading n8n integration:', error);
      toast.error('Failed to load n8n integration');
    } finally {
      setIsLoading(false);
    }
  };

  const loadWorkflows = async () => {
    setIsRefreshing(true);
    try {
      // Load workflows
      const workflowsData = await n8nIntegration.getWorkflows();
      setWorkflows(workflowsData);
      
      // Load webhooks
      const webhooksData = await n8nIntegration.getWebhooks();
      setWebhooks(webhooksData);
      
      // Load execution logs
      const logsData = await n8nIntegration.getExecutionLogs();
      setExecutionLogs(logsData);
    } catch (error) {
      console.error('Error loading n8n data:', error);
      toast.error('Failed to load n8n data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!config.webhookUrl) {
      toast.error('Webhook URL is required');
      return;
    }
    
    setIsConfiguring(true);
    try {
      // Validate webhook URL
      const isValidUrl = await userApiKeyOperations.testWebhookUrl(config.webhookUrl);
      if (!isValidUrl) {
        toast.error('Invalid webhook URL format');
        return;
      }
      
      // Save configuration
      await userApiKeyOperations.saveUserApiKeys({
        n8nWebhookUrl: config.webhookUrl,
        n8nApiKey: config.apiKey
      });
      
      // Initialize integration with new config
      const initialized = await n8nIntegration.initialize();
      setIsConnected(initialized);
      
      if (initialized) {
        toast.success('n8n integration configured successfully');
        await loadWorkflows();
      }
    } catch (error) {
      console.error('Error configuring n8n integration:', error);
      toast.error('Failed to configure n8n integration');
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!config.webhookUrl) {
      toast.error('Webhook URL is required');
      return;
    }
    
    setIsTesting(true);
    try {
      // Parse test data
      let payload;
      try {
        payload = JSON.parse(testData);
      } catch (e) {
        toast.error('Invalid JSON format');
        return;
      }
      
      // Send test webhook
      const success = await n8nIntegration.triggerWebhook(payload);
      
      if (success) {
        toast.success('Test webhook sent successfully');
      } else {
        toast.error('Failed to send test webhook');
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast.error('Failed to send test webhook');
    } finally {
      setIsTesting(false);
    }
  };

  const handleTriggerWorkflow = async (workflowId: string) => {
    try {
      const success = await n8nIntegration.triggerWorkflow(workflowId);
      
      if (success) {
        toast.success('Workflow triggered successfully');
        // Refresh workflows after a short delay
        setTimeout(() => loadWorkflows(), 2000);
      } else {
        toast.error('Failed to trigger workflow');
      }
    } catch (error) {
      console.error('Error triggering workflow:', error);
      toast.error('Failed to trigger workflow');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Workflow className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>n8n</CardTitle>
              <CardDescription>Connect with n8n workflow automation platform</CardDescription>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={isConnected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
          >
            {isConnected ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </>
            ) : (
              <>
                <X className="w-3 h-3 mr-1" />
                Not Connected
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Configuration</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadIntegration}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">n8n Webhook URL</Label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  id="webhookUrl"
                  value={config.webhookUrl}
                  onChange={(e) => setConfig({...config, webhookUrl: e.target.value})}
                  placeholder="https://your-n8n-instance.com/webhook/..."
                />
                {config.webhookUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => copyToClipboard(config.webhookUrl)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Button 
                variant="outline"
                onClick={() => setIsWebhookInfoOpen(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Help
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Create a webhook in n8n and paste the URL here. This is required for Locafyr to send data to n8n.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="apiKey">n8n API Key (Optional)</Label>
            <Input
              id="apiKey"
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({...config, apiKey: e.target.value})}
              placeholder="Enter your n8n API key"
            />
            <p className="text-xs text-gray-500">
              Optional: Add your n8n API key to enable additional features like triggering workflows.
            </p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              onClick={handleSaveConfig}
              disabled={isConfiguring || !config.webhookUrl}
            >
              {isConfiguring ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4 mr-2" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </div>
        
        {isConnected && (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="workflows">Workflows</TabsTrigger>
                <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
                <TabsTrigger value="test">Test</TabsTrigger>
              </TabsList>
              
              <TabsContent value="workflows" className="space-y-4 pt-4">
                {workflows.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Workflow</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Run</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {workflows.map((workflow) => (
                          <TableRow key={workflow.id}>
                            <TableCell>
                              <div className="font-medium">{workflow.name}</div>
                              <div className="text-xs text-gray-500">{workflow.id}</div>
                            </TableCell>
                            <TableCell>
                              <Badge className={workflow.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                {workflow.active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {workflow.lastRun ? formatDate(workflow.lastRun) : "Never"}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => window.open(workflow.url, '_blank')}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleTriggerWorkflow(workflow.id)}
                                  disabled={!workflow.active || !config.apiKey}
                                >
                                  <Play className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Workflow className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
                    <p className="text-gray-600 mb-4">
                      Create workflows in n8n to automate your tasks
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => window.open('https://n8n.io/login', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Go to n8n
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="webhooks" className="space-y-4 pt-4">
                {webhooks.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Webhook</TableHead>
                          <TableHead>URL</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {webhooks.map((webhook) => (
                          <TableRow key={webhook.id}>
                            <TableCell>
                              <div className="font-medium">{webhook.name}</div>
                              <div className="text-xs text-gray-500">{webhook.id}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="text-sm truncate max-w-[200px]">{webhook.url}</div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => copyToClipboard(webhook.url)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={webhook.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                {webhook.active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(webhook.workflowUrl, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Zap className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No webhooks found</h3>
                    <p className="text-gray-600 mb-4">
                      Create webhooks in n8n to receive data from Locafyr
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => window.open('https://n8n.io/login', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Go to n8n
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="test" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="testData">Test Webhook Payload</Label>
                  <Textarea
                    id="testData"
                    value={testData}
                    onChange={(e) => setTestData(e.target.value)}
                    placeholder="Enter JSON payload to send to n8n"
                    className="font-mono text-sm"
                    rows={10}
                  />
                  <p className="text-xs text-gray-500">
                    Enter a JSON payload to send to your n8n webhook for testing
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleTestWebhook}
                    disabled={isTesting || !config.webhookUrl}
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Send Test Webhook
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="bg-gray-50 border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Recent Execution Logs</h3>
                  {executionLogs.length > 0 ? (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {executionLogs.map((log, index) => (
                        <div key={index} className="p-2 border rounded-md bg-white">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge className={log.status === 'success' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                {log.status}
                              </Badge>
                              <span className="text-sm font-medium">{log.workflowName}</span>
                            </div>
                            <span className="text-xs text-gray-500">{formatDate(log.timestamp)}</span>
                          </div>
                          {log.message && (
                            <p className="text-xs text-gray-600 mt-1">{log.message}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No execution logs available</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">About n8n Integration</p>
                  <p className="text-sm text-blue-700 mt-1">
                    n8n is a workflow automation platform that allows you to connect apps and automate tasks.
                    With this integration, you can send data from Locafyr to n8n and trigger workflows based on events in Locafyr.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Webhook Info Dialog */}
        <Dialog open={isWebhookInfoOpen} onOpenChange={setIsWebhookInfoOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Setting Up n8n Webhooks</DialogTitle>
              <DialogDescription>
                Learn how to create and use webhooks in n8n
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>Creating a Webhook in n8n</AccordionTrigger>
                  <AccordionContent>
                    <ol className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">1</span>
                        <span>In n8n, create a new workflow or open an existing one</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">2</span>
                        <span>Add a "Webhook" trigger node as the first node in your workflow</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">3</span>
                        <span>Configure the webhook to receive JSON payloads</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">4</span>
                        <span>Save the workflow and activate it</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">5</span>
                        <span>Copy the webhook URL from the node and paste it in the n8n Webhook URL field in Locafyr</span>
                      </li>
                    </ol>
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open('https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/', '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View n8n Webhook Documentation
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Using the API Key</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm mb-2">
                      The API key allows Locafyr to trigger workflows in n8n. To get your API key:
                    </p>
                    <ol className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">1</span>
                        <span>In n8n, go to Settings &gt; API</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">2</span>
                        <span>Create a new API key with a descriptive name (e.g., "Locafyr Integration")</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">3</span>
                        <span>Copy the API key and paste it in the n8n API Key field in Locafyr</span>
                      </li>
                    </ol>
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open('https://docs.n8n.io/api/authentication/', '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View n8n API Documentation
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Example Webhook Payload</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm mb-2">
                      Here's an example of the data Locafyr can send to n8n:
                    </p>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-xs overflow-x-auto">
                      {`{
  "event": "lead_created",
  "data": {
    "id": "lead-123456",
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "+1 (555) 123-4567",
    "company": "Acme Inc",
    "status": "new",
    "source": "website",
    "createdAt": "2023-05-15T10:30:00Z"
  },
  "metadata": {
    "userId": "user-123456",
    "timestamp": "2023-05-15T10:30:00Z"
  }
}`}
                    </div>
                    <p className="text-sm mt-4">
                      You can use this data in your n8n workflow to trigger actions in other apps.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsWebhookInfoOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}