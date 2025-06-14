import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import GoBackButton from '@/components/common/GoBackButton';
import GmailIntegrationSettings from '@/components/settings/GmailIntegrationSettings';

export default function Integrations() {
  const navigate = useNavigate();

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
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Google Maps Lead Scraper</h3>
              <p className="text-gray-600 mb-6">
                Find and collect business leads directly from Google Maps with our powerful lead scraper tool.
              </p>
              <Button onClick={() => navigate('/lead-scraper')}>
                Go to Lead Scraper
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}