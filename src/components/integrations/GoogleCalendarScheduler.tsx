import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  RefreshCw,
  Link2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { googleCalendarService } from '@/lib/integrations/googleCalendar';

interface GoogleCalendarSchedulerProps {
  leadName?: string;
  leadEmail?: string;
  onEventCreated?: (eventId: string) => void;
}

export default function GoogleCalendarScheduler({ 
  leadName = '', 
  leadEmail = '',
  onEventCreated
}: GoogleCalendarSchedulerProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [calendars, setCalendars] = useState<any[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState('');
  const [name, setName] = useState(leadName);
  const [email, setEmail] = useState(leadEmail);
  const [eventTitle, setEventTitle] = useState('Meeting with Client');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventDuration, setEventDuration] = useState('60');
  const [usageStats, setUsageStats] = useState({ eventsCreated: 0 });

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    setName(leadName);
    setEmail(leadEmail);
  }, [leadName, leadEmail]);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      // Try to get user profile to test connection
      const user = await googleCalendarService.getCurrentUser();
      setIsConnected(!!user);
      
      if (user) {
        // Get calendars
        const userCalendars = await googleCalendarService.getCalendars();
        setCalendars(userCalendars);
        
        if (userCalendars.length > 0) {
          setSelectedCalendar(userCalendars[0].id);
        }
      }

      // Get usage stats
      const userId = localStorage.getItem('userId');
      if (userId) {
        const stats = await googleCalendarService.getUsageStats(userId);
        setUsageStats(stats);
      }
    } catch (error) {
      console.error('Error checking Google Calendar connection:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!selectedCalendar || !name || !email || !eventTitle || !eventDate || !eventTime) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Format date and time for Google Calendar
      const startDateTime = new Date(`${eventDate}T${eventTime}`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(eventDuration) * 60000);
      
      const eventId = await googleCalendarService.createEvent(
        selectedCalendar,
        {
          summary: eventTitle,
          description: `Meeting with ${name} (${email})`,
          start: {
            dateTime: startDateTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          end: {
            dateTime: endDateTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          attendees: [
            { email, name }
          ]
        }
      );
      
      if (eventId && onEventCreated) {
        onEventCreated(eventId);
      }
      
      // Refresh usage stats
      const userId = localStorage.getItem('userId');
      if (userId) {
        const stats = await googleCalendarService.getUsageStats(userId);
        setUsageStats(stats);
      }
      
      // Clear form
      setEventTitle('Meeting with Client');
      setEventDate('');
      setEventTime('');
      
      toast.success('Calendar event created successfully');
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      toast.error('Failed to create calendar event');
    } finally {
      setIsCreating(false);
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
              <h3 className="font-medium text-lg">Google Calendar Not Connected</h3>
              <p className="text-gray-600 mt-1">
                Please configure your Google Calendar API key in the Integrations settings to use this feature.
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
                <CalendarDays className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Schedule Meeting</CardTitle>
                <CardDescription>Create a Google Calendar event</CardDescription>
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
                <p className="text-sm text-blue-700 mt-1">
                  Events Created: <span className="font-medium">{usageStats.eventsCreated}</span>
                </p>
                <p className="text-xs text-blue-600">
                  Total number of calendar events created
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="calendar">Calendar</Label>
              <Select 
                value={selectedCalendar} 
                onValueChange={setSelectedCalendar}
              >
                <SelectTrigger id="calendar">
                  <SelectValue placeholder="Select a calendar" />
                </SelectTrigger>
                <SelectContent>
                  {calendars.map((calendar) => (
                    <SelectItem key={calendar.id} value={calendar.id}>
                      {calendar.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Attendee Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Attendee Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="eventTitle">Event Title</Label>
              <Input
                id="eventTitle"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Meeting with Client"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventDate">Date</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventTime">Time</Label>
                <Input
                  id="eventTime"
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventDuration">Duration (minutes)</Label>
                <Select 
                  value={eventDuration} 
                  onValueChange={setEventDuration}
                >
                  <SelectTrigger id="eventDuration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              className="w-full"
              onClick={handleCreateEvent}
              disabled={isCreating || !selectedCalendar || !name || !email || !eventTitle || !eventDate || !eventTime}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Event...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Create Calendar Event
                </>
              )}
            </Button>
          </div>
          
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