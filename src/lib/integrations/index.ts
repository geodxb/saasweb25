import { airtableService } from './airtable';
import { calendlyService } from './calendly';
import { googleSheetsService } from './googleSheets';
import { googleCalendarService } from './googleCalendar';
import { userApiKeyOperations } from '@/lib/userApiKeys';

export { 
  airtableService, 
  calendlyService, 
  googleSheetsService, 
  googleCalendarService 
};

// Integration types for UI display
export const integrationTypes = {
  spreadsheets: [
    {
      id: 'airtable',
      name: 'Airtable',
      description: 'Connect to Airtable bases and tables',
      icon: 'Database',
      color: 'bg-blue-100 text-blue-800',
      features: [
        'Import leads from Airtable',
        'Export leads to Airtable',
        'Sync lead data bidirectionally',
        'Map custom fields'
      ]
    },
    {
      id: 'google-sheets',
      name: 'Google Sheets',
      description: 'Connect to Google Sheets spreadsheets',
      icon: 'Table',
      color: 'bg-green-100 text-green-800',
      features: [
        'Import leads from Google Sheets',
        'Export leads to Google Sheets',
        'Automated data syncing',
        'Custom column mapping'
      ]
    },
    {
      id: 'excel-online',
      name: 'Excel Online',
      description: 'Connect to Microsoft Excel Online',
      icon: 'FileSpreadsheet',
      color: 'bg-emerald-100 text-emerald-800',
      features: [
        'Import leads from Excel Online',
        'Export leads to Excel Online',
        'OneDrive integration',
        'Automated syncing'
      ]
    }
  ],
  calendar: [
    {
      id: 'calendly',
      name: 'Calendly',
      description: 'Schedule meetings with Calendly',
      icon: 'Calendar',
      color: 'bg-green-100 text-green-800',
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
      features: [
        'Create Outlook calendar events',
        'Send meeting invitations',
        'Check availability',
        'Microsoft 365 integration'
      ]
    }
  ],
  payment: [
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Process payments and subscriptions',
      icon: 'CreditCard',
      color: 'bg-purple-100 text-purple-800',
      features: [
        'Process credit card payments',
        'Manage subscriptions',
        'Handle invoices',
        'Secure payment processing'
      ]
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Accept PayPal payments',
      icon: 'DollarSign',
      color: 'bg-blue-100 text-blue-800',
      features: [
        'Accept PayPal payments',
        'Recurring billing',
        'International payments',
        'Express checkout'
      ]
    }
  ],
  automation: [
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect with 5000+ apps',
      icon: 'Zap',
      color: 'bg-orange-100 text-orange-800',
      features: [
        'Connect with thousands of apps',
        'Automate workflows',
        'No-code integration',
        'Trigger actions from events'
      ]
    },
    {
      id: 'n8n',
      name: 'n8n',
      description: 'Workflow automation platform',
      icon: 'Workflow',
      color: 'bg-blue-100 text-blue-800',
      features: [
        'Advanced workflow automation',
        'Self-hosted option available',
        'Flexible node-based editor',
        'Webhook integration'
      ]
    },
    {
      id: 'make',
      name: 'Make.com',
      description: 'Visual automation platform',
      icon: 'Workflow',
      color: 'bg-green-100 text-green-800',
      features: [
        'Visual workflow builder',
        'Powerful automation scenarios',
        'Real-time execution',
        'Advanced error handling'
      ]
    },
    {
      id: 'pabbly',
      name: 'Pabbly Connect',
      description: 'Connect apps and automate workflows',
      icon: 'Link',
      color: 'bg-purple-100 text-purple-800',
      features: [
        'Multi-app integration',
        'Affordable pricing',
        'Unlimited tasks',
        'Webhook support'
      ]
    }
  ]
};

// Helper function to check if integrations are configured
export const checkIntegrationsSetup = async (): Promise<{
  airtable: boolean;
  calendly: boolean;
  googleSheets: boolean;
  googleCalendar: boolean;
  stripe: boolean;
  paypal: boolean;
  zapier: boolean;
  n8n: boolean;
  make: boolean;
  pabbly: boolean;
  excel: boolean;
}> => {
  try {
    // For demo purposes, simulate successful connections
    // In a real implementation, you would check if the API keys are valid
    
    // Get user API keys
    const userKeys = await userApiKeyOperations.getUserApiKeys();
    
    return {
      airtable: !!userKeys?.airtablePAT,
      calendly: !!userKeys?.calendlyApiKey,
      googleSheets: !!userKeys?.googleSheetsApiKey,
      googleCalendar: !!userKeys?.googleCalendarApiKey,
      stripe: !!userKeys?.stripeAccessToken,
      paypal: !!userKeys?.paypalClientId,
      zapier: !!userKeys?.zapierWebhookUrl,
      n8n: !!userKeys?.n8nWebhookUrl,
      make: !!userKeys?.makeWebhookUrl,
      pabbly: !!userKeys?.pabblyWebhookUrl,
      excel: !!userKeys?.excelOnlineApiKey
    };
  } catch (error) {
    console.error('Error checking integrations setup:', error);
    return {
      airtable: false,
      calendly: false,
      googleSheets: false,
      googleCalendar: false,
      stripe: false,
      paypal: false,
      zapier: false,
      n8n: false,
      make: false,
      pabbly: false,
      excel: false
    };
  }
};