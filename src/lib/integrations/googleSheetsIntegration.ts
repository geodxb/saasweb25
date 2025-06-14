import { userApiKeyOperations } from '@/lib/userApiKeys';
import { toast } from 'sonner';
import { getCurrentUserId } from '@/lib/firestore';
import { gmailService } from '@/lib/gmail';

export interface GoogleSheet {
  id: string;
  name: string;
  sheets: SheetInfo[];
}

export interface SheetInfo {
  id: string;
  title: string;
  index: number;
  rowCount: number;
  columnCount: number;
}

export interface SheetData {
  range: string;
  values: any[][];
  headers: string[];
  rows: any[][];
}

export class GoogleSheetsIntegration {
  private static instance: GoogleSheetsIntegration;
  private accessToken: string | null = null;
  
  static getInstance(): GoogleSheetsIntegration {
    if (!GoogleSheetsIntegration.instance) {
      GoogleSheetsIntegration.instance = new GoogleSheetsIntegration();
    }
    return GoogleSheetsIntegration.instance;
  }
  
  /**
   * Initialize the Google Sheets integration
   */
  async initialize(): Promise<boolean> {
    try {
      // Initialize Gmail service first (which handles OAuth)
      await gmailService.initialize();
      
      // Check if user is authorized
      if (!gmailService.isUserAuthorized()) {
        return false;
      }
      
      // Request additional scope for Google Sheets
      const authorized = await this.authorizeWithSheets();
      if (!authorized) {
        return false;
      }
      
      // Get access token
      this.accessToken = await this.getAccessToken();
      
      return !!this.accessToken;
    } catch (error) {
      console.error('Error initializing Google Sheets integration:', error);
      return false;
    }
  }
  
  /**
   * Authorize with Google Sheets scope
   */
  private async authorizeWithSheets(): Promise<boolean> {
    try {
      // This would normally request the additional scope
      // For demo purposes, we'll assume the authorization is successful
      return true;
    } catch (error) {
      console.error('Error authorizing with Google Sheets:', error);
      return false;
    }
  }
  
  /**
   * Get access token for Google Sheets API
   */
  private async getAccessToken(): Promise<string | null> {
    try {
      // In a real implementation, this would get the token from Gmail service
      // or request a new one with the sheets scope
      // For demo, we'll return a mock token
      return 'mock_access_token_for_sheets';
    } catch (error) {
      console.error('Error getting access token for Google Sheets:', error);
      return null;
    }
  }
  
  /**
   * Check if the integration is initialized
   */
  isInitialized(): boolean {
    return !!this.accessToken;
  }
  
  /**
   * Get list of available spreadsheets
   */
  async getSpreadsheets(): Promise<GoogleSheet[]> {
    if (!this.isInitialized()) {
      throw new Error('Google Sheets integration not initialized');
    }
    
    try {
      // In a real implementation, this would call the Google Sheets API
      // For demo, we'll return mock data
      return [
        {
          id: 'spreadsheet1',
          name: 'Lead Database 2025',
          sheets: [
            { id: 'sheet1', title: 'Leads', index: 0, rowCount: 100, columnCount: 10 },
            { id: 'sheet2', title: 'Clients', index: 1, rowCount: 50, columnCount: 15 },
            { id: 'sheet3', title: 'Analytics', index: 2, rowCount: 30, columnCount: 8 }
          ]
        },
        {
          id: 'spreadsheet2',
          name: 'Marketing Campaigns',
          sheets: [
            { id: 'sheet4', title: 'Campaign Results', index: 0, rowCount: 20, columnCount: 12 },
            { id: 'sheet5', title: 'Budget', index: 1, rowCount: 15, columnCount: 8 }
          ]
        },
        {
          id: 'spreadsheet3',
          name: 'Client Projects',
          sheets: [
            { id: 'sheet6', title: 'Project Status', index: 0, rowCount: 40, columnCount: 10 },
            { id: 'sheet7', title: 'Timelines', index: 1, rowCount: 25, columnCount: 6 }
          ]
        }
      ];
    } catch (error) {
      console.error('Error getting Google Sheets spreadsheets:', error);
      throw error;
    }
  }
  
  /**
   * Get sheet data from a specific spreadsheet and sheet
   */
  async getSheetData(spreadsheetId: string, range: string): Promise<SheetData> {
    if (!this.isInitialized()) {
      throw new Error('Google Sheets integration not initialized');
    }
    
    try {
      // In a real implementation, this would call the Google Sheets API
      // For demo, we'll return mock data
      const mockData = [
        ['Name', 'Email', 'Phone', 'Company', 'Status', 'Source', 'Created'],
        ['John Smith', 'john@example.com', '(555) 123-4567', 'Acme Inc', 'New', 'Website', '2023-05-15'],
        ['Sarah Johnson', 'sarah@example.com', '(555) 987-6543', 'Tech Co', 'Contacted', 'Referral', '2023-05-14'],
        ['Michael Brown', 'michael@example.com', '(555) 456-7890', 'Global Services', 'Proposal', 'LinkedIn', '2023-05-13'],
        ['Emily Davis', 'emily@example.com', '(555) 789-0123', 'Design Studio', 'New', 'Google', '2023-05-12'],
        ['David Wilson', 'david@example.com', '(555) 321-6547', 'Marketing Pro', 'Contacted', 'Event', '2023-05-11']
      ];
      
      const headers = mockData[0];
      const rows = mockData.slice(1);
      
      return {
        range,
        values: mockData,
        headers,
        rows
      };
    } catch (error) {
      console.error('Error getting Google Sheets data:', error);
      throw error;
    }
  }
  
  /**
   * Import data from Google Sheets to Firestore
   */
  async importToFirestore(spreadsheetId: string, range: string, collection: string): Promise<number> {
    if (!this.isInitialized()) {
      throw new Error('Google Sheets integration not initialized');
    }
    
    try {
      // Get sheet data
      const sheetData = await this.getSheetData(spreadsheetId, range);
      
      // In a real implementation, this would import the data to Firestore
      // For demo, we'll just return the number of rows
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return sheetData.rows.length;
    } catch (error) {
      console.error('Error importing from Google Sheets to Firestore:', error);
      throw error;
    }
  }
  
  /**
   * Export data from Firestore to Google Sheets
   */
  async exportToGoogleSheets(spreadsheetId: string, range: string, data: any[]): Promise<boolean> {
    if (!this.isInitialized()) {
      throw new Error('Google Sheets integration not initialized');
    }
    
    try {
      // In a real implementation, this would export the data to Google Sheets
      // For demo, we'll just return success
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Error exporting to Google Sheets:', error);
      throw error;
    }
  }
  
  /**
   * Save selected spreadsheet ID to user settings
   */
  async saveSelectedSpreadsheet(spreadsheetId: string): Promise<boolean> {
    try {
      await userApiKeyOperations.saveUserApiKeys({
        googleSheetsId: spreadsheetId
      });
      
      return true;
    } catch (error) {
      console.error('Error saving selected spreadsheet:', error);
      return false;
    }
  }
}

export const googleSheetsIntegration = GoogleSheetsIntegration.getInstance();