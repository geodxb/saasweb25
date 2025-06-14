import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { getCurrentUserId } from './firestore';
import { toast } from 'sonner';
import { encrypt, decrypt } from './encryption';

// Types
export interface UserApiKeys {
  uid: string;
  // Airtable
  airtablePAT?: string;
  airtableBaseId?: string;
  airtableTableName?: string;
  // Calendly
  calendlyApiKey?: string;
  // Google Sheets
  googleSheetsApiKey?: string;
  googleSheetsId?: string;
  googleSheetsRange?: string;
  // Google Calendar
  googleCalendarApiKey?: string;
  googleCalendarId?: string;
  // Microsoft Excel
  excelOnlineApiKey?: string;
  excelFileId?: string;
  excelWorksheetName?: string;
  // Microsoft Calendar
  microsoftCalendarApiKey?: string;
  // Stripe
  stripeAccessToken?: string;
  stripeAccountId?: string;
  // PayPal
  paypalClientId?: string;
  paypalSecret?: string;
  // Zapier
  zapierWebhookUrl?: string;
  // n8n
  n8nWebhookUrl?: string;
  n8nApiKey?: string;
  // Make.com
  makeWebhookUrl?: string;
  makeApiKey?: string;
  // Pabbly
  pabblyWebhookUrl?: string;
  // Timestamps
  updatedAt: Date;
  createdAt: Date;
}

