import { useState } from 'react';
import {
  Zap,
  Edit,
  CheckCircle,
  FileText,
  Calendar,
  Mail,
  AlertCircle,
  Info
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AutomationTrigger } from '@/types/automation';

interface TriggerConfigProps {
  trigger: AutomationTrigger;
  onUpdate: (trigger: AutomationTrigger) => void;
  error?: string;
}

export default function TriggerConfig({ trigger, onUpdate, error }: TriggerConfigProps) {
  const handleTriggerTypeChange = (type: string) => {
    onUpdate({
      type: type as AutomationTrigger['type'],
      config: {}
    });
  };

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'new_lead':
        return <Zap className="w-5 h-5 text-blue-600" />;
      case 'lead_updated':
        return <Edit className="w-5 h-5 text-orange-600" />;
      case 'lead_converted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'form_submitted':
        return <FileText className="w-5 h-5 text-purple-600" />;
      case 'payment_received':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'email_opened':
      case 'email_clicked':
        return <Mail className="w-5 h-5 text-red-600" />;
      case 'scheduled_trigger':
        return <Calendar className="w-5 h-5 text-indigo-600" />;
      default:
        return <Zap className="w-5 h-5 text-gray-600" />;
    }
  };

  const renderTriggerConfig = () => {
    switch (trigger.type) {
      case 'scheduled_trigger':
        return (
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="schedule">Schedule</Label>
              <Select 
                value={trigger.config.schedule || 'daily'} 
                onValueChange={(value) => onUpdate({
                  ...trigger,
                  config: { ...trigger.config, schedule: value }
                })}
              >
                <SelectTrigger id="schedule">
                  <SelectValue placeholder="Select schedule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {trigger.config.schedule === 'weekly' && (
              <div className="space-y-2">
                <Label htmlFor="day">Day of Week</Label>
                <Select 
                  value={trigger.config.day || 'monday'} 
                  onValueChange={(value) => onUpdate({
                    ...trigger,
                    config: { ...trigger.config, day: value }
                  })}
                >
                  <SelectTrigger id="day">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                    <SelectItem value="saturday">Saturday</SelectItem>
                    <SelectItem value="sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {trigger.config.schedule === 'monthly' && (
              <div className="space-y-2">
                <Label htmlFor="date">Day of Month</Label>
                <Input
                  id="date"
                  type="number"
                  min="1"
                  max="31"
                  value={trigger.config.date || '1'}
                  onChange={(e) => onUpdate({
                    ...trigger,
                    config: { ...trigger.config, date: e.target.value }
                  })}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={trigger.config.time || '09:00'}
                onChange={(e) => onUpdate({
                  ...trigger,
                  config: { ...trigger.config, time: e.target.value }
                })}
              />
            </div>
          </div>
        );
      
      case 'form_submitted':
        return (
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="formId">Form</Label>
              <Select 
                value={trigger.config.formId || ''} 
                onValueChange={(value) => onUpdate({
                  ...trigger,
                  config: { ...trigger.config, formId: value }
                })}
              >
                <SelectTrigger id="formId">
                  <SelectValue placeholder="Select form" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contact-form">Contact Form</SelectItem>
                  <SelectItem value="lead-form">Lead Capture Form</SelectItem>
                  <SelectItem value="quote-request">Quote Request Form</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      // For other trigger types, no additional configuration is needed
      default:
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">About this trigger</p>
                <p className="text-sm text-blue-700 mt-1">
                  {getTriggerDescription(trigger.type)}
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="triggerType">Trigger Type</Label>
        <Select value={trigger.type} onValueChange={handleTriggerTypeChange}>
          <SelectTrigger id="triggerType" className={error ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select a trigger" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new_lead">New Lead Created</SelectItem>
            <SelectItem value="lead_updated">Lead Updated</SelectItem>
            <SelectItem value="lead_converted">Lead Converted</SelectItem>
            <SelectItem value="form_submitted">Form Submitted</SelectItem>
            <SelectItem value="payment_received">Payment Received</SelectItem>
            <SelectItem value="email_opened">Email Opened</SelectItem>
            <SelectItem value="email_clicked">Email Link Clicked</SelectItem>
            <SelectItem value="scheduled_trigger">Scheduled Trigger</SelectItem>
          </SelectContent>
        </Select>
        {error && (
          <p className="text-sm text-red-500 flex items-center mt-1">
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </p>
        )}
      </div>

      {trigger.type && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              {getTriggerIcon(trigger.type)}
              <div>
                <h3 className="font-medium">{formatTriggerType(trigger.type)}</h3>
                <p className="text-sm text-gray-600">{getTriggerDescription(trigger.type)}</p>
              </div>
            </div>
            
            {renderTriggerConfig()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function formatTriggerType(type: string): string {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function getTriggerDescription(type: string): string {
  switch (type) {
    case 'new_lead':
      return 'This automation will run whenever a new lead is created in your account.';
    case 'lead_updated':
      return 'This automation will run whenever a lead is updated in your account.';
    case 'lead_converted':
      return 'This automation will run whenever a lead is converted to a client.';
    case 'form_submitted':
      return 'This automation will run whenever someone submits one of your forms.';
    case 'payment_received':
      return 'This automation will run whenever a payment is received.';
    case 'email_opened':
      return 'This automation will run whenever a lead opens an email you sent them.';
    case 'email_clicked':
      return 'This automation will run whenever a lead clicks a link in an email you sent them.';
    case 'scheduled_trigger':
      return 'This automation will run on a schedule you define (hourly, daily, weekly, or monthly).';
    default:
      return 'Configure when this automation should run.';
  }
}