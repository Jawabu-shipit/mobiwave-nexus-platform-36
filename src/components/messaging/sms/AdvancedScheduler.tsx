
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Repeat, Zap } from 'lucide-react';
import { useWorkflows } from '@/hooks/useWorkflows';
import { toast } from 'sonner';

interface ScheduleConfig {
  type: 'immediate' | 'scheduled' | 'recurring' | 'triggered';
  datetime?: string;
  repeatType?: 'daily' | 'weekly' | 'monthly' | 'custom';
  repeatInterval?: number;
  daysOfWeek?: number[];
  endDate?: string;
  maxOccurrences?: number;
  triggerType?: 'contact_added' | 'date_based' | 'event_based';
  triggerCondition?: any;
}

interface AdvancedSchedulerProps {
  onScheduleCreate: (config: ScheduleConfig) => void;
  recipients: any[];
  message: string;
}

export function AdvancedScheduler({ onScheduleCreate, recipients, message }: AdvancedSchedulerProps) {
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>({
    type: 'immediate'
  });
  const { createWorkflow } = useWorkflows();

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  const handleDayToggle = (day: number, checked: boolean) => {
    const currentDays = scheduleConfig.daysOfWeek || [];
    if (checked) {
      setScheduleConfig({
        ...scheduleConfig,
        daysOfWeek: [...currentDays, day].sort()
      });
    } else {
      setScheduleConfig({
        ...scheduleConfig,
        daysOfWeek: currentDays.filter(d => d !== day)
      });
    }
  };

  const handleCreateSchedule = async () => {
    try {
      if (scheduleConfig.type === 'triggered' || scheduleConfig.type === 'recurring') {
        // Create workflow for automated triggers
        await createWorkflow({
          name: `SMS Automation - ${new Date().toLocaleString()}`,
          description: `Automated SMS campaign with ${scheduleConfig.type} scheduling`,
          trigger_type: scheduleConfig.type === 'triggered' ? 'event_based' : 'time_based',
          trigger_config: {
            scheduleConfig,
            message,
            recipients: recipients.map(r => r.phone || r)
          },
          actions: [
            {
              type: 'send_sms',
              config: {
                message,
                recipients: recipients.map(r => r.phone || r),
                senderId: 'MOBIWAVE'
              }
            }
          ],
          is_active: true
        });
        
        toast.success('Automated SMS workflow created successfully!');
      } else {
        onScheduleCreate(scheduleConfig);
      }
    } catch (error: any) {
      toast.error(`Failed to create schedule: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Advanced Scheduling
          </CardTitle>
          <CardDescription>
            Set up immediate, scheduled, recurring, or triggered SMS campaigns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="scheduleType">Schedule Type</Label>
            <Select 
              value={scheduleConfig.type} 
              onValueChange={(value: any) => setScheduleConfig({ ...scheduleConfig, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Send Immediately</SelectItem>
                <SelectItem value="scheduled">Schedule Once</SelectItem>
                <SelectItem value="recurring">Recurring Schedule</SelectItem>
                <SelectItem value="triggered">Event Triggered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {scheduleConfig.type === 'scheduled' && (
            <div>
              <Label htmlFor="datetime">Date & Time</Label>
              <Input
                id="datetime"
                type="datetime-local"
                value={scheduleConfig.datetime || ''}
                onChange={(e) => setScheduleConfig({ ...scheduleConfig, datetime: e.target.value })}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          )}

          {scheduleConfig.type === 'recurring' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="repeatType">Repeat Type</Label>
                  <Select 
                    value={scheduleConfig.repeatType} 
                    onValueChange={(value: any) => setScheduleConfig({ ...scheduleConfig, repeatType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select repeat type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="custom">Custom Interval</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {scheduleConfig.repeatType === 'custom' && (
                  <div>
                    <Label htmlFor="interval">Interval (days)</Label>
                    <Input
                      id="interval"
                      type="number"
                      min="1"
                      value={scheduleConfig.repeatInterval || ''}
                      onChange={(e) => setScheduleConfig({ 
                        ...scheduleConfig, 
                        repeatInterval: parseInt(e.target.value) 
                      })}
                    />
                  </div>
                )}
              </div>

              {scheduleConfig.repeatType === 'weekly' && (
                <div>
                  <Label>Days of Week</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {daysOfWeek.map((day) => (
                      <div key={day.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${day.value}`}
                          checked={(scheduleConfig.daysOfWeek || []).includes(day.value)}
                          onCheckedChange={(checked) => handleDayToggle(day.value, !!checked)}
                        />
                        <Label htmlFor={`day-${day.value}`} className="text-sm">
                          {day.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={scheduleConfig.endDate || ''}
                    onChange={(e) => setScheduleConfig({ ...scheduleConfig, endDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxOccurrences">Max Occurrences</Label>
                  <Input
                    id="maxOccurrences"
                    type="number"
                    min="1"
                    value={scheduleConfig.maxOccurrences || ''}
                    onChange={(e) => setScheduleConfig({ 
                      ...scheduleConfig, 
                      maxOccurrences: parseInt(e.target.value) 
                    })}
                    placeholder="Unlimited"
                  />
                </div>
              </div>
            </div>
          )}

          {scheduleConfig.type === 'triggered' && (
            <div>
              <Label htmlFor="triggerType">Trigger Type</Label>
              <Select 
                value={scheduleConfig.triggerType} 
                onValueChange={(value: any) => setScheduleConfig({ ...scheduleConfig, triggerType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contact_added">New Contact Added</SelectItem>
                  <SelectItem value="date_based">Date-based Trigger</SelectItem>
                  <SelectItem value="event_based">Custom Event</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Schedule Summary</h4>
              <Badge variant="outline" className="flex items-center gap-1">
                {scheduleConfig.type === 'recurring' && <Repeat className="w-3 h-3" />}
                {scheduleConfig.type === 'triggered' && <Zap className="w-3 h-3" />}
                {scheduleConfig.type === 'scheduled' && <Clock className="w-3 h-3" />}
                {scheduleConfig.type.charAt(0).toUpperCase() + scheduleConfig.type.slice(1)}
              </Badge>
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              <p>Recipients: {recipients.length} contacts</p>
              <p>Message length: {message.length} characters</p>
              {scheduleConfig.type === 'recurring' && scheduleConfig.repeatType && (
                <p>Repeat: {scheduleConfig.repeatType}</p>
              )}
            </div>
          </div>

          <Button onClick={handleCreateSchedule} className="w-full">
            Create Schedule
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
