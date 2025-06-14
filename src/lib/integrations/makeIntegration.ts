import { userApiKeyOperations } from '@/lib/userApiKeys';
import { toast } from 'sonner';
import { getCurrentUserId } from '@/lib/firestore';

export interface MakeScenario {
  id: string;
  name: string;
  active: boolean;
  url: string;
  lastRun?: string;
}

export interface MakeWebhook {
  id: string;
  name: string;
  url: string;
  active: boolean;
  scenarioId: string;
  scenarioUrl: string;
}

export class MakeIntegration {
  private static instance: MakeIntegration;
  private webhookUrl: string | null = null;
  private apiKey: string | null = null;
  
  static getInstance(): MakeIntegration {
    if (!MakeIntegration.instance) {
      MakeIntegration.instance = new MakeIntegration();
    }
    return MakeIntegration.instance;
  }
  
  /**
   * Initialize the Make.com integration
   */
  async initialize(): Promise<boolean> {
    try {
      const userKeys = await userApiKeyOperations.getUserApiKeys();
      
      if (!userKeys?.makeWebhookUrl) {
        return false;
      }
      
      this.webhookUrl = userKeys.makeWebhookUrl;
      this.apiKey = userKeys.makeApiKey || null;
      
      return true;
    } catch (error) {
      console.error('Error initializing Make.com integration:', error);
      return false;
    }
  }
  
  /**
   * Check if the integration is initialized
   */
  isInitialized(): boolean {
    return !!this.webhookUrl;
  }
  
  /**
   * Get the webhook URL
   */
  getWebhookUrl(): string | null {
    return this.webhookUrl;
  }
  
  /**
   * Get the API key
   */
  getApiKey(): string | null {
    return this.apiKey;
  }
  
  /**
   * Get scenarios from Make.com
   */
  async getScenarios(): Promise<MakeScenario[]> {
    if (!this.isInitialized()) {
      throw new Error('Make.com integration not initialized');
    }
    
    try {
      // In a real implementation, this would call the Make.com API
      // For demo, we'll return mock data
      return [
        {
          id: 'scenario-1',
          name: 'Lead Processing Workflow',
          active: true,
          url: 'https://www.make.com/en/scenarios/123456',
          lastRun: new Date().toISOString()
        },
        {
          id: 'scenario-2',
          name: 'Email Notification Workflow',
          active: true,
          url: 'https://www.make.com/en/scenarios/234567',
          lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'scenario-3',
          name: 'Data Backup Workflow',
          active: false,
          url: 'https://www.make.com/en/scenarios/345678'
        }
      ];
    } catch (error) {
      console.error('Error getting Make.com scenarios:', error);
      throw error;
    }
  }
  
  /**
   * Get webhooks from Make.com
   */
  async getWebhooks(): Promise<MakeWebhook[]> {
    if (!this.isInitialized()) {
      throw new Error('Make.com integration not initialized');
    }
    
    try {
      // In a real implementation, this would call the Make.com API
      // For demo, we'll return mock data
      return [
        {
          id: 'webhook-1',
          name: 'Lead Created Webhook',
          url: 'https://hook.make.com/abcdefg123456',
          active: true,
          scenarioId: 'scenario-1',
          scenarioUrl: 'https://www.make.com/en/scenarios/123456'
        },
        {
          id: 'webhook-2',
          name: 'Client Converted Webhook',
          url: 'https://hook.make.com/hijklmn789012',
          active: true,
          scenarioId: 'scenario-2',
          scenarioUrl: 'https://www.make.com/en/scenarios/234567'
        }
      ];
    } catch (error) {
      console.error('Error getting Make.com webhooks:', error);
      throw error;
    }
  }
  
  /**
   * Get execution logs from Make.com
   */
  async getExecutionLogs(): Promise<any[]> {
    if (!this.isInitialized()) {
      throw new Error('Make.com integration not initialized');
    }
    
    try {
      // In a real implementation, this would call the Make.com API
      // For demo, we'll return mock data
      return [
        {
          id: 'execution-1',
          scenarioId: 'scenario-1',
          scenarioName: 'Lead Processing Workflow',
          status: 'success',
          timestamp: new Date().toISOString(),
          message: 'Successfully processed lead data'
        },
        {
          id: 'execution-2',
          scenarioId: 'scenario-2',
          scenarioName: 'Email Notification Workflow',
          status: 'success',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          message: 'Email notification sent'
        },
        {
          id: 'execution-3',
          scenarioId: 'scenario-1',
          scenarioName: 'Lead Processing Workflow',
          status: 'error',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          message: 'Failed to process lead data: Invalid email format'
        }
      ];
    } catch (error) {
      console.error('Error getting Make.com execution logs:', error);
      throw error;
    }
  }
  
  /**
   * Trigger a webhook in Make.com
   */
  async triggerWebhook(payload: any): Promise<boolean> {
    if (!this.isInitialized()) {
      throw new Error('Make.com integration not initialized');
    }
    
    try {
      // Send the payload to the webhook URL
      const response = await fetch(this.webhookUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error triggering Make.com webhook:', error);
      throw error;
    }
  }
  
  /**
   * Trigger a scenario in Make.com
   */
  async triggerScenario(scenarioId: string): Promise<boolean> {
    if (!this.isInitialized() || !this.apiKey) {
      throw new Error('Make.com integration not initialized or API key not provided');
    }
    
    try {
      // In a real implementation, this would call the Make.com API
      // For demo, we'll simulate a successful response
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Error triggering Make.com scenario:', error);
      throw error;
    }
  }
}

export const makeIntegration = MakeIntegration.getInstance();