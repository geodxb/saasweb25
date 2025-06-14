import { userApiKeyOperations } from '@/lib/userApiKeys';
import { toast } from 'sonner';
import { getCurrentUserId } from '@/lib/firestore';

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  url: string;
  lastRun?: string;
}

export interface N8nWebhook {
  id: string;
  name: string;
  url: string;
  active: boolean;
  workflowId: string;
  workflowUrl: string;
}

export class N8nIntegration {
  private static instance: N8nIntegration;
  private webhookUrl: string | null = null;
  private apiKey: string | null = null;
  private baseUrl: string | null = null;
  
  static getInstance(): N8nIntegration {
    if (!N8nIntegration.instance) {
      N8nIntegration.instance = new N8nIntegration();
    }
    return N8nIntegration.instance;
  }
  
  /**
   * Initialize the n8n integration
   */
  async initialize(): Promise<boolean> {
    try {
      const userKeys = await userApiKeyOperations.getUserApiKeys();
      
      if (!userKeys?.n8nWebhookUrl) {
        return false;
      }
      
      this.webhookUrl = userKeys.n8nWebhookUrl;
      this.apiKey = userKeys.n8nApiKey || null;
      
      // Extract base URL from webhook URL
      try {
        const url = new URL(this.webhookUrl);
        this.baseUrl = `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}`;
      } catch (e) {
        console.warn('Could not parse n8n webhook URL:', e);
        this.baseUrl = null;
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing n8n integration:', error);
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
   * Get the base URL
   */
  getBaseUrl(): string | null {
    return this.baseUrl;
  }
  
  /**
   * Get workflows from n8n
   */
  async getWorkflows(): Promise<N8nWorkflow[]> {
    if (!this.isInitialized()) {
      throw new Error('n8n integration not initialized');
    }
    
    try {
      // In a real implementation, this would call the n8n API
      // For demo, we'll return mock data
      return [
        {
          id: 'workflow-1',
          name: 'Lead Processing Workflow',
          active: true,
          url: `${this.baseUrl || 'https://n8n.example.com'}/workflow/1`,
          lastRun: new Date().toISOString()
        },
        {
          id: 'workflow-2',
          name: 'Email Notification Workflow',
          active: true,
          url: `${this.baseUrl || 'https://n8n.example.com'}/workflow/2`,
          lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'workflow-3',
          name: 'Data Backup Workflow',
          active: false,
          url: `${this.baseUrl || 'https://n8n.example.com'}/workflow/3`
        }
      ];
    } catch (error) {
      console.error('Error getting n8n workflows:', error);
      throw error;
    }
  }
  
  /**
   * Get webhooks from n8n
   */
  async getWebhooks(): Promise<N8nWebhook[]> {
    if (!this.isInitialized()) {
      throw new Error('n8n integration not initialized');
    }
    
    try {
      // In a real implementation, this would call the n8n API
      // For demo, we'll return mock data
      return [
        {
          id: 'webhook-1',
          name: 'Lead Created Webhook',
          url: this.webhookUrl || 'https://n8n.example.com/webhook/1',
          active: true,
          workflowId: 'workflow-1',
          workflowUrl: `${this.baseUrl || 'https://n8n.example.com'}/workflow/1`
        },
        {
          id: 'webhook-2',
          name: 'Client Converted Webhook',
          url: 'https://n8n.example.com/webhook/2',
          active: true,
          workflowId: 'workflow-2',
          workflowUrl: `${this.baseUrl || 'https://n8n.example.com'}/workflow/2`
        }
      ];
    } catch (error) {
      console.error('Error getting n8n webhooks:', error);
      throw error;
    }
  }
  
  /**
   * Get execution logs from n8n
   */
  async getExecutionLogs(): Promise<any[]> {
    if (!this.isInitialized()) {
      throw new Error('n8n integration not initialized');
    }
    
    try {
      // In a real implementation, this would call the n8n API
      // For demo, we'll return mock data
      return [
        {
          id: 'execution-1',
          workflowId: 'workflow-1',
          workflowName: 'Lead Processing Workflow',
          status: 'success',
          timestamp: new Date().toISOString(),
          message: 'Successfully processed lead data'
        },
        {
          id: 'execution-2',
          workflowId: 'workflow-2',
          workflowName: 'Email Notification Workflow',
          status: 'success',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          message: 'Email notification sent'
        },
        {
          id: 'execution-3',
          workflowId: 'workflow-1',
          workflowName: 'Lead Processing Workflow',
          status: 'error',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          message: 'Failed to process lead data: Invalid email format'
        }
      ];
    } catch (error) {
      console.error('Error getting n8n execution logs:', error);
      throw error;
    }
  }
  
  /**
   * Trigger a webhook in n8n
   */
  async triggerWebhook(payload: any): Promise<boolean> {
    if (!this.isInitialized()) {
      throw new Error('n8n integration not initialized');
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
      console.error('Error triggering n8n webhook:', error);
      throw error;
    }
  }
  
  /**
   * Trigger a workflow in n8n
   */
  async triggerWorkflow(workflowId: string): Promise<boolean> {
    if (!this.isInitialized() || !this.apiKey) {
      throw new Error('n8n integration not initialized or API key not provided');
    }
    
    try {
      // In a real implementation, this would call the n8n API
      // For demo, we'll simulate a successful response
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Error triggering n8n workflow:', error);
      throw error;
    }
  }
}

export const n8nIntegration = N8nIntegration.getInstance();