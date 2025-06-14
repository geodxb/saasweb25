import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  RefreshCw,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Zap,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { airtableService } from '@/lib/integrations/airtable';
import { leadOperations, Lead } from '@/lib/firestore';
import { useAuth } from '@/hooks/useAuth';

export default function AirtableLeadSync() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [airtableRecordCount, setAirtableRecordCount] = useState(0);
  const [usageStats, setUsageStats] = useState({ imports: 0 });

  // Valid Airtable status options
  const VALID_AIRTABLE_STATUSES = ['new', 'contacted', 'proposal', 'converted', 'lost'];

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      // Try to get records to test connection
      const records = await airtableService.getRecords({ maxRecords: 1 });
      setIsConnected(true);
      
      // Get record count
      const allRecords = await airtableService.getRecords();
      setAirtableRecordCount(allRecords.length);
      
      // Set last synced time from localStorage
      const lastSyncedTime = localStorage.getItem('airtable_last_synced');
      if (lastSyncedTime) {
        setLastSynced(new Date(lastSyncedTime));
      }

      // Get usage stats
      if (user) {
        const stats = await airtableService.getUsageStats(user.uid);
        setUsageStats(stats);
      }
    } catch (error) {
      console.error('Error checking Airtable connection:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportLeads = async () => {
    if (!user) {
      toast.error('You must be logged in to import leads');
      return;
    }
    
    setIsImporting(true);
    
    try {
      // Get records from Airtable
      const records = await airtableService.getRecords();
      
      if (records.length === 0) {
        toast.info('No records found in Airtable');
        return;
      }
      
      // Convert Airtable records to leads
      const leads: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>[] = records.map(record => {
        const fields = record.fields;
        
        return {
          name: fields.Name || 'Unknown',
          email: fields.Email || `unknown-${Date.now()}@example.com`,
          phone: fields.Phone || '',
          company: fields.Company || '',
          source: 'airtable',
          status: 'new',
          tags: ['airtable-import', ...(fields.Tags ? fields.Tags.split(',').map((t: string) => t.trim()) : [])],
          ownerId: user.uid,
          assignedTo: user.uid,
          priority: 'medium',
          industry: fields.Industry || '',
          notes: fields.Notes || '',
          customFields: {
            airtableId: record.id,
            ...Object.entries(fields)
              .filter(([key]) => !['Name', 'Email', 'Phone', 'Company', 'Tags', 'Industry', 'Notes'].includes(key))
              .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
          }
        };
      });
      
      // Import leads to Firestore
      const leadIds = await leadOperations.importLeads(leads);
      
      // Update last synced time
      const now = new Date();
      setLastSynced(now);
      localStorage.setItem('airtable_last_synced', now.toISOString());
      
      // Track import in user profile
      await airtableService.importLeadsToLocafyr(user.uid);
      
      // Refresh usage stats
      const stats = await airtableService.getUsageStats(user.uid);
      setUsageStats(stats);
      
      toast.success(`Imported ${leadIds.length} leads from Airtable`);
    } catch (error) {
      console.error('Error importing leads from Airtable:', error);
      toast.error('Failed to import leads from Airtable');
    } finally {
      setIsImporting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-lg">Airtable Not Connected</h3>
              <p className="text-gray-600 mt-1">
                Please configure your Airtable Personal Access Token in the Integrations settings to use this feature.
              </p>
              <Button 
                className="mt-4" 
                variant="outline"
                onClick={() => window.location.href = '/settings?tab=integrations'}
              >
                Go to Integration Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Airtable Lead Import</CardTitle>
                <CardDescription>Import leads from Airtable to Locafyr</CardDescription>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className="bg-green-100 text-green-800"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Usage Stats */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-800">Usage Statistics</h3>
                <div className="mt-2">
                  <p className="text-sm text-blue-700">Imports: <span className="font-medium">{usageStats.imports}</span></p>
                  <p className="text-xs text-blue-600">Leads imported from Airtable</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 border rounded-lg">
            <div>
              <p className="font-medium">Airtable Records</p>
              <p className="text-sm text-gray-600">{airtableRecordCount} records found</p>
            </div>
            {lastSynced && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Last imported:</p>
                <p className="text-sm font-medium">{lastSynced.toLocaleString()}</p>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleImportLeads}
              disabled={isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Import from Airtable
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={checkConnection}
              disabled={isImporting}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">About Airtable Import</p>
                <p className="text-xs text-blue-700 mt-1">
                  Import leads from Airtable to your Locafyr account. The following fields will be imported:
                  company name, name, email, website, phone number, industry, and notes.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">Import Configuration</p>
                <p className="text-xs text-green-700 mt-1">
                  For compatibility, we import these fields: Name, Email, Phone, Company, Industry, Notes, and Tags.
                  Status values are automatically validated and normalized to match Airtable's predefined options (new, contacted, proposal, converted, lost).
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}