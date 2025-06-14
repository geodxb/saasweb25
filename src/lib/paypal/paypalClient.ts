import { userApiKeyOperations } from '@/lib/userApiKeys';
import { toast } from 'sonner';
import { encrypt, decrypt } from '@/lib/encryption';

// Types for PayPal API responses
export interface PayPalTransaction {
  id: string;
  status: 'COMPLETED' | 'PENDING' | 'REFUNDED' | 'FAILED';
  amount: {
    value: string;
    currency_code: string;
  };
  payer?: {
    email_address?: string;
    name?: {
      given_name?: string;
      surname?: string;
    };
  };
  description?: string;
  create_time: string;
  update_time: string;
}

export interface PayPalTransactionsResponse {
  transactions: PayPalTransaction[];
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface PayPalTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export class PayPalClient {
  private static instance: PayPalClient;
  private clientId: string | null = null;
  private clientSecret: string | null = null;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  
  static getInstance(): PayPalClient {
    if (!PayPalClient.instance) {
      PayPalClient.instance = new PayPalClient();
    }
    return PayPalClient.instance;
  }
  
  /**
   * Initialize the PayPal client with the user's credentials
   */
  async initialize(): Promise<boolean> {
    try {
      const userKeys = await userApiKeyOperations.getUserApiKeys();
      
      if (!userKeys?.paypalClientId || !userKeys?.paypalSecret) {
        return false;
      }
      
      this.clientId = userKeys.paypalClientId;
      this.clientSecret = userKeys.paypalSecret;
      
      // Get an access token
      await this.getAccessToken();
      
      return true;
    } catch (error) {
      console.error('Error initializing PayPal client:', error);
      return false;
    }
  }
  
  /**
   * Check if the PayPal client is initialized with valid credentials
   */
  isInitialized(): boolean {
    return !!this.clientId && !!this.clientSecret;
  }
  
  /**
   * Get the PayPal client ID
   */
  getClientId(): string | null {
    return this.clientId;
  }
  
  /**
   * Set the PayPal credentials
   */
  async setCredentials(clientId: string, clientSecret: string): Promise<boolean> {
    try {
      // Test the credentials by getting an access token
      const isValid = await this.testCredentials(clientId, clientSecret);
      
      if (!isValid) {
        toast.error('Invalid PayPal credentials');
        return false;
      }
      
      // Save the credentials to Firestore
      await userApiKeyOperations.saveUserApiKeys({
        paypalClientId: clientId,
        paypalSecret: clientSecret
      });
      
      this.clientId = clientId;
      this.clientSecret = clientSecret;
      
      // Get an access token with the new credentials
      await this.getAccessToken();
      
      return true;
    } catch (error) {
      console.error('Error setting PayPal credentials:', error);
      toast.error('Failed to save PayPal credentials');
      return false;
    }
  }
  
  /**
   * Test if PayPal credentials are valid
   */
  async testCredentials(clientId: string, clientSecret: string): Promise<boolean> {
    try {
      const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en_US',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
        },
        body: 'grant_type=client_credentials'
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error testing PayPal credentials:', error);
      return false;
    }
  }
  
  /**
   * Disconnect PayPal by removing the credentials
   */
  async disconnect(): Promise<boolean> {
    try {
      await userApiKeyOperations.saveUserApiKeys({
        paypalClientId: '',
        paypalSecret: ''
      });
      
      this.clientId = null;
      this.clientSecret = null;
      this.accessToken = null;
      this.tokenExpiry = 0;
      
      return true;
    } catch (error) {
      console.error('Error disconnecting PayPal:', error);
      return false;
    }
  }
  
  /**
   * Get an access token from PayPal
   */
  private async getAccessToken(): Promise<string> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('PayPal client not initialized');
    }
    
    // Check if we already have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }
    
    try {
      const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en_US',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
        },
        body: 'grant_type=client_credentials'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error_description || `HTTP error ${response.status}`);
      }
      
      const data: PayPalTokenResponse = await response.json();
      
      this.accessToken = data.access_token;
      // Set expiry to slightly before the actual expiry to be safe
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
      
      return this.accessToken;
    } catch (error) {
      console.error('Error getting PayPal access token:', error);
      throw error;
    }
  }
  
  /**
   * Get recent transactions from PayPal
   */
  async getTransactions(limit: number = 10): Promise<PayPalTransaction[]> {
    if (!this.isInitialized()) {
      throw new Error('PayPal client not initialized');
    }
    
    try {
      // Ensure we have a valid access token
      const accessToken = await this.getAccessToken();
      
      // Get current date and date 30 days ago
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await fetch(`https://api-m.sandbox.paypal.com/v1/reporting/transactions?start_date=${startDate}T00:00:00-0000&end_date=${endDate}T23:59:59-0000&fields=all&page_size=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }
      
      const data: PayPalTransactionsResponse = await response.json();
      
      return data.transactions || [];
    } catch (error) {
      console.error('Error fetching PayPal transactions:', error);
      throw error;
    }
  }
  
  /**
   * Create a new order in PayPal
   */
  async createOrder(params: {
    amount: string;
    currency: string;
    description: string;
    email: string;
  }): Promise<string> {
    if (!this.isInitialized()) {
      throw new Error('PayPal client not initialized');
    }
    
    try {
      // Ensure we have a valid access token
      const accessToken = await this.getAccessToken();
      
      const response = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: params.currency,
                value: params.amount
              },
              description: params.description
            }
          ],
          payer: {
            email_address: params.email
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      
      return data.id;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      throw error;
    }
  }
  
  /**
   * Capture a PayPal order (complete the payment)
   */
  async captureOrder(orderId: string): Promise<PayPalTransaction> {
    if (!this.isInitialized()) {
      throw new Error('PayPal client not initialized');
    }
    
    try {
      // Ensure we have a valid access token
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      
      // Convert the response to our transaction format
      const transaction: PayPalTransaction = {
        id: data.id,
        status: data.status,
        amount: data.purchase_units[0].payments.captures[0].amount,
        payer: data.payer,
        description: data.purchase_units[0].description,
        create_time: data.create_time,
        update_time: data.update_time
      };
      
      return transaction;
    } catch (error) {
      console.error('Error capturing PayPal order:', error);
      throw error;
    }
  }
  
  /**
   * Refund a PayPal payment
   */
  async refundPayment(captureId: string, amount?: string): Promise<any> {
    if (!this.isInitialized()) {
      throw new Error('PayPal client not initialized');
    }
    
    try {
      // Ensure we have a valid access token
      const accessToken = await this.getAccessToken();
      
      const body: any = {};
      
      if (amount) {
        body.amount = {
          value: amount,
          currency_code: 'USD'
        };
      }
      
      const response = await fetch(`https://api-m.sandbox.paypal.com/v2/payments/captures/${captureId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error refunding PayPal payment:', error);
      throw error;
    }
  }
}

export const paypalClient = PayPalClient.getInstance();