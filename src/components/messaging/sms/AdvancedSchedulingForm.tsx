
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, Repeat, Zap } from 'lucide-react';

export interface ScheduleConfig {
  type: 'immediate' | 'scheduled' | 'recurring' | 'triggered';
  datetime?: string;
  repeatPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    interval: number;
    daysOfWeek?: string[];
    endDate?: string;
    maxOccurrences?: number;
  };
  triggerConditions?: {
    eventType: string;
    conditions: Record<string, any>;
  };
}

interface AdvancedSchedulingFormProps {
  onScheduleChange: (config: ScheduleConfig) => void;
  initialConfig?: ScheduleConfig;
}

export function AdvancedSchedulingForm({ onScheduleChange, initialConfig }: AdvancedSchedulingFormProps) {
  const [scheduleType, setScheduleType] = useState<ScheduleConfig['type']>(
    initialConfig?.type || 'immediate'
  );
  const [datetime, setDatetime] = useState(initialConfig?.datetime || '');
  const [repeatPattern, setRepeatPattern] = useState<ScheduleConfig['repeatPattern']>(
    initialConfig?.repeatPattern || {
      frequency: 'daily',
      interval: 1,
      daysOfWeek: [],
      maxOccurrences: 10
    }
  );
  const [triggerConditions, setTriggerConditions] = useState<ScheduleConfig['triggerConditions']>(
    initialConfig?.triggerConditions || {
      eventType: 'user_signup',
      conditions: {}
    }
  );

  const daysOfWeek = [
    { value: '1', label: 'Mon' },
    { value: '2', label: 'Tue' },
    { value: '3', label: 'Wed' },
    { value: '4', label: 'Thu' },
    { value: '5', label: 'Fri' },
    { value: '6', label: 'Sat' },
    { value: '7', label: 'Sun' }
  ];

  const handleScheduleTypeChange = (type: ScheduleConfig['type']) => {
    setScheduleType(type);
    updateSchedule(type);
  };

  const updateSchedule = (type: ScheduleConfig['type'] = scheduleType) => {
    const config: ScheduleConfig = { type };
    
    switch (type) {
      case 'scheduled':
        config.datetime = datetime;
        break;
      case 'recurring':
        config.datetime = datetime;
        config.repeatPattern = repeatPattern;
        break;
      case 'triggered':
        config.triggerConditions = triggerConditions;
        break;
    }
    
    onScheduleChange(config);
  };

  const handleDayToggle = (day: string, checked: boolean) => {
    if (!repeatPattern) return;
    
    const newDays = checked 
      ? [...(repeatPattern.daysOfWeek || []), day]
      : (repeatPattern.daysOfWeek || []).filter(d => d !== day);
    
    const newPattern = { ...repeatPattern, daysOfWeek: newDays };
    setRepeatPattern(newPattern);
    updateSchedule();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Advanced Scheduling
        </CardTitle>
        <CardDescription>
          Configure when and how often your SMS campaign should run
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Schedule Type Selection */}
        <div className="space-y-3">
          <Label>Delivery Type</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant={scheduleType === 'immediate' ? 'default' : 'outline'}
              onClick={() => handleScheduleTypeChange('immediate')}
              className="flex flex-col items-center gap-2 h-20"
            >
              <Zap className="w-5 h-5" />
              <span className="text-xs">Send Now</span>
            </Button>
            <Button
              variant={scheduleType === 'scheduled' ? 'default' : 'outline'}
              onClick={() => handleScheduleTypeChange('scheduled')}
              className="flex flex-col items-center gap-2 h-20"
            >
              <Calendar className="w-5 h-5" />
              <span className="text-xs">Schedule</span>
            </Button>
            <Button
              variant={scheduleType === 'recurring' ? 'default' : 'outline'}
              onClick={() => handleScheduleTypeChange('recurring')}
              className="flex flex-col items-center gap-2 h-20"
            >
              <Repeat className="w-5 h-5" />
              <span className="text-xs">Recurring</span>
            </Button>
            <Button
              variant={scheduleType === 'triggered' ? 'default' : 'outline'}
              onClick={() => handleScheduleTypeChange('triggered')}
              className="flex flex-col items-center gap-2 h-20"
            >
              <Zap className="w-5 h-5" />
              <span className="text-xs">Triggered</span>
            </Button>
          </div>
        </div>

        {/* Scheduled Options */}
        {(scheduleType === 'scheduled' || scheduleType === 'recurring') && (
          <div className="space-y-4 p-4 border rounded-lg bg-blue-50/30">
            <div>
              <Label htmlFor="datetime">Start Date & Time</Label>
              <Input
                id="datetime"
                type="datetime-local"
                value={datetime}
                onChange={(e) => {
                  setDatetime(e.target.value);
                  updateSchedule();
                }}
                min={new Date().toISOString().slice(0, 16)}
                className="mt-1"
              />
            </div>
          </div>
        )}

        {/* Recurring Options */}
        {scheduleType === 'recurring' && (
          <div className="space-y-4 p-4 border rounded-lg bg-green-50/30">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="frequency">Repeat Every</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    min="1"
                    value={repeatPattern?.interval || 1}
                    onChange={(e) => {
                      const newPattern = { ...repeatPattern!, interval: parseInt(e.target.value) || 1 };
                      setRepeatPattern(newPattern);
                      updateSchedule();
                    }}
                    className="w-20"
                  />
                  <Select
                    value={repeatPattern?.frequency || 'daily'}
                    onValueChange={(value: 'daily' | 'weekly' | 'monthly') => {
                      const newPattern = { ...repeatPattern!, frequency: value };
                      setRepeatPattern(newPattern);
                      updateSchedule();
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Day(s)</SelectItem>
                      <SelectItem value="weekly">Week(s)</SelectItem>
                      <SelectItem value="monthly">Month(s)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="maxOccurrences">Max Occurrences</Label>
                <Input
                  id="maxOccurrences"
                  type="number"
                  min="1"
                  value={repeatPattern?.maxOccurrences || ''}
                  onChange={(e) => {
                    const newPattern = { ...repeatPattern!, maxOccurrences: parseInt(e.target.value) || undefined };
                    setRepeatPattern(newPattern);
                    updateSchedule();
                  }}
                  placeholder="Unlimited"
                  className="mt-1"
                />
              </div>
            </div>

            {repeatPattern?.frequency === 'weekly' && (
              <div>
                <Label>Days of Week</Label>
                <div className="flex gap-2 mt-2">
                  {daysOfWeek.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${day.value}`}
                        checked={(repeatPattern?.daysOfWeek || []).includes(day.value)}
                        onCheckedChange={(checked) => handleDayToggle(day.value, checked as boolean)}
                      />
                      <Label htmlFor={`day-${day.value}`} className="text-sm">{day.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={repeatPattern?.endDate || ''}
                onChange={(e) => {
                  const newPattern = { ...repeatPattern!, endDate: e.target.value || undefined };
                  setRepeatPattern(newPattern);
                  updateSchedule();
                }}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1"
              />
            </div>
          </div>
        )}

        {/* Triggered Options */}
        {scheduleType === 'triggered' && (
          <div className="space-y-4 p-4 border rounded-lg bg-purple-50/30">
            <div>
              <Label htmlFor="eventType">Trigger Event</Label>
              <Select
                value={triggerConditions?.eventType || 'user_signup'}
                onValueChange={(value) => {
                  const newConditions = { ...triggerConditions!, eventType: value };
                  setTriggerConditions(newConditions);
                  updateSchedule();
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user_signup">New User Signup</SelectItem>
                  <SelectItem value="user_login">User Login</SelectItem>
                  <SelectItem value="purchase_completed">Purchase Completed</SelectItem>
                  <SelectItem value="subscription_expired">Subscription Expired</SelectItem>
                  <SelectItem value="custom_event">Custom Event</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {triggerConditions?.eventType === 'custom_event' && (
              <div>
                <Label htmlFor="customEvent">Custom Event Name</Label>
                <Input
                  id="customEvent"
                  value={triggerConditions?.conditions?.eventName || ''}
                  onChange={(e) => {
                    const newConditions = {
                      ...triggerConditions!,
                      conditions: { ...triggerConditions!.conditions, eventName: e.target.value }
                    };
                    setTriggerConditions(newConditions);
                    updateSchedule();
                  }}
                  placeholder="e.g., cart_abandoned"
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label htmlFor="delay">Delay (minutes)</Label>
              <Input
                id="delay"
                type="number"
                min="0"
                value={triggerConditions?.conditions?.delay || 0}
                onChange={(e) => {
                  const newConditions = {
                    ...triggerConditions!,
                    conditions: { ...triggerConditions!.conditions, delay: parseInt(e.target.value) || 0 }
                  };
                  setTriggerConditions(newConditions);
                  updateSchedule();
                }}
                placeholder="0"
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                How long to wait after the trigger event before sending
              </p>
            </div>
          </div>
        )}

        {/* Schedule Summary */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Schedule Summary</h4>
          <div className="text-sm text-gray-600">
            {scheduleType === 'immediate' && (
              <p>SMS will be sent immediately when campaign is launched.</p>
            )}
            {scheduleType === 'scheduled' && datetime && (
              <p>SMS will be sent on {new Date(datetime).toLocaleString()}.</p>
            )}
            {scheduleType === 'recurring' && repeatPattern && (
              <div>
                <p>
                  SMS will repeat every {repeatPattern.interval} {repeatPattern.frequency}
                  {repeatPattern.frequency === 'weekly' && repeatPattern.daysOfWeek?.length 
                    ? ` on ${repeatPattern.daysOfWeek.map(d => daysOfWeek.find(day => day.value === d)?.label).join(', ')}`
                    : ''
                  }
                </p>
                {repeatPattern.maxOccurrences && (
                  <p>Maximum {repeatPattern.maxOccurrences} occurrences.</p>
                )}
                {repeatPattern.endDate && (
                  <p>Ending on {new Date(repeatPattern.endDate).toLocaleDateString()}.</p>
                )}
              </div>
            )}
            {scheduleType === 'triggered' && triggerConditions && (
              <p>
                SMS will be sent {triggerConditions.conditions?.delay || 0} minutes after 
                "{triggerConditions.eventType.replace('_', ' ')}" event occurs.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
