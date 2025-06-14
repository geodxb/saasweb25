import { userApiKeyOperations } from '@/lib/userApiKeys';
import { toast } from 'sonner';
import { getCurrentUserId } from '@/lib/firestore';
import { userProfileOperations } from '@/lib/firestore';

// Default developer key (fallback only)
const DEV_CALENDLY_API_KEY = import.meta.env.VITE_CALENDLY_API_KEY || '';

interface CalendlyEvent {
  uri: string;
  name: string;
  duration: number;
  active: boolean;
  slug: string;
  scheduling_url: string;
}

interface CalendlyUser {
  resource: {
    uri: string;
    name: string;
    slug: string;
    email: string;
    scheduling_url: string;
    timezone: string;
  };
}

export class CalendlyService {
  private static instance: CalendlyService;
  
  static getInstance(): CalendlyService {
    if (!CalendlyService.instance) {
      CalendlyService.instance = new CalendlyService();
    }
    return CalendlyService.instance;
  }
  
  /**
   * Get the user's Calendly API key
   * Falls back to developer key if user key is not available
   */
  async getCalendlyApiKey(): Promise<{ apiKey: string; isUserKey: boolean }> {
    try {
      // Get current user ID
      const userId = getCurrentUserId();
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Load user's API keys from Firestore
      const userKeys = await userApiKeyOperations.getUserApiKeys(userId);
      
      // If user has configured Calendly, use their key
      if (userKeys?.calendlyApiKey) {
        return {
          apiKey: userKeys.calendlyApiKey,
          isUserKey: true
        };
      }
      
      // Fall back to developer key
      if (DEV_CALENDLY_API_KEY) {
        console.warn('Using developer Calendly key as fallback');
        return {
          apiKey: DEV_CALENDLY_API_KEY,
          isUserKey: false
        };
      }
      
      throw new Error('No Calendly API key found');
    } catch (error) {
      console.error('Error getting Calendly API key:', error);
      throw error;
    }
  }
  
  /**
   * Get the current user's Calendly profile
   */
  async getCurrentUser(): Promise<CalendlyUser | null> {
    let apiKey = '';
    let isUserKey = false;
    
    try {
      // Get API key
      const keyInfo = await this.getCalendlyApiKey();
      apiKey = keyInfo.apiKey;
      isUserKey = keyInfo.isUserKey;
      
      // For demo purposes, simulate a successful response
      // In a real implementation, you would call the Calendly API
      if (apiKey) {
        return {
          resource: {
            uri: 'https://api.calendly.com/users/MOCK_USER_ID',
            name: 'Demo User',
            slug: 'demo-user',
            email: 'demo@example.com',
            scheduling_url: 'https://calendly.com/demo-user',
            timezone: 'America/New_York'
          }
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching Calendly user:', error);
      
      // Show user-friendly error
      if (!isUserKey) {
        toast.error('Please configure your Calendly API key in Settings > Integrations');
      } else {
        toast.error('Failed to fetch Calendly user. Please check your API key.');
      }
      
      return null;
    }
  }
  
  /**
   * Get the user's event types
   */
  async getEventTypes(): Promise<CalendlyEvent[]> {
    let apiKey = '';
    let isUserKey = false;
    
    try {
      // Get API key
      const keyInfo = await this.getCalendlyApiKey();
      apiKey = keyInfo.apiKey;
      isUserKey = keyInfo.isUserKey;
      
      // For demo purposes, return mock event types
      // In a real implementation, you would call the Calendly API
      if (apiKey) {
        return [
          {
            uri: 'https://api.calendly.com/event_types/MOCK_EVENT_1',
            name: 'Discovery Call',
            duration: 30,
            active: true,
            slug: 'discovery-call',
            scheduling_url: 'https://calendly.com/demo-user/discovery-call'
          },
          {
            uri: 'https://api.calendly.com/event_types/MOCK_EVENT_2',
            name: 'Project Consultation',
            duration: 60,
            active: true,
            slug: 'project-consultation',
            scheduling_url: 'https://calendly.com/demo-user/project-consultation'
          },
          {
            uri: 'https://api.calendly.com/event_types/MOCK_EVENT_3',
            name: 'Quick Chat',
            duration: 15,
            active: true,
            slug: 'quick-chat',
            scheduling_url: 'https://calendly.com/demo-user/quick-chat'
          }
        ];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching Calendly event types:', error);
      
      // Show user-friendly error
      if (!isUserKey) {
        toast.error('Please configure your Calendly API key in Settings > Integrations');
      } else {
        toast.error('Failed to fetch Calendly event types. Please check your API key.');
      }
      
      return [];
    }
  }
  
  /**
   * Get the scheduling URL for a specific event type
   */
  async getSchedulingUrl(eventTypeSlug: string): Promise<string | null> {
    try {
      const eventTypes = await this.getEventTypes();
      const eventType = eventTypes.find(event => event.slug === eventTypeSlug);
      
      if (!eventType) {
        throw new Error(`Event type "${eventTypeSlug}" not found`);
      }
      
      return eventType.scheduling_url;
    } catch (error) {
      console.error('Error getting Calendly scheduling URL:', error);
      toast.error('Failed to get Calendly scheduling URL');
      return null;
    }
  }
  
  /**
   * Create a single-use scheduling link for a lead
   * Tracks usage in user profile
   */
  async createSingleUseLink(
    eventTypeUri: string, 
    leadName: string, 
    leadEmail: string
  ): Promise<string | null> {
    let apiKey = '';
    let isUserKey = false;
    
    try {
      // Get API key
      const keyInfo = await this.getCalendlyApiKey();
      apiKey = keyInfo.apiKey;
      isUserKey = keyInfo.isUserKey;
      
      const userId = getCurrentUserId();
      
      // For demo purposes, generate a mock scheduling link
      // In a real implementation, you would call the Calendly API
      if (apiKey) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate mock link
        const eventType = eventTypeUri.split('/').pop();
        const mockLink = `https://calendly.com/demo-user/${eventType}?name=${encodeURIComponent(leadName)}&email=${encodeURIComponent(leadEmail)}&a1=${Date.now()}`;
        
        // Increment the usage counter in user profile
        if (userId) {
          await userProfileOperations.incrementIntegrationCounter(userId, 'calendlyLinksGeneratedCount');
        }
        
        return mockLink;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating Calendly single-use link:', error);
      
      // Show user-friendly error
      if (!isUserKey) {
        toast.error('Please configure your Calendly API key in Settings > Integrations');
      } else {
        toast.error('Failed to create Calendly scheduling link. Please check your API key.');
      }
      
      return null;
    }
  }

  /**
   * Get user's Calendly usage statistics
   */
  async getUsageStats(userId: string): Promise<{ linksGenerated: number }> {
    try {
      const userProfile = await userProfileOperations.getUserProfile(userId);
      
      return {
        linksGenerated: userProfile?.calendlyLinksGeneratedCount || 0
      };
    } catch (error) {
      console.error('Error getting Calendly usage stats:', error);
      return { linksGenerated: 0 };
    }
  }
}

export const calendlyService = CalendlyService.getInstance();