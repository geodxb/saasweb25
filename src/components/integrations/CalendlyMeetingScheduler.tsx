import { Card, CardContent } from '@/components/ui/card';

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
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <p className="text-gray-600">
          Calendly integration is currently unavailable.
        </p>
      </CardContent>
    </Card>
  );
}