import { userApiKeyOperations } from '@/lib/userApiKeys';
import { toast } from 'sonner';
import { encrypt, decrypt } from '@/lib/encryption';

// Types for Stripe API responses
export interface StripeCharge {
  id: string;
  amount: number;
  amount_refunded: number;
  currency: string;
  created: number;
  description: string;
  status: 'succeeded' | 'pending' | 'failed';
  receipt_email: string;
  customer?: string;
  customer_name?: string;
  payment_method_details?: any;
  metadata?: Record<string, string>;
}

export interface StripeChargeResponse {
  object: string;
  data: StripeCharge[];
  has_more: boolean;
  url: string;
}

export interface StripeError {
  type: string;
  message: string;
  code?: string;
  param?: string;
}

export class StripeClient {
  private static instance: StripeClient;
  private apiKey: string | null = null;
  
  static getInstance(): StripeClient {
    if (!StripeClient.instance) {
      StripeClient.instance = new StripeClient();
    }
    return StripeClient.instance;
  }
  
  /**
   * Initialize the Stripe client with the user's API key
   */
  async initialize(): Promise<boolean> {
    try {
      const userKeys = await userApiKeyOperations.getUserApiKeys();
      
      if (!userKeys?.stripeAccessToken) {
        return false;
      }
      
      this.apiKey = userKeys.stripeAccessToken;
      return true;
    } catch (error) {
      console.error('Error initializing Stripe client:', error);
      return false;
    }
  }
  
  /**
   * Check if the Stripe client is initialized with a valid API key
   */
  isInitialized(): boolean {
    return !!this.apiKey;
  }
  
  /**
   * Get the Stripe API key
   */
  getApiKey(): string | null {
    return this.apiKey;
  }
  
  /**
   * Set the Stripe API key
   */
  async setApiKey(apiKey: string): Promise<boolean> {
    try {
      // Test the API key by making a simple request
      const isValid = await this.testApiKey(apiKey);
      
      if (!isValid) {
        toast.error('Invalid Stripe API key');
        return false;
      }
      
      // Save the API key to Firestore
      await userApiKeyOperations.saveUserApiKeys({
        stripeAccessToken: apiKey
      });
      
      this.apiKey = apiKey;
      return true;
    } catch (error) {
      console.error('Error setting Stripe API key:', error);
      toast.error('Failed to save Stripe API key');
      return false;
    }
  }
  
  /**
   * Test if a Stripe API key is valid
   */
  async testApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.stripe.com/v1/balance', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error testing Stripe API key:', error);
      return false;
    }
  }
  
  /**
   * Disconnect Stripe by removing the API key
   */
  async disconnect(): Promise<boolean> {
    try {
      await userApiKeyOperations.saveUserApiKeys({
        stripeAccessToken: ''
      });
      
      this.apiKey = null;
      return true;
    } catch (error) {
      console.error('Error disconnecting Stripe:', error);
      return false;
    }
  }
  
  /**
   * Get recent charges from Stripe
   */
  async getCharges(limit: number = 10): Promise<StripeCharge[]> {
    if (!this.isInitialized()) {
      throw new Error('Stripe client not initialized');
    }
    
    try {
      const params = new URLSearchParams({
        limit: limit.toString()
      });
      
      const response = await fetch(`https://api.stripe.com/v1/charges?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
      }
      
      const data: StripeChargeResponse = await response.json();
      
      // Process and format the charges
      return data.data.map(charge => {
        // Add customer name if available (from metadata or customer object)
        if (charge.metadata?.customer_name) {
          charge.customer_name = charge.metadata.customer_name;
        } else if (charge.receipt_email) {
          // Extract name from email as fallback
          charge.customer_name = charge.receipt_email.split('@')[0]
            .split('.')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
        }
        
        return charge;
      });
    } catch (error) {
      console.error('Error fetching Stripe charges:', error);
      throw error;
    }
  }
  
  /**
   * Create a new charge in Stripe
   */
  async createCharge(params: {
    amount: number;
    currency: string;
    description: string;
    receipt_email: string;
    customer_name?: string;
    metadata?: Record<string, string>;
  }): Promise<StripeCharge> {
    if (!this.isInitialized()) {
      throw new Error('Stripe client not initialized');
    }
    
    try {
      // Prepare form data
      const formData = new URLSearchParams();
      formData.append('amount', params.amount.toString());
      formData.append('currency', params.currency);
      formData.append('description', params.description);
      formData.append('receipt_email', params.receipt_email);
      
      // Add metadata if provided
      const metadata = {
        ...params.metadata,
        customer_name: params.customer_name
      };
      
      if (Object.keys(metadata).length > 0) {
        Object.entries(metadata).forEach(([key, value]) => {
          if (value) {
            formData.append(`metadata[${key}]`, value);
          }
        });
      }
      
      const response = await fetch('https://api.stripe.com/v1/charges', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating Stripe charge:', error);
      throw error;
    }
  }
  
  /**
   * Issue a refund for a charge
   */
  async refundCharge(chargeId: string, amount?: number): Promise<any> {
    if (!this.isInitialized()) {
      throw new Error('Stripe client not initialized');
    }
    
    try {
      // Prepare form data
      const formData = new URLSearchParams();
      formData.append('charge', chargeId);
      
      if (amount) {
        formData.append('amount', amount.toString());
      }
      
      const response = await fetch('https://api.stripe.com/v1/refunds', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error refunding Stripe charge:', error);
      throw error;
    }
  }
}

export const stripeClient = StripeClient.getInstance();