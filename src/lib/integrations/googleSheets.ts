import { userApiKeyOperations } from '@/lib/userApiKeys';
import { toast } from 'sonner';
import { getCurrentUserId } from '@/lib/firestore';
import { userProfileOperations } from '@/lib/firestore';

// Default developer keys (fallback only)
const DEV_GOOGLE_SHEETS_API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || '';
const DEV_GOOGLE_SHEETS_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID || '';
const DEV_GOOGLE_SHEETS_RANGE = import.meta.env.VITE_GOOGLE_SHEETS_RANGE || 'Sheet1!A1:Z1000';

interface GoogleSheetsRecord {
  values: string[];
}

export class GoogleSheetsService {
  private static instance: GoogleSheetsService;
  
  static getInstance(): GoogleSheetsService {
    if (!GoogleSheetsService.instance) {
      GoogleSheetsService.instance = new GoogleSheetsService();
    }
    return GoogleSheetsService.instance;
  }
  
  /**
   * Get the user's Google Sheets API key, spreadsheet ID, and range
   * Falls back to developer keys if user keys are not available
   */
  async getGoogleSheetsConfig(): Promise<{ 
    apiKey: string; 
    spreadsheetId: string; 
    range: string;
    isUserKey: boolean;
  }> {
    try {
      // Get current user ID
      const userId = getCurrentUserId();
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Load user's API keys from Firestore
      const userKeys = await userApiKeyOperations.getUserApiKeys(userId);
      
      // If user has configured Google Sheets, use their keys
      if (userKeys?.googleSheetsApiKey && userKeys?.googleSheetsId && userKeys?.googleSheetsRange) {
        return {
          apiKey: userKeys.googleSheetsApiKey,
          spreadsheetId: userKeys.googleSheetsId,
          range: userKeys.googleSheetsRange,
          isUserKey: true
        };
      }
      
      // Fall back to developer keys
      if (DEV_GOOGLE_SHEETS_API_KEY && DEV_GOOGLE_SHEETS_ID) {
        console.warn('Using developer Google Sheets keys as fallback');
        return {
          apiKey: DEV_GOOGLE_SHEETS_API_KEY,
          spreadsheetId: DEV_GOOGLE_SHEETS_ID,
          range: DEV_GOOGLE_SHEETS_RANGE,
          isUserKey: false
        };
      }
      
      throw new Error('No Google Sheets configuration found');
    } catch (error) {
      console.error('Error getting Google Sheets configuration:', error);
      throw error;
    }
  }
  
  /**
   * Fetch records from Google Sheets
   */
  async getRecords(options?: { 
    maxRows?: number;
  }): Promise<GoogleSheetsRecord[]> {
    try {
      const config = await this.getGoogleSheetsConfig();
      
      // Build URL with query parameters
      let url = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${config.range}?key=${config.apiKey}`;
      
      // Make request to Google Sheets API
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      
      // Convert to records format
      const records = data.values?.slice(1).map((row: string[]) => ({
        values: row
      })) || [];
      
      // Apply max rows limit if specified
      if (options?.maxRows && records.length > options.maxRows) {
        return records.slice(0, options.maxRows);
      }
      
      return records;
    } catch (error) {
      console.error('Error fetching records from Google Sheets:', error);
      
      // Show user-friendly error
      if (!config.isUserKey) {
        toast.error('Please configure your Google Sheets API key in Settings > Integrations');
      } else {
        toast.error('Failed to fetch data from Google Sheets. Please check your API key and settings.');
      }
      
      return [];
    }
  }
  
  /**
   * Create new rows in Google Sheets
   */
  async createRecords(rows: string[][]): Promise<boolean> {
    try {
      const config = await this.getGoogleSheetsConfig();
      
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${config.range}:append?valueInputOption=USER_ENTERED&key=${config.apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: rows
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error creating records in Google Sheets:', error);
      
      // Show user-friendly error
      if (!config.isUserKey) {
        toast.error('Please configure your Google Sheets API key in Settings > Integrations');
      } else {
        toast.error('Failed to create records in Google Sheets. Please check your API key and settings.');
      }
      
      return false;
    }
  }
  
  /**
   * Update existing rows in Google Sheets
   */
  async updateRecords(range: string, rows: string[][]): Promise<boolean> {
    try {
      const config = await this.getGoogleSheetsConfig();
      
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED&key=${config.apiKey}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: rows
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating records in Google Sheets:', error);
      
      // Show user-friendly error
      if (!config.isUserKey) {
        toast.error('Please configure your Google Sheets API key in Settings > Integrations');
      } else {
        toast.error('Failed to update records in Google Sheets. Please check your API key and settings.');
      }
      
      return false;
    }
  }
  
  /**
   * Clear rows in Google Sheets
   */
  async clearRecords(range: string): Promise<boolean> {
    try {
      const config = await this.getGoogleSheetsConfig();
      
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${range}:clear?key=${config.apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error clearing records in Google Sheets:', error);
      
      // Show user-friendly error
      if (!config.isUserKey) {
        toast.error('Please configure your Google Sheets API key in Settings > Integrations');
      } else {
        toast.error('Failed to clear records in Google Sheets. Please check your API key and settings.');
      }
      
      return false;
    }
  }

  /**
   * Import leads from Google Sheets to Locafyr
   * Tracks usage in user profile
   */
  async importLeadsToLocafyr(userId: string): Promise<number> {
    try {
      // Get records from Google Sheets
      const records = await this.getRecords();
      
      if (records.length === 0) {
        toast.info('No records found in Google Sheets');
        return 0;
      }

      // Process records and import to Locafyr
      // ... (implementation would go here)

      // Increment the import counter in user profile
      await userProfileOperations.incrementIntegrationCounter(userId, 'googleSheetsImportsCount');
      
      return records.length;
    } catch (error) {
      console.error('Error importing leads from Google Sheets:', error);
      toast.error('Failed to import leads from Google Sheets');
      return 0;
    }
  }

  /**
   * Export leads from Locafyr to Google Sheets
   * Tracks usage in user profile
   */
  async exportLeadsToGoogleSheets(userId: string, leads: any[]): Promise<number> {
    try {
      if (leads.length === 0) {
        toast.info('No leads to export');
        return 0;
      }

      // Process leads and export to Google Sheets
      // ... (implementation would go here)

      // Increment the export counter in user profile
      await userProfileOperations.incrementIntegrationCounter(userId, 'googleSheetsExportsCount');
      
      return leads.length;
    } catch (error) {
      console.error('Error exporting leads to Google Sheets:', error);
      toast.error('Failed to export leads to Google Sheets');
      return 0;
    }
  }

  /**
   * Get user's Google Sheets usage statistics
   */
  async getUsageStats(userId: string): Promise<{ imports: number; exports: number }> {
    try {
      const userProfile = await userProfileOperations.getUserProfile(userId);
      
      return {
        imports: userProfile?.googleSheetsImportsCount || 0,
        exports: userProfile?.googleSheetsExportsCount || 0
      };
    } catch (error) {
      console.error('Error getting Google Sheets usage stats:', error);
      return { imports: 0, exports: 0 };
    }
  }
}

export const googleSheetsService = GoogleSheetsService.getInstance();