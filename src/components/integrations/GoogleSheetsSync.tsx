import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Table,
  RefreshCw,
  Download,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { googleSheetsService } from '@/lib/integrations/googleSheets';
import { leadOperations, Lead } from '@/lib/firestore';
import { useAuth } from '@/hooks/useAuth';

export default function GoogleSheetsSync() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [sheetsRowCount, setSheetsRowCount] = useState(0);
  const [usageStats, setUsageStats] = useState({ imports: 0, exports: 0 });

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      // Try to get records to test connection
      const records = await googleSheetsService.getRecords({ maxRows: 1 });
      setIsConnected(true);
      
      // Get record count
      const allRecords = await googleSheetsService.getRecords();
      setSheetsRowCount(allRecords.length);
      
      // Set last synced time from localStorage
      const lastSyncedTime = localStorage.getItem('google_sheets_last_synced');
      if (lastSyncedTime) {
        setLastSynced(new Date(lastSyncedTime));
      }

      // Get usage stats
      if (user) {
        const stats = await googleSheetsService.getUsageStats(user.uid);
        setUsageStats(stats);
      }
    } catch (error) {
      console.error('Error checking Google Sheets connection:', error);
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
    
    setIsSyncing(true);
    
    try {
      // Import leads from Google Sheets
      const importCount = await googleSheetsService.importLeadsToLocafyr(user.uid);
      
      if (importCount === 0) {
        toast.info('No records found in Google Sheets');
        return;
      }
      
      // Update last synced time
      const now = new Date();
      setLastSynced(now);
      localStorage.setItem('google_sheets_last_synced', now.toISOString());
      
      // Refresh usage stats
      const stats = await googleSheetsService.getUsageStats(user.uid);
      setUsageStats(stats);
      
      toast.success(`Imported ${importCount} leads from Google Sheets`);
    } catch (error) {
      console.error('Error importing leads from Google Sheets:', error);
      toast.error('Failed to import leads from Google Sheets');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportLeads = async () => {
    if (!user) {
      toast.error('You must be logged in to export leads');
      return;
    }
    
    setIsSyncing(true);
    
    try {
      // Get leads from Firestore
      const leads = await leadOperations.getLeads(user.uid);
      
      if (leads.length === 0) {
        toast.info('No leads to export');
        return;
      }
      
      // Export leads to Google Sheets
      const exportCount = await googleSheetsService.exportLeadsToGoogleSheets(user.uid, leads);
      
      // Update last synced time
      const now = new Date();
      setLastSynced(now);
      localStorage.setItem('google_sheets_last_synced', now.toISOString());
      
      // Refresh usage stats
      const stats = await googleSheetsService.getUsageStats(user.uid);
      setUsageStats(stats);
      
      toast.success(`Exported ${exportCount} leads to Google Sheets`);
    } catch (error) {
      console.error('Error exporting leads to Google Sheets:', error);
      toast.error('Failed to export leads to Google Sheets');
    } finally {
      setIsSyncing(false);
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
              <h3 className="font-medium text-lg">Google Sheets Not Connected</h3>
              <p className="text-gray-600 mt-1">
                Please configure your Google Sheets API key in the Integrations settings to use this feature.
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
              <div className="p-2 bg-green-100 rounded-lg">
                <Table className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Google Sheets Sync</CardTitle>
                <CardDescription>Sync leads between Locafyr and Google Sheets</CardDescription>
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
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <BarChart3 className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-800">Usage Statistics</h3>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-green-700">Imports: <span className="font-medium">{usageStats.imports}</span></p>
                    <p className="text-xs text-green-600">Leads imported from Google Sheets</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Exports: <span className="font-medium">{usageStats.exports}</span></p>
                    <p className="text-xs text-green-600">Leads exported to Google Sheets</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 border rounded-lg">
            <div>
              <p className="font-medium">Google Sheets Records</p>
              <p className="text-sm text-gray-600">{sheetsRowCount} rows found</p>
            </div>
            {lastSynced && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Last synced:</p>
                <p className="text-sm font-medium">{lastSynced.toLocaleString()}</p>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleImportLeads}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Import from Google Sheets
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleExportLeads}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Export to Google Sheets
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={checkConnection}
              disabled={isSyncing}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">About Google Sheets Sync</p>
                <p className="text-xs text-blue-700 mt-1">
                  When importing, leads from Google Sheets will be added to your Locafyr account. 
                  When exporting, your Locafyr leads will be sent to Google Sheets. 
                  Existing records will be updated rather than duplicated.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}