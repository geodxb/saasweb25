import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings,
  Database,
  Calendar,
  Table,
  CalendarDays,
  FileSpreadsheet,
  CalendarClock,
  Check,
  X,
  Mail,
  Loader2,
  RefreshCw,
  AlertCircle,
  CreditCard,
  DollarSign,
  Zap,
  Workflow,
  Link
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { userApiKeyOperations } from '@/lib/userApiKeys';
import { checkIntegrationsSetup } from '@/lib/integrations';
import GmailIntegrationSettings from '@/components/settings/GmailIntegrationSettings';
import { userProfileOperations } from '@/lib/firestore';
import GoogleSheetsTab from '@/components/integrations/GoogleSheetsTab';
import ExcelTab from '@/components/integrations/ExcelTab';

export default function IntegrationsSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('email');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [integrationsStatus, setIntegrationsStatus] = useState({
    airtable: false,
    calendly: false,
    googleSheets: false,
    googleCalendar: false,
    gmail: false,
    stripe: false,
    paypal: false,
    zapier: false,
    n8n: false,
    make: false,
    pabbly: false,
    excel: false
  });
  
  // Form state for Airtable
  const [airtableForm, setAirtableForm] = useState({
    pat: '',
    baseId: '',
    tableName: 'Leads'
  });
  
  // Form state for Calendly
  const [calendlyForm, setCalendlyForm] = useState({
    apiKey: '',
    calendlyLink: ''
  });
  
  // Form state for Google Sheets
  const [googleSheetsForm, setGoogleSheetsForm] = useState({
    apiKey: '',
    spreadsheetId: '',
    range: 'Sheet1!A1:Z1000'
  });
  
  // Form state for Google Calendar
  const [googleCalendarForm, setGoogleCalendarForm] = useState({
    apiKey: '',
    calendarId: 'primary'
  });
  
  // Form state for automation tools
  const [automationForm, setAutomationForm] = useState({
    zapierWebhookUrl: '',
    n8nWebhookUrl: '',
    n8nApiKey: '',
    makeWebhookUrl: '',
    makeApiKey: '',
    pabblyWebhookUrl: ''
  });

  useEffect(() => {
    if (user) {
      loadIntegrationSettings();
    }
  }, [user]);

  const loadIntegrationSettings = async () => {
    setIsLoading(true);
    try {
      // Load user API keys
      const userKeys = await userApiKeyOperations.getUserApiKeys();
      
      if (userKeys) {
        // Set form values
        setAirtableForm({
          pat: userKeys.airtablePAT || '',
          baseId: userKeys.airtableBaseId || '',
          tableName: userKeys.airtableTableName || 'Leads'
        });
        
        setCalendlyForm({
          apiKey: userKeys.calendlyApiKey || '',
          calendlyLink: ''
        });
        
        setGoogleSheetsForm({
          apiKey: userKeys.googleSheetsApiKey || '',
          spreadsheetId: userKeys.googleSheetsId || '',
          range: userKeys.googleSheetsRange || 'Sheet1!A1:Z1000'
        });
        
        setGoogleCalendarForm({
          apiKey: userKeys.googleCalendarApiKey || '',
          calendarId: userKeys.googleCalendarId || 'primary'
        });
        
        setAutomationForm({
          zapierWebhookUrl: userKeys.zapierWebhookUrl || '',
          n8nWebhookUrl: userKeys.n8nWebhookUrl || '',
          n8nApiKey: userKeys.n8nApiKey || '',
          makeWebhookUrl: userKeys.makeWebhookUrl || '',
          makeApiKey: userKeys.makeApiKey || '',
          pabblyWebhookUrl: userKeys.pabblyWebhookUrl || ''
        });
      }
      
      // Check integrations status
      const status = await checkIntegrationsSetup();
      
      // Check Gmail status
      const gmailStatus = await checkGmailStatus();
      
      // Load Calendly link from user profile
      if (user) {
        const calendlyLink = await userProfileOperations.getCalendlyLink(user.uid);
        if (calendlyLink) {
          setCalendlyForm(prev => ({ ...prev, calendlyLink }));
        }
      }
      
      setIntegrationsStatus({
        ...status,
        gmail: gmailStatus
      });
    } catch (error) {
      console.error('Error loading integration settings:', error);
      toast.error('Failed to load integration settings');
    } finally {
      setIsLoading(false);
    }
  };

  const checkGmailStatus = async () => {
    try {
      // Import dynamically to avoid circular dependencies
      const { gmailService } = await import('@/lib/gmail');
      
      // Check Gmail API status
      const status = await gmailService.checkGmailStatus();
      return status.available;
    } catch (error) {
      console.error('Error checking Gmail status:', error);
      return false;
    }
  };

  const handleSaveAirtable = async () => {
    if (!airtableForm.pat || !airtableForm.baseId || !airtableForm.tableName) {
      toast.error('All fields are required');
      return;
    }
    
    setIsSaving(true);
    try {
      // Test connection
      const isConnected = await userApiKeyOperations.testAirtableConnection(
        airtableForm.pat,
        airtableForm.baseId,
        airtableForm.tableName
      );
      
      if (!isConnected) {
        toast.error('Failed to connect to Airtable. Please check your credentials.');
        return;
      }
      
      // Save API keys
      await userApiKeyOperations.saveUserApiKeys({
        airtablePAT: airtableForm.pat,
        airtableBaseId: airtableForm.baseId,
        airtableTableName: airtableForm.tableName
      });
      
      toast.success('Airtable integration saved successfully');
      
      // Refresh integration status
      const status = await checkIntegrationsSetup();
      setIntegrationsStatus({
        ...integrationsStatus,
        ...status
      });
    } catch (error) {
      console.error('Error saving Airtable integration:', error);
      toast.error('Failed to save Airtable integration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCalendly = async () => {
    if (!calendlyForm.apiKey) {
      toast.error('API key is required');
      return;
    }
    
    setIsSaving(true);
    try {
      // Test connection
      const isConnected = await userApiKeyOperations.testCalendlyConnection(
        calendlyForm.apiKey
      );
      
      if (!isConnected) {
        toast.error('Failed to connect to Calendly. Please check your API key.');
        return;
      }
      
      // Save API key
      await userApiKeyOperations.saveUserApiKeys({
        calendlyApiKey: calendlyForm.apiKey
      });
      
      // Save Calendly link if provided
      if (user && calendlyForm.calendlyLink) {
        await userProfileOperations.saveCalendlyLink(user.uid, calendlyForm.calendlyLink);
      }
      
      toast.success('Calendly integration saved successfully');
      
      // Refresh integration status
      const status = await checkIntegrationsSetup();
      setIntegrationsStatus({
        ...integrationsStatus,
        ...status
      });
    } catch (error) {
      console.error('Error saving Calendly integration:', error);
      toast.error('Failed to save Calendly integration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGoogleSheets = async () => {
    if (!googleSheetsForm.apiKey || !googleSheetsForm.spreadsheetId || !googleSheetsForm.range) {
      toast.error('All fields are required');
      return;
    }
    
    setIsSaving(true);
    try {
      // Test connection
      const isConnected = await userApiKeyOperations.testGoogleSheetsConnection(
        googleSheetsForm.apiKey,
        googleSheetsForm.spreadsheetId,
        googleSheetsForm.range
      );
      
      if (!isConnected) {
        toast.error('Failed to connect to Google Sheets. Please check your credentials.');
        return;
      }
      
      // Save API keys
      await userApiKeyOperations.saveUserApiKeys({
        googleSheetsApiKey: googleSheetsForm.apiKey,
        googleSheetsId: googleSheetsForm.spreadsheetId,
        googleSheetsRange: googleSheetsForm.range
      });
      
      toast.success('Google Sheets integration saved successfully');
      
      // Refresh integration status
      const status = await checkIntegrationsSetup();
      setIntegrationsStatus({
        ...integrationsStatus,
        ...status
      });
    } catch (error) {
      console.error('Error saving Google Sheets integration:', error);
      toast.error('Failed to save Google Sheets integration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGoogleCalendar = async () => {
    if (!googleCalendarForm.apiKey) {
      toast.error('API key is required');
      return;
    }
    
    setIsSaving(true);
    try {
      // Test connection
      const isConnected = await userApiKeyOperations.testGoogleCalendarConnection(
        googleCalendarForm.apiKey,
        googleCalendarForm.calendarId
      );
      
      if (!isConnected) {
        toast.error('Failed to connect to Google Calendar. Please check your API key.');
        return;
      }
      
      // Save API keys
      await userApiKeyOperations.saveUserApiKeys({
        googleCalendarApiKey: googleCalendarForm.apiKey,
        googleCalendarId: googleCalendarForm.calendarId
      });
      
      toast.success('Google Calendar integration saved successfully');
      
      // Refresh integration status
      const status = await checkIntegrationsSetup();
      setIntegrationsStatus({
        ...integrationsStatus,
        ...status
      });
    } catch (error) {
      console.error('Error saving Google Calendar integration:', error);
      toast.error('Failed to save Google Calendar integration');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSaveAutomation = async () => {
    setIsSaving(true);
    try {
      // Validate webhook URLs
      if (automationForm.zapierWebhookUrl && !await userApiKeyOperations.testWebhookUrl(automationForm.zapierWebhookUrl)) {
        toast.error('Invalid Zapier webhook URL');
        return;
      }
      
      if (automationForm.n8nWebhookUrl && !await userApiKeyOperations.testWebhookUrl(automationForm.n8nWebhookUrl)) {
        toast.error('Invalid n8n webhook URL');
        return;
      }
      
      if (automationForm.makeWebhookUrl && !await userApiKeyOperations.testWebhookUrl(automationForm.makeWebhookUrl)) {
        toast.error('Invalid Make.com webhook URL');
        return;
      }
      
      if (automationForm.pabblyWebhookUrl && !await userApiKeyOperations.testWebhookUrl(automationForm.pabblyWebhookUrl)) {
        toast.error('Invalid Pabbly webhook URL');
        return;
      }
      
      // Save API keys and webhook URLs
      await userApiKeyOperations.saveUserApiKeys({
        zapierWebhookUrl: automationForm.zapierWebhookUrl,
        n8nWebhookUrl: automationForm.n8nWebhookUrl,
        n8nApiKey: automationForm.n8nApiKey,
        makeWebhookUrl: automationForm.makeWebhookUrl,
        makeApiKey: automationForm.makeApiKey,
        pabblyWebhookUrl: automationForm.pabblyWebhookUrl
      });
      
      toast.success('Automation integration saved successfully');
      
      // Refresh integration status
      const status = await checkIntegrationsSetup();
      setIntegrationsStatus({
        ...integrationsStatus,
        ...status
      });
    } catch (error) {
      console.error('Error saving automation integration:', error);
      toast.error('Failed to save automation integration');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading integration settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>Connect external services to enhance your workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="spreadsheets">Spreadsheets</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="automation">Automation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email" className="space-y-6">
              {/* Gmail Integration */}
              <GmailIntegrationSettings />
            </TabsContent>
            
            <TabsContent value="calendar" className="space-y-6">
              {/* Calendly Integration */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle>Calendly</CardTitle>
                        <CardDescription>Connect your Calendly account to schedule meetings</CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={integrationsStatus.calendly ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                    >
                      {integrationsStatus.calendly ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
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
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="calendlyApiKey">Calendly API Key</Label>
                    <Input
                      id="calendlyApiKey"
                      type="password"
                      value={calendlyForm.apiKey}
                      onChange={(e) => setCalendlyForm({ ...calendlyForm, apiKey: e.target.value })}
                      placeholder="Enter your Calendly API key"
                    />
                    <p className="text-xs text-gray-500">
                      Find your API key in the <a href="https://calendly.com/integrations/api_webhooks" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Calendly API settings</a>.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="calendlyLink">Your Calendly Booking Link</Label>
                    <Input
                      id="calendlyLink"
                      value={calendlyForm.calendlyLink}
                      onChange={(e) => setCalendlyForm({ ...calendlyForm, calendlyLink: e.target.value })}
                      placeholder="https://calendly.com/yourusername/30min"
                    />
                    <p className="text-xs text-gray-500">
                      This link will be used when inserting Calendly links into emails.
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={loadIntegrationSettings}
                      disabled={isSaving}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                    <Button 
                      onClick={handleSaveCalendly}
                      disabled={isSaving || !calendlyForm.apiKey}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Calendly Settings'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Google Calendar Integration */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CalendarDays className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle>Google Calendar</CardTitle>
                        <CardDescription>Connect to Google Calendar to create events</CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={integrationsStatus.googleCalendar ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                    >
                      {integrationsStatus.googleCalendar ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
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
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="googleCalendarApiKey">Google Calendar API Key</Label>
                    <Input
                      id="googleCalendarApiKey"
                      type="password"
                      value={googleCalendarForm.apiKey}
                      onChange={(e) => setGoogleCalendarForm({ ...googleCalendarForm, apiKey: e.target.value })}
                      placeholder="Enter your Google Calendar API key"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="googleCalendarId">Calendar ID (Optional)</Label>
                    <Input
                      id="googleCalendarId"
                      value={googleCalendarForm.calendarId}
                      onChange={(e) => setGoogleCalendarForm({ ...googleCalendarForm, calendarId: e.target.value })}
                      placeholder="primary"
                    />
                    <p className="text-xs text-gray-500">
                      Leave as "primary" to use your main calendar, or enter a specific calendar ID.
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={loadIntegrationSettings}
                      disabled={isSaving}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                    <Button 
                      onClick={handleSaveGoogleCalendar}
                      disabled={isSaving || !googleCalendarForm.apiKey}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Google Calendar Settings'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="spreadsheets" className="space-y-6">
              {/* Google Sheets Tab */}
              <GoogleSheetsTab />
              
              {/* Excel Tab */}
              <ExcelTab />
              
              {/* Airtable Integration */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Database className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle>Airtable</CardTitle>
                        <CardDescription>Connect to Airtable to import and export leads</CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={integrationsStatus.airtable ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                    >
                      {integrationsStatus.airtable ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
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
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="airtablePAT">Airtable Personal Access Token</Label>
                    <Input
                      id="airtablePAT"
                      type="password"
                      value={airtableForm.pat}
                      onChange={(e) => setAirtableForm({ ...airtableForm, pat: e.target.value })}
                      placeholder="Enter your Airtable PAT"
                    />
                    <p className="text-xs text-gray-500">
                      Create a PAT in your <a href="https://airtable.com/create/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Airtable account settings</a>.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="airtableBaseId">Base ID</Label>
                    <Input
                      id="airtableBaseId"
                      value={airtableForm.baseId}
                      onChange={(e) => setAirtableForm({ ...airtableForm, baseId: e.target.value })}
                      placeholder="appXXXXXXXXXXXXXX"
                    />
                    <p className="text-xs text-gray-500">
                      Find your Base ID in the API documentation section of your Airtable base.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="airtableTableName">Table Name</Label>
                    <Input
                      id="airtableTableName"
                      value={airtableForm.tableName}
                      onChange={(e) => setAirtableForm({ ...airtableForm, tableName: e.target.value })}
                      placeholder="Leads"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={loadIntegrationSettings}
                      disabled={isSaving}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                    <Button 
                      onClick={handleSaveAirtable}
                      disabled={isSaving || !airtableForm.pat || !airtableForm.baseId || !airtableForm.tableName}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Airtable Settings'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payment" className="space-y-6">
              {/* Payment Integrations */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Integrations</CardTitle>
                  <CardDescription>
                    Configure payment processing integrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <CreditCard className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Stripe</p>
                          <p className="text-sm text-gray-600">Process credit card payments</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline" 
                          className={integrationsStatus.stripe ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        >
                          {integrationsStatus.stripe ? "Connected" : "Not Connected"}
                        </Badge>
                        <Button variant="outline" onClick={() => window.location.href = '/billing'}>
                          Configure
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">PayPal</p>
                          <p className="text-sm text-gray-600">Accept PayPal payments</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline" 
                          className={integrationsStatus.paypal ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        >
                          {integrationsStatus.paypal ? "Connected" : "Not Connected"}
                        </Badge>
                        <Button variant="outline" onClick={() => window.location.href = '/billing'}>
                          Configure
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="automation" className="space-y-6">
              {/* Automation Integrations */}
              <Card>
                <CardHeader>
                  <CardTitle>Automation Integrations</CardTitle>
                  <CardDescription>
                    Connect with automation platforms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Zapier */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Zap className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium">Zapier</p>
                          <p className="text-sm text-gray-600">Connect with 5000+ apps</p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={integrationsStatus.zapier ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {integrationsStatus.zapier ? "Connected" : "Not Connected"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="zapierWebhookUrl">Zapier Webhook URL</Label>
                      <Input
                        id="zapierWebhookUrl"
                        value={automationForm.zapierWebhookUrl}
                        onChange={(e) => setAutomationForm({ ...automationForm, zapierWebhookUrl: e.target.value })}
                        placeholder="https://hooks.zapier.com/hooks/catch/..."
                      />
                      <p className="text-xs text-gray-500">
                        Create a webhook in Zapier and paste the URL here.
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* n8n */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Workflow className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">n8n</p>
                          <p className="text-sm text-gray-600">Workflow automation platform</p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={integrationsStatus.n8n ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {integrationsStatus.n8n ? "Connected" : "Not Connected"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="n8nWebhookUrl">n8n Webhook URL</Label>
                      <Input
                        id="n8nWebhookUrl"
                        value={automationForm.n8nWebhookUrl}
                        onChange={(e) => setAutomationForm({ ...automationForm, n8nWebhookUrl: e.target.value })}
                        placeholder="https://your-n8n-instance.com/webhook/..."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="n8nApiKey">n8n API Key (Optional)</Label>
                      <Input
                        id="n8nApiKey"
                        type="password"
                        value={automationForm.n8nApiKey}
                        onChange={(e) => setAutomationForm({ ...automationForm, n8nApiKey: e.target.value })}
                        placeholder="Enter your n8n API key"
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Make.com */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Workflow className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Make.com</p>
                          <p className="text-sm text-gray-600">Visual automation platform</p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={integrationsStatus.make ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {integrationsStatus.make ? "Connected" : "Not Connected"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="makeWebhookUrl">Make.com Webhook URL</Label>
                      <Input
                        id="makeWebhookUrl"
                        value={automationForm.makeWebhookUrl}
                        onChange={(e) => setAutomationForm({ ...automationForm, makeWebhookUrl: e.target.value })}
                        placeholder="https://hook.make.com/..."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="makeApiKey">Make.com API Key (Optional)</Label>
                      <Input
                        id="makeApiKey"
                        type="password"
                        value={automationForm.makeApiKey}
                        onChange={(e) => setAutomationForm({ ...automationForm, makeApiKey: e.target.value })}
                        placeholder="Enter your Make.com API key"
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Pabbly Connect */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Link className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Pabbly Connect</p>
                          <p className="text-sm text-gray-600">Connect apps and automate workflows</p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={integrationsStatus.pabbly ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {integrationsStatus.pabbly ? "Connected" : "Not Connected"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pabblyWebhookUrl">Pabbly Webhook URL</Label>
                      <Input
                        id="pabblyWebhookUrl"
                        value={automationForm.pabblyWebhookUrl}
                        onChange={(e) => setAutomationForm({ ...automationForm, pabblyWebhookUrl: e.target.value })}
                        placeholder="https://flow.pabbly.com/workflow/..."
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={loadIntegrationSettings}
                      disabled={isSaving}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                    <Button 
                      onClick={handleSaveAutomation}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Automation Settings'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}