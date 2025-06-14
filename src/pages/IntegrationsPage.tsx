import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings,
  ArrowLeft,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { userApiKeyOperations } from '@/lib/userApiKeys';
import { checkIntegrationsSetup } from '@/lib/integrations';
import GmailIntegrationSettings from '@/components/settings/GmailIntegrationSettings';
import { userProfileOperations } from '@/lib/firestore';
import GoBackButton from '@/components/common/GoBackButton';
import { useNavigate } from 'react-router-dom';
import MakeIntegration from '@/components/integrations/MakeIntegration';
import N8nIntegration from '@/components/integrations/N8nIntegration';

export default function IntegrationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('spreadsheets');
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    if (user) {
      loadIntegrationSettings();
    }
  }, [user]);

  const loadIntegrationSettings = async () => {
    setIsLoading(true);
    try {
      // Check integrations status
      const status = await checkIntegrationsSetup();
      
      // Check Gmail status
      const gmailStatus = await checkGmailStatus();
      
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

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Database': return Database;
      case 'Calendar': return Calendar;
      case 'Table': return Table;
      case 'CalendarDays': return CalendarDays;
      case 'FileSpreadsheet': return FileSpreadsheet;
      case 'CalendarClock': return CalendarClock;
      case 'CreditCard': return CreditCard;
      case 'DollarSign': return DollarSign;
      case 'Zap': return Zap;
      case 'Workflow': return Workflow;
      case 'Link': return Link;
      default: return Database;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading integrations...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600 mt-1">Connect and manage external services</p>
        </div>
        <Button 
          variant="outline"
          onClick={() => navigate('/settings?tab=integrations')}
        >
          <Settings className="w-4 h-4 mr-2" />
          Configure Integrations
        </Button>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="spreadsheets">Spreadsheets</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="spreadsheets" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Airtable */}
              <IntegrationCard 
                name="Airtable"
                description="Connect to Airtable bases and tables"
                icon="Database"
                color="bg-blue-100 text-blue-800"
                isConnected={integrationsStatus.airtable}
                features={[
                  'Import leads from Airtable',
                  'Export leads to Airtable',
                  'Sync lead data bidirectionally',
                  'Map custom fields'
                ]}
                onConfigure={() => navigate('/settings?tab=integrations')}
              />
              
              {/* Google Sheets */}
              <IntegrationCard 
                name="Google Sheets"
                description="Connect to Google Sheets spreadsheets"
                icon="Table"
                color="bg-green-100 text-green-800"
                isConnected={integrationsStatus.googleSheets}
                features={[
                  'Import leads from Google Sheets',
                  'Export leads to Google Sheets',
                  'Automated data syncing',
                  'Custom column mapping'
                ]}
                onConfigure={() => navigate('/settings?tab=integrations')}
              />
              
              {/* Excel Online */}
              <IntegrationCard 
                name="Excel Online"
                description="Connect to Microsoft Excel Online"
                icon="FileSpreadsheet"
                color="bg-emerald-100 text-emerald-800"
                isConnected={integrationsStatus.excel}
                features={[
                  'Import leads from Excel Online',
                  'Export leads to Excel Online',
                  'OneDrive integration',
                  'Automated syncing'
                ]}
                onConfigure={() => navigate('/settings?tab=integrations')}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Calendly */}
              <IntegrationCard 
                name="Calendly"
                description="Schedule meetings with Calendly"
                icon="Calendar"
                color="bg-green-100 text-green-800"
                isConnected={integrationsStatus.calendly}
                features={[
                  'Generate scheduling links',
                  'Create meeting invites',
                  'Track scheduled meetings',
                  'Customize meeting types'
                ]}
                onConfigure={() => navigate('/settings?tab=integrations')}
              />
              
              {/* Google Calendar */}
              <IntegrationCard 
                name="Google Calendar"
                description="Connect directly to Google Calendar"
                icon="CalendarDays"
                color="bg-blue-100 text-blue-800"
                isConnected={integrationsStatus.googleCalendar}
                features={[
                  'Create calendar events',
                  'Send meeting invitations',
                  'Check availability',
                  'Manage appointments'
                ]}
                onConfigure={() => navigate('/settings?tab=integrations')}
              />
              
              {/* Microsoft Calendar */}
              <IntegrationCard 
                name="Microsoft Calendar"
                description="Connect to Outlook/Microsoft Calendar"
                icon="CalendarClock"
                color="bg-indigo-100 text-indigo-800"
                isConnected={false}
                features={[
                  'Create Outlook calendar events',
                  'Send meeting invitations',
                  'Check availability',
                  'Microsoft 365 integration'
                ]}
                onConfigure={() => navigate('/settings?tab=integrations')}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="payment" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stripe */}
              <IntegrationCard 
                name="Stripe"
                description="Process payments and subscriptions"
                icon="CreditCard"
                color="bg-purple-100 text-purple-800"
                isConnected={integrationsStatus.stripe}
                features={[
                  'Process credit card payments',
                  'Manage subscriptions',
                  'Handle invoices',
                  'Secure payment processing'
                ]}
                onConfigure={() => navigate('/billing')}
              />
              
              {/* PayPal */}
              <IntegrationCard 
                name="PayPal"
                description="Accept PayPal payments"
                icon="DollarSign"
                color="bg-blue-100 text-blue-800"
                isConnected={integrationsStatus.paypal}
                features={[
                  'Accept PayPal payments',
                  'Recurring billing',
                  'International payments',
                  'Express checkout'
                ]}
                onConfigure={() => navigate('/billing')}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="automation" className="mt-6">
            <div className="space-y-6">
              {/* Make.com Integration */}
              <MakeIntegration />
              
              {/* n8n Integration */}
              <N8nIntegration />
              
              {/* Other Automation Integrations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Zapier */}
                <IntegrationCard 
                  name="Zapier"
                  description="Connect with 5000+ apps"
                  icon="Zap"
                  color="bg-orange-100 text-orange-800"
                  isConnected={integrationsStatus.zapier}
                  features={[
                    'Connect with thousands of apps',
                    'Automate workflows',
                    'No-code integration',
                    'Trigger actions from events'
                  ]}
                  onConfigure={() => navigate('/settings?tab=integrations')}
                />
                
                {/* Pabbly Connect */}
                <IntegrationCard 
                  name="Pabbly Connect"
                  description="Connect apps and automate workflows"
                  icon="Link"
                  color="bg-purple-100 text-purple-800"
                  isConnected={integrationsStatus.pabbly}
                  features={[
                    'Multi-app integration',
                    'Affordable pricing',
                    'Unlimited tasks',
                    'Webhook support'
                  ]}
                  onConfigure={() => navigate('/settings?tab=integrations')}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

