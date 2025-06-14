import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings,
  ArrowLeft,
  Mail,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import GmailIntegrationSettings from '@/components/settings/GmailIntegrationSettings';
import GoBackButton from '@/components/common/GoBackButton';
import { useNavigate } from 'react-router-dom';

export default function IntegrationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [gmailStatus, setGmailStatus] = useState(false);

  useEffect(() => {
    if (user) {
      loadIntegrationSettings();
    }
  }, [user]);

  const loadIntegrationSettings = async () => {
    setIsLoading(true);
    try {
      // Check Gmail status
      const status = await checkGmailStatus();
      setGmailStatus(status);
    } catch (error) {
      console.error('Error loading integration settings:', error);
      toast.error('Failed to load integration settings');
    } finally {
      setIsLoading(false);
    }
  };

  const checkGmailStatus = async () => {
    try {
      // Import dynamically to avoid circular dependencies
      const { gmailService } = await import('@/lib/gmail');
      
      // Check Gmail API status
      const status = await gmailService.checkGmailStatus();
      return status.available;
    } catch (error) {
      console.error('Error checking Gmail status:', error);
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <GoBackButton />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600 mt-1">Connect and manage external services</p>
        </div>
        <Button 
          variant="outline"
          onClick={() => navigate('/settings')}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="space-y-6">
          {/* Gmail Integration */}
          <GmailIntegrationSettings />
          
          {/* Lead Scraper Information */}
          <Card>
            <CardHeader>
              <CardTitle>Google Maps Lead Scraper</CardTitle>
              <CardDescription>Find and collect business leads from Google Maps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">About Lead Scraper</p>
                    <p className="text-sm text-blue-700 mt-1">
                      The Google Maps Lead Scraper allows you to find and collect business leads directly from Google Maps.
                      You can search for businesses by keyword and location, then save them to your leads database.
                    </p>
                    <Button 
                      className="mt-4" 
                      onClick={() => navigate('/lead-scraper')}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Go to Lead Scraper
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={loadIntegrationSettings}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}