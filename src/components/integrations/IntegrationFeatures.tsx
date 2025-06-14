import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Calendar, 
  Table, 
  CalendarDays, 
  FileSpreadsheet, 
  CalendarClock,
  Check,
  ArrowRight,
  Download,
  Upload,
  Link2,
  CalendarPlus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lead } from '@/lib/firestore';
import AirtableLeadSync from './AirtableLeadSync';
import GoogleSheetsSync from './GoogleSheetsSync';
import CalendlyMeetingScheduler from './CalendlyMeetingScheduler';
import GoogleCalendarScheduler from './GoogleCalendarScheduler';

interface IntegrationFeaturesProps {
  lead?: Lead;
  integrationType: 'spreadsheets' | 'calendar';
  integrationId: string;
}

export default function IntegrationFeatures({ 
  lead, 
  integrationType, 
  integrationId 
}: IntegrationFeaturesProps) {
  const [activeFeature, setActiveFeature] = useState('import');
  
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Database': return Database;
      case 'Calendar': return Calendar;
      case 'Table': return Table;
      case 'CalendarDays': return CalendarDays;
      case 'FileSpreadsheet': return FileSpreadsheet;
      case 'CalendarClock': return CalendarClock;
      case 'Download': return Download;
      case 'Upload': return Upload;
      case 'Link2': return Link2;
      case 'CalendarPlus': return CalendarPlus;
      default: return Database;
    }
  };

  // Spreadsheet features
  const spreadsheetFeatures = {
    'airtable': [
      { id: 'import', name: 'Import Leads', icon: Download, description: 'Import leads from Airtable to Locafyr' },
      { id: 'export', name: 'Export Leads', icon: Upload, description: 'Export leads from Locafyr to Airtable' },
      { id: 'sync', name: 'Sync Data', icon: ArrowRight, description: 'Keep lead data synchronized between platforms' }
    ],
    'google-sheets': [
      { id: 'import', name: 'Import Leads', icon: Download, description: 'Import leads from Google Sheets to Locafyr' },
      { id: 'export', name: 'Export Leads', icon: Upload, description: 'Export leads from Locafyr to Google Sheets' },
      { id: 'sync', name: 'Sync Data', icon: ArrowRight, description: 'Keep lead data synchronized between platforms' }
    ],
    'excel-online': [
      { id: 'import', name: 'Import Leads', icon: Download, description: 'Import leads from Excel Online to Locafyr' },
      { id: 'export', name: 'Export Leads', icon: Upload, description: 'Export leads from Locafyr to Excel Online' },
      { id: 'sync', name: 'Sync Data', icon: ArrowRight, description: 'Keep lead data synchronized between platforms' }
    ]
  };

  // Calendar features
  const calendarFeatures = {
    'calendly': [
      { id: 'schedule', name: 'Create Scheduling Link', icon: Link2, description: 'Generate a Calendly scheduling link for this lead' },
      { id: 'embed', name: 'Embed Calendar', icon: Calendar, description: 'Embed your Calendly calendar in emails or websites' }
    ],
    'google-calendar': [
      { id: 'create', name: 'Create Event', icon: CalendarPlus, description: 'Create a Google Calendar event with this lead' },
      { id: 'availability', name: 'Check Availability', icon: Calendar, description: 'Check your availability before scheduling' }
    ],
    'microsoft-calendar': [
      { id: 'create', name: 'Create Event', icon: CalendarPlus, description: 'Create a Microsoft Calendar event with this lead' },
      { id: 'availability', name: 'Check Availability', icon: Calendar, description: 'Check your availability before scheduling' }
    ]
  };

  const features = integrationType === 'spreadsheets' 
    ? spreadsheetFeatures[integrationId as keyof typeof spreadsheetFeatures] || []
    : calendarFeatures[integrationId as keyof typeof calendarFeatures] || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {integrationType === 'spreadsheets' 
              ? (integrationId === 'airtable' ? 'Airtable' : integrationId === 'google-sheets' ? 'Google Sheets' : 'Excel Online')
              : (integrationId === 'calendly' ? 'Calendly' : integrationId === 'google-calendar' ? 'Google Calendar' : 'Microsoft Calendar')
            } Features
          </CardTitle>
          <CardDescription>
            Select a feature to use with this integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {features.map((feature) => {
              const FeatureIcon = feature.icon;
              return (
                <motion.div
                  key={feature.id}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer h-full transition-all ${
                      activeFeature === feature.id ? 'border-2 border-blue-500 shadow-md' : 'hover:shadow-md'
                    }`}
                    onClick={() => setActiveFeature(feature.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FeatureIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <h3 className="font-medium">{feature.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Feature Content */}
          <div className="mt-6">
            {integrationType === 'spreadsheets' && (
              <>
                {integrationId === 'airtable' && <AirtableLeadSync />}
                {integrationId === 'google-sheets' && <GoogleSheetsSync />}
                {integrationId === 'excel-online' && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-gray-600">Excel Online integration is coming soon!</p>
                      <Button 
                        variant="outline"
                        className="mt-4"
                        onClick={() => window.location.href = '/settings?tab=integrations'}
                      >
                        Configure Excel Integration
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {integrationType === 'calendar' && (
              <>
                {integrationId === 'calendly' && (
                  <CalendlyMeetingScheduler 
                    leadName={lead?.name}
                    leadEmail={lead?.email}
                    onSchedulingLinkGenerated={(url) => console.log('Scheduling link generated:', url)}
                  />
                )}
                {integrationId === 'google-calendar' && (
                  <GoogleCalendarScheduler 
                    leadName={lead?.name}
                    leadEmail={lead?.email}
                    onEventCreated={(eventId) => console.log('Event created:', eventId)}
                  />
                )}
                {integrationId === 'microsoft-calendar' && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-gray-600">Microsoft Calendar integration is coming soon!</p>
                      <Button 
                        variant="outline"
                        className="mt-4"
                        onClick={() => window.location.href = '/settings?tab=integrations'}
                      >
                        Configure Microsoft Calendar
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}