// Operations for managing user API keys
export const userApiKeyOperations = {
  // Get user's API keys
  async getUserApiKeys(userId?: string): Promise<UserApiKeys | null> {
    try {
      const uid = userId || getCurrentUserId();
      if (!uid) return null;
      
      const docRef = doc(db, 'user_api_keys', uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      const data = docSnap.data();
      
      // Decrypt sensitive data
      return {
        uid,
        // Airtable
        airtablePAT: data.airtablePAT ? decrypt(data.airtablePAT) : undefined,
        airtableBaseId: data.airtableBaseId,
        airtableTableName: data.airtableTableName,
        // Calendly
        calendlyApiKey: data.calendlyApiKey ? decrypt(data.calendlyApiKey) : undefined,
        // Google Sheets
        googleSheetsApiKey: data.googleSheetsApiKey ? decrypt(data.googleSheetsApiKey) : undefined,
        googleSheetsId: data.googleSheetsId,
        googleSheetsRange: data.googleSheetsRange,
        // Google Calendar
        googleCalendarApiKey: data.googleCalendarApiKey ? decrypt(data.googleCalendarApiKey) : undefined,
        googleCalendarId: data.googleCalendarId,
        // Microsoft Excel
        excelOnlineApiKey: data.excelOnlineApiKey ? decrypt(data.excelOnlineApiKey) : undefined,
        excelFileId: data.excelFileId,
        excelWorksheetName: data.excelWorksheetName,
        // Microsoft Calendar
        microsoftCalendarApiKey: data.microsoftCalendarApiKey ? decrypt(data.microsoftCalendarApiKey) : undefined,
        // Stripe
        stripeAccessToken: data.stripeAccessToken ? decrypt(data.stripeAccessToken) : undefined,
        stripeAccountId: data.stripeAccountId,
        // PayPal
        paypalClientId: data.paypalClientId ? decrypt(data.paypalClientId) : undefined,
        paypalSecret: data.paypalSecret ? decrypt(data.paypalSecret) : undefined,
        // Zapier
        zapierWebhookUrl: data.zapierWebhookUrl,
        // n8n
        n8nWebhookUrl: data.n8nWebhookUrl,
        n8nApiKey: data.n8nApiKey ? decrypt(data.n8nApiKey) : undefined,
        // Make.com
        makeWebhookUrl: data.makeWebhookUrl,
        makeApiKey: data.makeApiKey ? decrypt(data.makeApiKey) : undefined,
        // Pabbly
        pabblyWebhookUrl: data.pabblyWebhookUrl,
        // Timestamps
        updatedAt: data.updatedAt.toDate(),
        createdAt: data.createdAt.toDate(),
      };
    } catch (error) {
      console.error('Error fetching user API keys:', error);
      return null;
    }
  },
  
  // Save or update user's API keys
  async saveUserApiKeys(
    keys: Partial<Omit<UserApiKeys, 'uid' | 'createdAt' | 'updatedAt'>>, 
    userId?: string
  ): Promise<boolean> {
    try {
      const uid = userId || getCurrentUserId();
      if (!uid) {
        toast.error('You must be logged in to save API keys');
        return false;
      }
      
      const docRef = doc(db, 'user_api_keys', uid);
      const docSnap = await getDoc(docRef);
      
      // Encrypt sensitive data
      const encryptedData: Record<string, any> = {};
      
      // Airtable
      if (keys.airtablePAT) {
        encryptedData.airtablePAT = encrypt(keys.airtablePAT);
      }
      if (keys.airtableBaseId) {
        encryptedData.airtableBaseId = keys.airtableBaseId;
      }
      if (keys.airtableTableName) {
        encryptedData.airtableTableName = keys.airtableTableName;
      }
      
      // Calendly
      if (keys.calendlyApiKey) {
        encryptedData.calendlyApiKey = encrypt(keys.calendlyApiKey);
      }
      
      // Google Sheets
      if (keys.googleSheetsApiKey) {
        encryptedData.googleSheetsApiKey = encrypt(keys.googleSheetsApiKey);
      }
      if (keys.googleSheetsId) {
        encryptedData.googleSheetsId = keys.googleSheetsId;
      }
      if (keys.googleSheetsRange) {
        encryptedData.googleSheetsRange = keys.googleSheetsRange;
      }
      
      // Google Calendar
      if (keys.googleCalendarApiKey) {
        encryptedData.googleCalendarApiKey = encrypt(keys.googleCalendarApiKey);
      }
      if (keys.googleCalendarId) {
        encryptedData.googleCalendarId = keys.googleCalendarId;
      }
      
      // Microsoft Excel
      if (keys.excelOnlineApiKey) {
        encryptedData.excelOnlineApiKey = encrypt(keys.excelOnlineApiKey);
      }
      if (keys.excelFileId) {
        encryptedData.excelFileId = keys.excelFileId;
      }
      if (keys.excelWorksheetName) {
        encryptedData.excelWorksheetName = keys.excelWorksheetName;
      }
      
      // Microsoft Calendar
      if (keys.microsoftCalendarApiKey) {
        encryptedData.microsoftCalendarApiKey = encrypt(keys.microsoftCalendarApiKey);
      }
      
      // Stripe
      if (keys.stripeAccessToken) {
        encryptedData.stripeAccessToken = encrypt(keys.stripeAccessToken);
      }
      if (keys.stripeAccountId) {
        encryptedData.stripeAccountId = keys.stripeAccountId;
      }
      
      // PayPal
      if (keys.paypalClientId) {
        encryptedData.paypalClientId = encrypt(keys.paypalClientId);
      }
      if (keys.paypalSecret) {
        encryptedData.paypalSecret = encrypt(keys.paypalSecret);
      }
      
      // Zapier
      if (keys.zapierWebhookUrl) {
        encryptedData.zapierWebhookUrl = keys.zapierWebhookUrl;
      }
      
      // n8n
      if (keys.n8nWebhookUrl) {
        encryptedData.n8nWebhookUrl = keys.n8nWebhookUrl;
      }
      if (keys.n8nApiKey) {
        encryptedData.n8nApiKey = encrypt(keys.n8nApiKey);
      }
      
      // Make.com
      if (keys.makeWebhookUrl) {
        encryptedData.makeWebhookUrl = keys.makeWebhookUrl;
      }
      if (keys.makeApiKey) {
        encryptedData.makeApiKey = encrypt(keys.makeApiKey);
      }
      
      // Pabbly
      if (keys.pabblyWebhookUrl) {
        encryptedData.pabblyWebhookUrl = keys.pabblyWebhookUrl;
      }
      
      if (docSnap.exists()) {
        // Update existing document
        await updateDoc(docRef, {
          ...encryptedData,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create new document
        await setDoc(docRef, {
          ...encryptedData,
          uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error saving user API keys:', error);
      toast.error('Failed to save API keys');
      return false;
    }
  },
  
  // Test connection methods for various integrations
  async testAirtableConnection(
    pat: string, 
    baseId: string, 
    tableName: string
  ): Promise<boolean> {
    try {
      // Make a request to Airtable API to verify credentials
      const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}?maxRecords=1`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${pat}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status}`);
      }
      
      const data = await response.json();
      return !!data.records;
    } catch (error) {
      console.error('Error testing Airtable connection:', error);
      return false;
    }
  },
  
  async testCalendlyConnection(apiKey: string): Promise<boolean> {
    try {
      // Make a request to Calendly API to verify credentials
      const response = await fetch('https://api.calendly.com/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Calendly API error: ${response.status}`);
      }
      
      const data = await response.json();
      return !!data.resource;
    } catch (error) {
      console.error('Error testing Calendly connection:', error);
      return false;
    }
  },
  
  async testGoogleSheetsConnection(
    apiKey: string,
    spreadsheetId: string,
    range: string
  ): Promise<boolean> {
    try {
      // Make a request to Google Sheets API to verify credentials
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Google Sheets API error: ${response.status}`);
      }
      
      const data = await response.json();
      return !!data.values;
    } catch (error) {
      console.error('Error testing Google Sheets connection:', error);
      return false;
    }
  },
  
  async testGoogleCalendarConnection(
    apiKey: string,
    calendarId: string = 'primary'
  ): Promise<boolean> {
    try {
      // Make a request to Google Calendar API to verify credentials
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?maxResults=1&key=${apiKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Google Calendar API error: ${response.status}`);
      }
      
      const data = await response.json();
      return !!data.items;
    } catch (error) {
      console.error('Error testing Google Calendar connection:', error);
      return false;
    }
  },
  
  async testExcelOnlineConnection(
    apiKey: string,
    fileId: string,
    worksheetName: string
  ): Promise<boolean> {
    try {
      // In a real implementation, you would call the Microsoft Graph API
      // For demo purposes, just return true if all parameters are provided
      return !!apiKey && !!fileId && !!worksheetName;
    } catch (error) {
      console.error('Error testing Excel Online connection:', error);
      return false;
    }
  },
  
  async testStripeConnection(accessToken: string): Promise<boolean> {
    try {
      // In a real implementation, you would call the Stripe API
      // For demo purposes, just return true if the token is provided
      return !!accessToken;
    } catch (error) {
      console.error('Error testing Stripe connection:', error);
      return false;
    }
  },
  
  async testPayPalConnection(clientId: string, secret: string): Promise<boolean> {
    try {
      // In a real implementation, you would call the PayPal API
      // For demo purposes, just return true if credentials are provided
      return !!clientId && !!secret;
    } catch (error) {
      console.error('Error testing PayPal connection:', error);
      return false;
    }
  },
  
  async testWebhookUrl(url: string): Promise<boolean> {
    try {
      // In a real implementation, you might send a test payload to the webhook
      // For demo purposes, just validate the URL format
      const urlPattern = /^https?:\/\/.+/i;
      return urlPattern.test(url);
    } catch (error) {
      console.error('Error testing webhook URL:', error);
      return false;
    }
  }
};