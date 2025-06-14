import { Card, CardContent } from '@/components/ui/card';

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
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <p className="text-gray-600">
          Google Calendar integration is currently unavailable.
        </p>
      </CardContent>
    </Card>
  );
}