import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { Lead } from '@/lib/firestore';
import { useNavigate } from 'react-router-dom';

interface LeadIntegrationsProps {
  lead: Lead;
}

export default function LeadIntegrations({ lead }: LeadIntegrationsProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
        <CardDescription>Connect with external services</CardDescription>
      </CardHeader>
      <CardContent className="text-center py-6">
        <p className="text-gray-600 mb-4">
          Integrations are currently unavailable. They will be set up in a future update.
        </p>
        <Button 
          variant="outline"
          onClick={() => navigate('/settings')}
        >
          <Settings className="w-4 h-4 mr-2" />
          Go to Settings
        </Button>
      </CardContent>
    </Card>
  );
}