interface IntegrationCardProps {
  name: string;
  description: string;
  icon: string;
  color: string;
  isConnected: boolean;
  features: string[];
  onConfigure: () => void;
}

function IntegrationCard({ 
  name, 
  description, 
  icon, 
  color, 
  isConnected, 
  features,
  onConfigure
}: IntegrationCardProps) {
  const IconComponent = getIconComponent(icon);
  
  function getIconComponent(iconName: string) {
    switch (iconName) {
      case 'Database': return Database;
      case 'Calendar': return Calendar;
      case 'Table': return Table;
      case 'CalendarDays': return CalendarDays;
      case 'FileSpreadsheet': return FileSpreadsheet;
      case 'CalendarClock': return CalendarClock;
      case 'CreditCard': return CreditCard;
      case 'DollarSign': return DollarSign;
      case 'Zap': return Zap;
      case 'Workflow': return Workflow;
      case 'Link': return Link;
      default: return Database;
    }
  }
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
    >
      <Card className="h-full hover:shadow-md transition-all">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${color}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>{name}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={isConnected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
            >
              {isConnected ? (
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
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Features:</h3>
            <ul className="space-y-1">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <Button 
            variant={isConnected ? "outline" : "default"}
            className="w-full"
            onClick={onConfigure}
          >
            <Settings className="w-4 h-4 mr-2" />
            {isConnected ? 'Configure' : 'Connect'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}