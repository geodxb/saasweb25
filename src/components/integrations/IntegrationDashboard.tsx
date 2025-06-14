import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Loader2, 
  Settings
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { checkIntegrationsSetup } from '@/lib/integrations';
import IntegrationCard from './IntegrationCard';
import IntegrationUsageStats from './IntegrationUsageStats';

export default function IntegrationDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [integrationsStatus, setIntegrationsStatus] = useState({
    airtable: false,
    calendly: false,
    googleSheets: false,
    googleCalendar: false
  });
  const [activeTab, setActiveTab] = useState('spreadsheets');

  useEffect(() => {
    checkIntegrations();
  }, []);

  const checkIntegrations = async () => {
    setIsLoading(true);
    try {
      const status = await checkIntegrationsSetup();
      setIntegrationsStatus({
        ...status,
        excelOnline: false, // Add these since they're not in the original status
        microsoftCalendar: false
      });
    } catch (error) {
      console.error('Error checking integrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <IntegrationUsageStats />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="spreadsheets" className="flex items-center space-x-2">
            <span>Import Data</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center space-x-2">
            <span>Schedule Meetings</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="spreadsheets" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                id: 'airtable',
                name: 'Airtable',
                description: 'Import leads from Airtable bases',
                icon: 'Database',
                color: 'bg-blue-100 text-blue-800',
                isConnected: integrationsStatus.airtable,
                features: [
                  'Import leads from Airtable',
                  'Map custom fields',
                  'Sync lead data',
                  'Automated importing'
                ]
              },
              {
                id: 'google-sheets',
                name: 'Google Sheets',
                description: 'Connect to Google Sheets spreadsheets',
                icon: 'Table',
                color: 'bg-green-100 text-green-800',
                isConnected: integrationsStatus.googleSheets,
                features: [
                  'Import leads from Google Sheets',
                  'Automated data syncing',
                  'Custom column mapping',
                  'Scheduled imports'
                ]
              },
              {
                id: 'excel-online',
                name: 'Excel Online',
                description: 'Connect to Microsoft Excel Online',
                icon: 'FileSpreadsheet',
                color: 'bg-emerald-100 text-emerald-800',
                isConnected: integrationsStatus.excelOnline,
                features: [
                  'Import leads from Excel Online',
                  'OneDrive integration',
                  'Automated syncing',
                  'Custom field mapping'
                ]
              }
            ].map((integration) => (
              <IntegrationCard
                key={integration.id}
                id={integration.id}
                name={integration.name}
                description={integration.description}
                icon={integration.icon}
                color={integration.color}
                isConnected={integration.isConnected}
                features={integration.features}
                onClick={() => {
                  // Handle integration usage
                  if (integration.id === 'airtable' && integrationsStatus.airtable) {
                    navigate('/leads?tab=integrations&integration=airtable');
                  } else if (integration.id === 'google-sheets' && integrationsStatus.googleSheets) {
                    navigate('/leads?tab=integrations&integration=google-sheets');
                  } else if (integration.id === 'excel-online' && integrationsStatus.excelOnline) {
                    navigate('/leads?tab=integrations&integration=excel-online');
                  } else {
                    navigate('/settings?tab=integrations');
                  }
                }}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                id: 'calendly',
                name: 'Calendly',
                description: 'Schedule meetings with Calendly',
                icon: 'Calendar',
                color: 'bg-green-100 text-green-800',
                isConnected: integrationsStatus.calendly,
                features: [
                  'Generate scheduling links',
                  'Create meeting invites',
                  'Track scheduled meetings',
                  'Customize meeting types'
                ]
              },
              {
                id: 'google-calendar',
                name: 'Google Calendar',
                description: 'Connect directly to Google Calendar',
                icon: 'CalendarDays',
                color: 'bg-blue-100 text-blue-800',
                isConnected: integrationsStatus.googleCalendar,
                features: [
                  'Create calendar events',
                  'Send meeting invitations',
                  'Check availability',
                  'Manage appointments'
                ]
              },
              {
                id: 'microsoft-calendar',
                name: 'Microsoft Calendar',
                description: 'Connect to Outlook/Microsoft Calendar',
                icon: 'CalendarClock',
                color: 'bg-indigo-100 text-indigo-800',
                isConnected: integrationsStatus.microsoftCalendar,
                features: [
                  'Create Outlook calendar events',
                  'Send meeting invitations',
                  'Check availability',
                  'Microsoft 365 integration'
                ]
              }
            ].map((integration) => (
              <IntegrationCard
                key={integration.id}
                id={integration.id}
                name={integration.name}
                description={integration.description}
                icon={integration.icon}
                color={integration.color}
                isConnected={integration.isConnected}
                features={integration.features}
                onClick={() => {
                  // Handle integration usage
                  if (integration.id === 'calendly' && integrationsStatus.calendly) {
                    navigate('/leads?tab=integrations&integration=calendly');
                  } else if (integration.id === 'google-calendar' && integrationsStatus.googleCalendar) {
                    navigate('/leads?tab=integrations&integration=google-calendar');
                  } else if (integration.id === 'microsoft-calendar' && integrationsStatus.microsoftCalendar) {
                    navigate('/leads?tab=integrations&integration=microsoft-calendar');
                  } else {
                    navigate('/settings?tab=integrations');
                  }
                }}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Integration Benefits</span>
          </CardTitle>
          <CardDescription>
            How integrations can help your business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium">Streamlined Workflow</h3>
              <p className="text-sm text-gray-600">
                Connect your favorite tools to automate data transfer and reduce manual work.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Better Lead Management</h3>
              <p className="text-sm text-gray-600">
                Keep your lead data synchronized across all your business tools.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Improved Client Experience</h3>
              <p className="text-sm text-gray-600">
                Provide a seamless scheduling and communication experience for your leads and clients.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}