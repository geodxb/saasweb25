import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { checkIntegrationsSetup } from '@/lib/integrations';
import IntegrationDashboard from '@/components/integrations/IntegrationDashboard';
import IntegrationFeatures from '@/components/integrations/IntegrationFeatures';
import GoBackButton from '@/components/common/GoBackButton';

export default function Integrations() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const integrationType = searchParams.get('type') || 'dashboard';
  const integrationId = searchParams.get('id') || '';
  
  const [isLoading, setIsLoading] = useState(true);
  const [integrationsStatus, setIntegrationsStatus] = useState({
    airtable: false,
    calendly: false,
    googleSheets: false,
    googleCalendar: false
  });

  useEffect(() => {
    checkIntegrations();
  }, []);

  const checkIntegrations = async () => {
    setIsLoading(true);
    try {
      const status = await checkIntegrationsSetup();
      setIntegrationsStatus(status);
    } catch (error) {
      console.error('Error checking integrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
          <p className="text-gray-600 mt-1">Connect and use external services with Locafyr</p>
        </div>
        <Button 
          variant="outline"
          onClick={() => navigate('/settings?tab=integrations')}
        >
          <Settings className="w-4 h-4 mr-2" />
          Configure Integrations
        </Button>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {integrationType === 'dashboard' && (
          <IntegrationDashboard />
        )}

        {integrationType === 'spreadsheets' && integrationId && (
          <IntegrationFeatures 
            integrationType="spreadsheets"
            integrationId={integrationId}
          />
        )}

        {integrationType === 'calendar' && integrationId && (
          <IntegrationFeatures 
            integrationType="calendar"
            integrationId={integrationId}
          />
        )}

        {/* If no valid integration type or ID is provided */}
        {(integrationType !== 'dashboard' && 
          integrationType !== 'spreadsheets' && 
          integrationType !== 'calendar') && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto text-gray-300 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Integration Not Found</h3>
              <p className="text-gray-600 mb-6">
                The integration you're looking for doesn't exist or is not properly configured.
              </p>
              <Button onClick={() => navigate('/integrations')}>
                View All Integrations
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}