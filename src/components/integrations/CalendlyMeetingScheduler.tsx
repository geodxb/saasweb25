import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  RefreshCw,
  Link2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Copy,
  ExternalLink,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { calendlyService } from '@/lib/integrations/calendly';

interface CalendlyMeetingSchedulerProps {
  leadName?: string;
  leadEmail?: string;
  onSchedulingLinkGenerated?: (url: string) => void;
}

export default function CalendlyMeetingScheduler({ 
  leadName = '', 
  leadEmail = '',
  onSchedulingLinkGenerated
}: CalendlyMeetingSchedulerProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const [selectedEventType, setSelectedEventType] = useState('');
  const [name, setName] = useState(leadName);
  const [email, setEmail] = useState(leadEmail);
  const [schedulingLink, setSchedulingLink] = useState('');
  const [usageStats, setUsageStats] = useState({ linksGenerated: 0 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    setName(leadName);
    setEmail(leadEmail);
  }, [leadName, leadEmail]);

  const checkConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to get user profile to test connection
      const user = await calendlyService.getCurrentUser();
      setIsConnected(!!user);
      
      if (user) {
        // Get event types
        try {
          const events = await calendlyService.getEventTypes();
          setEventTypes(events);
          
          if (events.length > 0) {
            setSelectedEventType(events[0].uri);
          }
        } catch (eventError) {
          console.error('Error fetching Calendly event types:', eventError);
          setError('Failed to load Calendly event types. Please check your API key.');
        }

        // Get usage stats
        const userId = localStorage.getItem('userId');
        if (userId) {
          try {
            const stats = await calendlyService.getUsageStats(userId);
            setUsageStats(stats);
          } catch (statsError) {
            console.error('Error fetching Calendly usage stats:', statsError);
            // Non-critical error, don't set error state
          }
        }
      }
    } catch (error) {
      console.error('Error checking Calendly connection:', error);
      setError('Failed to connect to Calendly. Please check your API key.');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    if (!selectedEventType || !name || !email) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const link = await calendlyService.createSingleUseLink(
        selectedEventType,
        name,
        email
      );
      
      if (link) {
        setSchedulingLink(link);
        
        if (onSchedulingLinkGenerated) {
          onSchedulingLinkGenerated(link);
        }
        
        toast.success('Scheduling link generated successfully');

        // Refresh usage stats
        const userId = localStorage.getItem('userId');
        if (userId) {
          try {
            const stats = await calendlyService.getUsageStats(userId);
            setUsageStats(stats);
          } catch (error) {
            console.error('Error refreshing usage stats:', error);
          }
        }
      } else {
        setError('Failed to generate scheduling link');
        toast.error('Failed to generate scheduling link');
      }
    } catch (error) {
      console.error('Error generating Calendly link:', error);
      setError('Failed to generate scheduling link. Please try again.');
      toast.error('Failed to generate scheduling link');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(schedulingLink);
    toast.success('Link copied to clipboard');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-lg">Error Loading Calendly</h3>
              <p className="text-gray-600 mt-1">{error}</p>
              <Button 
                className="mt-4" 
                variant="outline"
                onClick={checkConnection}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
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
              <h3 className="font-medium text-lg">Calendly Not Connected</h3>
              <p className="text-gray-600 mt-1">
                Please configure your Calendly API key in the Integrations settings to use this feature.
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
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Schedule Meeting</CardTitle>
                <CardDescription>Create a Calendly scheduling link</CardDescription>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">
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
                <p className="text-sm text-green-700 mt-1">
                  Links Generated: <span className="font-medium">{usageStats.linksGenerated}</span>
                </p>
                <p className="text-xs text-green-600">
                  Total number of scheduling links created
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type</Label>
              <Select 
                value={selectedEventType} 
                onValueChange={setSelectedEventType}
              >
                <SelectTrigger id="eventType">
                  <SelectValue placeholder="Select an event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.length > 0 ? (
                    eventTypes.map((event) => (
                      <SelectItem key={event.uri} value={event.uri}>
                        {event.name} ({event.duration} min)
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-events" disabled>
                      No event types found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Invitee Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Invitee Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
            </div>
            
            <Button 
              className="w-full"
              onClick={handleGenerateLink}
              disabled={isGenerating || !selectedEventType || !name || !email}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Link...
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4 mr-2" />
                  Generate Scheduling Link
                </>
              )}
            </Button>
          </div>
          
          {schedulingLink && (
            <div className="mt-4 p-4 bg-gray-50 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Scheduling Link</h3>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={copyLink}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => window.open(schedulingLink, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Input value={schedulingLink} readOnly className="text-sm" />
                <Button variant="outline" size="sm" onClick={copyLink}>
                  Copy
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              size="sm"
              onClick={checkConnection}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}