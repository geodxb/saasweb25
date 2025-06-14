import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Database, Calendar, Table, CalendarDays } from 'lucide-react';
import { checkIntegrationsSetup, integrationTypes } from '@/lib/integrations';
import AirtableLeadSync from '@/components/integrations/AirtableLeadSync';
import CalendlyMeetingScheduler from '@/components/integrations/CalendlyMeetingScheduler';
import GoogleSheetsSync from '@/components/integrations/GoogleSheetsSync';
import GoogleCalendarScheduler from '@/components/integrations/GoogleCalendarScheduler';
import IntegrationSelector from '@/components/integrations/IntegrationSelector';
import { Lead } from '@/lib/firestore';

interface LeadIntegrationsProps {
  lead: Lead;
}

export default function LeadIntegrations({ lead }: LeadIntegrationsProps) {
  const [activeTab, setActiveTab] = useState('spreadsheets');
  const [integrationsStatus, setIntegrationsStatus] = useState({
    airtable: false,
    calendly: false,
    googleSheets: false,
    googleCalendar: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSpreadsheetIntegration, setSelectedSpreadsheetIntegration] = useState('airtable');
  const [selectedCalendarIntegration, setSelectedCalendarIntegration] = useState('calendly');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkIntegrations();
  }, []);

  const checkIntegrations = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const status = await checkIntegrationsSetup();
      setIntegrationsStatus(status);
      
      // Set active tab to the first configured integration
      if (status.airtable) {
        setSelectedSpreadsheetIntegration('airtable');
        setActiveTab('spreadsheets');
      } else if (status.googleSheets) {
        setSelectedSpreadsheetIntegration('google-sheets');
        setActiveTab('spreadsheets');
      } else if (status.calendly) {
        setSelectedCalendarIntegration('calendly');
        setActiveTab('calendar');
      } else if (status.googleCalendar) {
        setSelectedCalendarIntegration('google-calendar');
        setActiveTab('calendar');
      }
    } catch (error) {
      console.error('Error checking integrations:', error);
      setError('Failed to check integration status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchedulingLinkGenerated = (url: string) => {
    // You can add functionality here to save the scheduling link to the lead
    console.log('Scheduling link generated:', url);
  };

  const handleCalendarEventCreated = (eventId: string) => {
    // You can add functionality here to save the event ID to the lead
    console.log('Calendar event created:', eventId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-20 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-red-600 mb-4">
            <span className="font-medium">Error: </span>
            {error}
          </div>
          <Button 
            variant="outline"
            onClick={checkIntegrations}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const noIntegrationsConfigured = !integrationsStatus.airtable && 
                                  !integrationsStatus.calendly && 
                                  !integrationsStatus.googleSheets && 
                                  !integrationsStatus.googleCalendar;

  if (noIntegrationsConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>Connect with external services</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-gray-600 mb-4">
            No integrations configured. Set up integrations to enhance your lead management.
          </p>
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/settings?tab=integrations'}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configure Integrations
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
        <CardDescription>Use connected services with this lead</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="spreadsheets" 
              className="flex items-center space-x-2"
            >
              <Database className="w-4 h-4" />
              <span>Spreadsheets</span>
            </TabsTrigger>
            <TabsTrigger 
              value="calendar" 
              className="flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Calendar</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="spreadsheets" className="mt-4 space-y-4">
            {/* Spreadsheet Integration Selector */}
            <div className="flex items-center space-x-2 mb-4">
              <Button 
                variant={selectedSpreadsheetIntegration === 'airtable' ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedSpreadsheetIntegration('airtable')}
                disabled={!integrationsStatus.airtable}
                className="flex items-center space-x-2"
              >
                <Database className="w-4 h-4" />
                <span>Airtable</span>
              </Button>
              <Button 
                variant={selectedSpreadsheetIntegration === 'google-sheets' ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedSpreadsheetIntegration('google-sheets')}
                disabled={!integrationsStatus.googleSheets}
                className="flex items-center space-x-2"
              >
                <Table className="w-4 h-4" />
                <span>Google Sheets</span>
              </Button>
            </div>
            
            {/* Selected Spreadsheet Integration */}
            {selectedSpreadsheetIntegration === 'airtable' && integrationsStatus.airtable && (
              <AirtableLeadSync />
            )}
            
            {selectedSpreadsheetIntegration === 'google-sheets' && integrationsStatus.googleSheets && (
              <GoogleSheetsSync />
            )}
            
            {((selectedSpreadsheetIntegration === 'airtable' && !integrationsStatus.airtable) ||
               (selectedSpreadsheetIntegration === 'google-sheets' && !integrationsStatus.googleSheets)) && (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">
                  This integration is not configured yet. Set it up in your integration settings.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/settings?tab=integrations'}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Integration
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-4 space-y-4">
            {/* Calendar Integration Selector */}
            <div className="flex items-center space-x-2 mb-4">
              <Button 
                variant={selectedCalendarIntegration === 'calendly' ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedCalendarIntegration('calendly')}
                disabled={!integrationsStatus.calendly}
                className="flex items-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Calendly</span>
              </Button>
              <Button 
                variant={selectedCalendarIntegration === 'google-calendar' ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedCalendarIntegration('google-calendar')}
                disabled={!integrationsStatus.googleCalendar}
                className="flex items-center space-x-2"
              >
                <CalendarDays className="w-4 h-4" />
                <span>Google Calendar</span>
              </Button>
            </div>
            
            {/* Selected Calendar Integration */}
            {selectedCalendarIntegration === 'calendly' && integrationsStatus.calendly && (
              <CalendlyMeetingScheduler 
                leadName={lead.name}
                leadEmail={lead.email}
                onSchedulingLinkGenerated={handleSchedulingLinkGenerated}
              />
            )}
            
            {selectedCalendarIntegration === 'google-calendar' && integrationsStatus.googleCalendar && (
              <GoogleCalendarScheduler 
                leadName={lead.name}
                leadEmail={lead.email}
                onEventCreated={handleCalendarEventCreated}
              />
            )}
            
            {((selectedCalendarIntegration === 'calendly' && !integrationsStatus.calendly) ||
               (selectedCalendarIntegration === 'google-calendar' && !integrationsStatus.googleCalendar)) && (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">
                  This integration is not configured yet. Set it up in your integration settings.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/settings?tab=integrations'}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Integration
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}