import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Database,
  Calendar,
  Table,
  CalendarDays,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

interface IntegrationUsageStatsProps {
  className?: string;
}

export default function IntegrationUsageStats({ className = '' }: IntegrationUsageStatsProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Simulate loading
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, [user]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5" />
          <span>Connected Integrations</span>
        </CardTitle>
        <CardDescription>
          Your active integrations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Airtable</p>
              <p className="text-xs text-gray-500">Connected</p>
            </div>
          </div>
          
          <div className="border rounded-lg p-4 flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium">Calendly</p>
              <p className="text-xs text-gray-500">Connected</p>
            </div>
          </div>
          
          <div className="border rounded-lg p-4 flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarDays className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Google Calendar</p>
              <p className="text-xs text-gray-500">Connected</p>
            </div>
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>Configure more integrations in <a href="/integrations-page" className="text-blue-600 hover:underline">Integrations settings</a></p>
        </div>
      </CardContent>
    </Card>
  );
}