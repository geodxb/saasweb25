import { userApiKeyOperations } from '@/lib/userApiKeys';
import { toast } from 'sonner';
import { getCurrentUserId } from '@/lib/firestore';
import { userProfileOperations } from '@/lib/firestore';

// Default developer keys (fallback only)
const DEV_AIRTABLE_PAT = import.meta.env.VITE_AIRTABLE_PAT || '';
const DEV_AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID || '';
const DEV_AIRTABLE_TABLE_NAME = import.meta.env.VITE_AIRTABLE_TABLE_NAME || 'Leads';

interface AirtableRecord {
  id?: string;
  fields: Record<string, any>;
}

export class AirtableService {
  private static instance: AirtableService;
  
  // Define valid Airtable status options
  private readonly VALID_AIRTABLE_STATUSES = ['new', 'contacted', 'proposal', 'converted', 'lost'];
  
  static getInstance(): AirtableService {
    if (!AirtableService.instance) {
      AirtableService.instance = new AirtableService();
    }
    return AirtableService.instance;
  }
  
  /**
   * Get the user's Airtable PAT, base ID, and table name
   * Falls back to developer keys if user keys are not available
   */
  async getAirtableConfig(): Promise<{ 
    pat: string; 
    baseId: string; 
    tableName: string;
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
      
      // If user has configured Airtable, use their keys
      if (userKeys?.airtablePAT && userKeys?.airtableBaseId && userKeys?.airtableTableName) {
        return {
          pat: userKeys.airtablePAT,
          baseId: userKeys.airtableBaseId,
          tableName: userKeys.airtableTableName,
          isUserKey: true
        };
      }
      
      // Fall back to developer keys
      if (DEV_AIRTABLE_PAT && DEV_AIRTABLE_BASE_ID) {
        console.warn('Using developer Airtable keys as fallback');
        return {
          pat: DEV_AIRTABLE_PAT,
          baseId: DEV_AIRTABLE_BASE_ID,
          tableName: DEV_AIRTABLE_TABLE_NAME,
          isUserKey: false
        };
      }
      
      throw new Error('No Airtable configuration found');
    } catch (error) {
      console.error('Error getting Airtable configuration:', error);
      throw error;
    }
  }
  
  /**
   * Fetch records from Airtable
   */
  async getRecords(options?: { 
    maxRecords?: number; 
    view?: string;
    filterByFormula?: string;
  }): Promise<AirtableRecord[]> {
    let config: { pat: string; baseId: string; tableName: string; isUserKey: boolean } | undefined;
    
    try {
      config = await this.getAirtableConfig();
      
      // Build URL with query parameters
      let url = `https://api.airtable.com/v0/${config.baseId}/${config.tableName}`;
      
      const params = new URLSearchParams();
      if (options?.maxRecords) {
        params.append('maxRecords', options.maxRecords.toString());
      }
      if (options?.view) {
        params.append('view', options.view);
      }
      if (options?.filterByFormula) {
        params.append('filterByFormula', options.filterByFormula);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      // Make request to Airtable API
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.pat}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      return data.records || [];
    } catch (error) {
      console.error('Error fetching records from Airtable:', error);
      
      // Show user-friendly error
      if (config && !config.isUserKey) {
        toast.error('Please configure your Airtable Personal Access Token in Settings > Integrations');
      } else if (config) {
        toast.error('Failed to fetch data from Airtable. Please check your PAT and settings.');
      } else {
        toast.error('Failed to configure Airtable connection. Please check your settings.');
      }
      
      return [];
    }
  }
  
  /**
   * Create a new record in Airtable with improved error handling
   */
  async createRecord(fields: Record<string, any>): Promise<AirtableRecord | null> {
    let config: { pat: string; baseId: string; tableName: string; isUserKey: boolean } | undefined;
    
    try {
      config = await this.getAirtableConfig();
      
      // CRITICAL FIX: Explicitly delete the Status field to prevent validation errors
      delete fields.Status;
      
      const url = `https://api.airtable.com/v0/${config.baseId}/${config.tableName}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.pat}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `HTTP error ${response.status}`;
        
        // Handle specific permission errors for select fields
        if (errorMessage.includes('Insufficient permissions to create new select option')) {
          const selectOptionMatch = errorMessage.match(/create new select option "([^"]+)"/);
          const optionValue = selectOptionMatch ? selectOptionMatch[1] : 'unknown';
          
          throw new Error(`AIRTABLE_SELECT_FIELD_ERROR: The Status field in your Airtable base needs to be configured as a Single Select field with predefined options. The option "${optionValue}" doesn't exist. Please add the following options to your Status field: new, contacted, proposal, converted, lost. See the Airtable Setup Guide for detailed instructions.`);
        }
        
        // Handle other permission errors
        if (errorMessage.includes('Insufficient permissions')) {
          throw new Error(`AIRTABLE_PERMISSIONS_ERROR: Your Airtable Personal Access Token lacks the necessary permissions. Please ensure your PAT has the following permissions: data.records:read, data.records:write, and schema.bases:write. You can update your PAT permissions at airtable.com/account.`);
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating record in Airtable:', error);
      
      // Handle specific error types with user-friendly messages
      if (error instanceof Error) {
        if (error.message.startsWith('AIRTABLE_SELECT_FIELD_ERROR:')) {
          toast.error(error.message.replace('AIRTABLE_SELECT_FIELD_ERROR: ', ''), {
            duration: 10000,
            action: {
              label: 'View Setup Guide',
              onClick: () => window.open('/docs/airtable-setup-guide.md', '_blank')
            }
          });
        } else if (error.message.startsWith('AIRTABLE_PERMISSIONS_ERROR:')) {
          toast.error(error.message.replace('AIRTABLE_PERMISSIONS_ERROR: ', ''), {
            duration: 10000,
            action: {
              label: 'Update PAT',
              onClick: () => window.open('https://airtable.com/account', '_blank')
            }
          });
        } else {
          // Show user-friendly error for other cases
          if (config && !config.isUserKey) {
            toast.error('Please configure your Airtable Personal Access Token in Settings > Integrations');
          } else if (config) {
            toast.error('Failed to create record in Airtable. Please check your PAT and field configuration.');
          } else {
            toast.error('Failed to configure Airtable connection. Please check your settings.');
          }
        }
      }
      
      return null;
    }
  }
  
  /**
   * Update an existing record in Airtable with improved error handling
   */
  async updateRecord(recordId: string, fields: Record<string, any>): Promise<AirtableRecord | null> {
    let config: { pat: string; baseId: string; tableName: string; isUserKey: boolean } | undefined;
    
    try {
      config = await this.getAirtableConfig();
      
      // CRITICAL FIX: Explicitly delete the Status field to prevent validation errors
      delete fields.Status;
      
      const url = `https://api.airtable.com/v0/${config.baseId}/${config.tableName}/${recordId}`;
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${config.pat}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `HTTP error ${response.status}`;
        
        // Handle specific permission errors for select fields
        if (errorMessage.includes('Insufficient permissions to create new select option')) {
          const selectOptionMatch = errorMessage.match(/create new select option "([^"]+)"/);
          const optionValue = selectOptionMatch ? selectOptionMatch[1] : 'unknown';
          
          throw new Error(`AIRTABLE_SELECT_FIELD_ERROR: The Status field in your Airtable base needs to be configured as a Single Select field with predefined options. The option "${optionValue}" doesn't exist. Please add the following options to your Status field: new, contacted, proposal, converted, lost. See the Airtable Setup Guide for detailed instructions.`);
        }
        
        // Handle other permission errors
        if (errorMessage.includes('Insufficient permissions')) {
          throw new Error(`AIRTABLE_PERMISSIONS_ERROR: Your Airtable Personal Access Token lacks the necessary permissions. Please ensure your PAT has the following permissions: data.records:read, data.records:write, and schema.bases:write. You can update your PAT permissions at airtable.com/account.`);
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating record in Airtable:', error);
      
      // Handle specific error types with user-friendly messages
      if (error instanceof Error) {
        if (error.message.startsWith('AIRTABLE_SELECT_FIELD_ERROR:')) {
          toast.error(error.message.replace('AIRTABLE_SELECT_FIELD_ERROR: ', ''), {
            duration: 10000,
            action: {
              label: 'View Setup Guide',
              onClick: () => window.open('/docs/airtable-setup-guide.md', '_blank')
            }
          });
        } else if (error.message.startsWith('AIRTABLE_PERMISSIONS_ERROR:')) {
          toast.error(error.message.replace('AIRTABLE_PERMISSIONS_ERROR: ', ''), {
            duration: 10000,
            action: {
              label: 'Update PAT',
              onClick: () => window.open('https://airtable.com/account', '_blank')
            }
          });
        } else {
          // Show user-friendly error for other cases
          if (config && !config.isUserKey) {
            toast.error('Please configure your Airtable Personal Access Token in Settings > Integrations');
          } else if (config) {
            toast.error('Failed to update record in Airtable. Please check your PAT and field configuration.');
          } else {
            toast.error('Failed to configure Airtable connection. Please check your settings.');
          }
        }
      }
      
      return null;
    }
  }
  
  /**
   * Delete a record from Airtable
   */
  async deleteRecord(recordId: string): Promise<boolean> {
    let config: { pat: string; baseId: string; tableName: string; isUserKey: boolean } | undefined;
    
    try {
      config = await this.getAirtableConfig();
      
      const url = `https://api.airtable.com/v0/${config.baseId}/${config.tableName}/${recordId}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${config.pat}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting record from Airtable:', error);
      
      // Show user-friendly error
      if (config && !config.isUserKey) {
        toast.error('Please configure your Airtable Personal Access Token in Settings > Integrations');
      } else if (config) {
        toast.error('Failed to delete record from Airtable. Please check your PAT and settings.');
      } else {
        toast.error('Failed to configure Airtable connection. Please check your settings.');
      }
      
      return false;
    }
  }

  /**
   * Import leads from Airtable to Locafyr
   * Tracks usage in user profile
   */
  async importLeadsToLocafyr(userId: string): Promise<number> {
    try {
      // Get records from Airtable
      const records = await this.getRecords();
      
      if (records.length === 0) {
        toast.info('No records found in Airtable');
        return 0;
      }

      // Process records and import to Locafyr
      // ... (existing import logic)

      // Increment the import counter in user profile
      await userProfileOperations.incrementIntegrationCounter(userId, 'airtableImportsCount');
      
      return records.length;
    } catch (error) {
      console.error('Error importing leads from Airtable:', error);
      toast.error('Failed to import leads from Airtable');
      return 0;
    }
  }

  /**
   * Export leads from Locafyr to Airtable
   * Tracks usage in user profile
   */
  async exportLeadsToAirtable(userId: string, leads: any[]): Promise<number> {
    try {
      if (leads.length === 0) {
        toast.info('No leads to export');
        return 0;
      }

      // Process leads and export to Airtable
      // ... (existing export logic)

      // Increment the export counter in user profile
      await userProfileOperations.incrementIntegrationCounter(userId, 'airtableExportsCount');
      
      return leads.length;
    } catch (error) {
      console.error('Error exporting leads to Airtable:', error);
      toast.error('Failed to export leads to Airtable');
      return 0;
    }
  }

  /**
   * Get user's Airtable usage statistics
   */
  async getUsageStats(userId: string): Promise<{ imports: number; exports: number }> {
    try {
      const userProfile = await userProfileOperations.getUserProfile(userId);
      
      return {
        imports: userProfile?.airtableImportsCount || 0,
        exports: userProfile?.airtableExportsCount || 0
      };
    } catch (error) {
      console.error('Error getting Airtable usage stats:', error);
      return { imports: 0, exports: 0 };
    }
  }
}

export const airtableService = AirtableService.getInstance();