import { userApiKeyOperations } from '@/lib/userApiKeys';
import { toast } from 'sonner';
import { getCurrentUserId } from '@/lib/firestore';
import { userProfileOperations } from '@/lib/firestore';

// Default developer key (fallback only)
const DEV_GOOGLE_CALENDAR_API_KEY = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY || '';

export class GoogleCalendarService {
  private static instance: GoogleCalendarService;
  
  static getInstance(): GoogleCalendarService {
    if (!GoogleCalendarService.instance) {
      GoogleCalendarService.instance = new GoogleCalendarService();
    }
    return GoogleCalendarService.instance;
  }
  
  /**
   * Get the user's Google Calendar API key
   * Falls back to developer key if user key is not available
   */
  async getGoogleCalendarApiKey(): Promise<{ apiKey: string; isUserKey: boolean }> {
    try {
      // Get current user ID
      const userId = getCurrentUserId();
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Load user's API keys from Firestore
      const userKeys = await userApiKeyOperations.getUserApiKeys(userId);
      
      // If user has configured Google Calendar, use their key
      if (userKeys?.googleCalendarApiKey) {
        return {
          apiKey: userKeys.googleCalendarApiKey,
          isUserKey: true
        };
      }
      
      // Fall back to developer key
      if (DEV_GOOGLE_CALENDAR_API_KEY) {
        console.warn('Using developer Google Calendar key as fallback');
        return {
          apiKey: DEV_GOOGLE_CALENDAR_API_KEY,
          isUserKey: false
        };
      }
      
      throw new Error('No Google Calendar API key found');
    } catch (error) {
      console.error('Error getting Google Calendar API key:', error);
      throw error;
    }
  }
  
  /**
   * Get the current user's Google Calendar profile
   */
  async getCurrentUser(): Promise<any | null> {
    try {
      const { apiKey, isUserKey } = await this.getGoogleCalendarApiKey();
      
      // In a real implementation, you would call the Google Calendar API
      // For demo purposes, return a mock user if we have an API key
      if (apiKey) {
        return {
          id: 'user123',
          email: 'user@example.com',
          name: 'Demo User',
          calendars: [
            { id: 'primary', name: 'Primary Calendar' },
            { id: 'work', name: 'Work Calendar' }
          ]
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching Google Calendar user:', error);
      
      // Show user-friendly error
      if (!isUserKey) {
        toast.error('Please configure your Google Calendar API key in Settings > Integrations');
      } else {
        toast.error('Failed to fetch Google Calendar user. Please check your API key.');
      }
      
      return null;
    }
  }
  
  /**
   * Get the user's calendars
   */
  async getCalendars(): Promise<any[]> {
    try {
      const { apiKey, isUserKey } = await this.getGoogleCalendarApiKey();
      const user = await this.getCurrentUser();
      
      if (!user) {
        throw new Error('Failed to get Google Calendar user');
      }
      
      // In a real implementation, you would call the Google Calendar API
      // For demo purposes, return mock calendars
      return user.calendars || [];
    } catch (error) {
      console.error('Error fetching Google Calendar calendars:', error);
      
      // Show user-friendly error
      if (!isUserKey) {
        toast.error('Please configure your Google Calendar API key in Settings > Integrations');
      } else {
        toast.error('Failed to fetch Google Calendar calendars. Please check your API key.');
      }
      
      return [];
    }
  }
  
  /**
   * Create a calendar event
   * Tracks usage in user profile
   */
  async createEvent(calendarId: string, event: {
    summary: string;
    description?: string;
    location?: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    attendees?: { email: string; name?: string }[];
  }): Promise<string | null> {
    try {
      const { apiKey, isUserKey } = await this.getGoogleCalendarApiKey();
      const userId = getCurrentUserId();
      
      // In a real implementation, you would call the Google Calendar API
      // For demo purposes, simulate a successful event creation
      const eventId = `event-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Increment the usage counter in user profile
      if (userId) {
        await userProfileOperations.incrementIntegrationCounter(userId, 'googleCalendarEventsCount');
      }
      
      toast.success('Calendar event created successfully');
      return eventId;
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      
      // Show user-friendly error
      if (!isUserKey) {
        toast.error('Please configure your Google Calendar API key in Settings > Integrations');
      } else {
        toast.error('Failed to create Google Calendar event. Please check your API key.');
      }
      
      return null;
    }
  }
  
  /**
   * Check availability for a time slot
   */
  async checkAvailability(calendarId: string, start: string, end: string): Promise<boolean> {
    try {
      const { apiKey, isUserKey } = await this.getGoogleCalendarApiKey();
      
      // In a real implementation, you would call the Google Calendar API
      // For demo purposes, simulate availability check
      return Math.random() > 0.3; // 70% chance of being available
    } catch (error) {
      console.error('Error checking Google Calendar availability:', error);
      
      // Show user-friendly error
      if (!isUserKey) {
        toast.error('Please configure your Google Calendar API key in Settings > Integrations');
      } else {
        toast.error('Failed to check Google Calendar availability. Please check your API key.');
      }
      
      return false;
    }
  }

  /**
   * Get user's Google Calendar usage statistics
   */
  async getUsageStats(userId: string): Promise<{ eventsCreated: number }> {
    try {
      const userProfile = await userProfileOperations.getUserProfile(userId);
      
      return {
        eventsCreated: userProfile?.googleCalendarEventsCount || 0
      };
    } catch (error) {
      console.error('Error getting Google Calendar usage stats:', error);
      return { eventsCreated: 0 };
    }
  }
}

export const googleCalendarService = GoogleCalendarService.getInstance();