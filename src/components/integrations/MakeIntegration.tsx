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
  Zap
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
import { makeIntegration, MakeScenario, MakeWebhook } from '@/lib/integrations/makeIntegration';
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

export default function MakeIntegration() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [activeTab, setActiveTab] = useState('scenarios');
  const [scenarios, setScenarios] = useState<MakeScenario[]>([]);
  const [webhooks, setWebhooks] = useState<MakeWebhook[]>([]);
  const [executionLogs, setExecutionLogs] = useState<any[]>([]);
  const [config, setConfig] = useState({
    webhookUrl: '',
    apiKey: ''
  });
  const [testData, setTestData] = useState('{\n  "event": "test",\n  "data": {\n    "message": "Hello from Locafyr"\n  }\n}');

  useEffect(() => {
    if (user) {
      loadIntegration();
    }
  }, [user]);

  const loadIntegration = async () => {
    setIsLoading(true);
    try {
      // Initialize Make.com integration
      const initialized = await makeIntegration.initialize();
      setIsConnected(initialized);
      
      if (initialized) {
        // Load configuration
        const userKeys = await userApiKeyOperations.getUserApiKeys();
        setConfig({
          webhookUrl: userKeys?.makeWebhookUrl || '',
          apiKey: userKeys?.makeApiKey || ''
        });
        
        // Load scenarios and webhooks
        await loadScenarios();
      }
    } catch (error) {
      console.error('Error loading Make.com integration:', error);
      toast.error('Failed to load Make.com integration');
    } finally {
      setIsLoading(false);
    }
  };

  const loadScenarios = async () => {
    setIsRefreshing(true);
    try {
      // Load scenarios
      const scenariosData = await makeIntegration.getScenarios();
      setScenarios(scenariosData);
      
      // Load webhooks
      const webhooksData = await makeIntegration.getWebhooks();
      setWebhooks(webhooksData);
      
      // Load execution logs
      const logsData = await makeIntegration.getExecutionLogs();
      setExecutionLogs(logsData);
    } catch (error) {
      console.error('Error loading Make.com data:', error);
      toast.error('Failed to load Make.com data');
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
        makeWebhookUrl: config.webhookUrl,
        makeApiKey: config.apiKey
      });
      
      // Initialize integration with new config
      const initialized = await makeIntegration.initialize();
      setIsConnected(initialized);
      
      if (initialized) {
        toast.success('Make.com integration configured successfully');
        await loadScenarios();
      }
    } catch (error) {
      console.error('Error configuring Make.com integration:', error);
      toast.error('Failed to configure Make.com integration');
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
      const success = await makeIntegration.triggerWebhook(payload);
      
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

  const handleTriggerScenario = async (scenarioId: string) => {
    try {
      const success = await makeIntegration.triggerScenario(scenarioId);
      
      if (success) {
        toast.success('Scenario triggered successfully');
        // Refresh scenarios after a short delay
        setTimeout(() => loadScenarios(), 2000);
      } else {
        toast.error('Failed to trigger scenario');
      }
    } catch (error) {
      console.error('Error triggering scenario:', error);
      toast.error('Failed to trigger scenario');
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
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
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
            <div className="p-2 bg-green-100 rounded-lg">
              <Workflow className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle>Make.com</CardTitle>
              <CardDescription>Connect with Make.com automation platform</CardDescription>
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
            <Label htmlFor="webhookUrl">Make.com Webhook URL</Label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  id="webhookUrl"
                  value={config.webhookUrl}
                  onChange={(e) => setConfig({...config, webhookUrl: e.target.value})}
                  placeholder="https://hook.make.com/..."
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
                onClick={() => window.open('https://www.make.com/en/help/tools/webhooks', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Help
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Create a webhook in Make.com and paste the URL here. This is required for Locafyr to send data to Make.com.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="apiKey">Make.com API Key (Optional)</Label>
            <Input
              id="apiKey"
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({...config, apiKey: e.target.value})}
              placeholder="Enter your Make.com API key"
            />
            <p className="text-xs text-gray-500">
              Optional: Add your Make.com API key to enable additional features like triggering scenarios.
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
                <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
                <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
                <TabsTrigger value="test">Test</TabsTrigger>
              </TabsList>
              
              <TabsContent value="scenarios" className="space-y-4 pt-4">
                {scenarios.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Scenario</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Run</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scenarios.map((scenario) => (
                          <TableRow key={scenario.id}>
                            <TableCell>
                              <div className="font-medium">{scenario.name}</div>
                              <div className="text-xs text-gray-500">{scenario.id}</div>
                            </TableCell>
                            <TableCell>
                              <Badge className={scenario.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                {scenario.active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {scenario.lastRun ? formatDate(scenario.lastRun) : "Never"}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => window.open(scenario.url, '_blank')}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleTriggerScenario(scenario.id)}
                                  disabled={!scenario.active}
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No scenarios found</h3>
                    <p className="text-gray-600 mb-4">
                      Create scenarios in Make.com to automate your workflows
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => window.open('https://www.make.com/en/login', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Go to Make.com
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
                                onClick={() => window.open(webhook.scenarioUrl, '_blank')}
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
                      Create webhooks in Make.com to receive data from Locafyr
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => window.open('https://www.make.com/en/login', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Go to Make.com
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
                    placeholder="Enter JSON payload to send to Make.com"
                    className="font-mono text-sm"
                    rows={10}
                  />
                  <p className="text-xs text-gray-500">
                    Enter a JSON payload to send to your Make.com webhook for testing
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
                              <span className="text-sm font-medium">{log.scenarioName}</span>
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
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">About Make.com Integration</p>
                  <p className="text-sm text-green-700 mt-1">
                    Make.com is a powerful visual automation platform that allows you to connect apps and automate workflows.
                    With this integration, you can send data from Locafyr to Make.com and trigger scenarios based on events in Locafyr.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}