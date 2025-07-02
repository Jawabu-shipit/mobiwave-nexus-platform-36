
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Clock, Send } from 'lucide-react';
import { format } from 'date-fns';

interface CampaignSchedulerProps {
  onSchedule: (scheduledTime: Date) => void;
  onSendNow: () => void;
}

export function CampaignScheduler({ onSchedule, onSendNow }: CampaignSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [timezone, setTimezone] = useState('UTC');

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select both date and time');
      return;
    }

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(hours, minutes, 0, 0);

    if (scheduledDateTime <= new Date()) {
      toast.error('Scheduled time must be in the future');
      return;
    }

    onSchedule(scheduledDateTime);
    toast.success(`Campaign scheduled for ${format(scheduledDateTime, 'PPP p')}`);
  };

  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeString);
    }
  }

  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Campaign Scheduling
        </CardTitle>
        <CardDescription>
          Send your campaign immediately or schedule it for later
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <Button onClick={onSendNow} className="flex items-center gap-2 flex-1">
            <Send className="w-4 h-4" />
            Send Now
          </Button>
          <div className="text-sm text-gray-500 flex items-center">or</div>
          <div className="flex-1 text-right">
            <span className="text-sm text-gray-600">Schedule for later</span>
          </div>
        </div>

        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Select Time</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="h-60">
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="EAT">East Africa Time (EAT)</SelectItem>
                <SelectItem value="EST">Eastern Standard Time (EST)</SelectItem>
                <SelectItem value="PST">Pacific Standard Time (PST)</SelectItem>
                <SelectItem value="GMT">Greenwich Mean Time (GMT)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleSchedule} 
            className="w-full"
            disabled={!selectedDate || !selectedTime}
          >
            Schedule Campaign
          </Button>
        </div>

        {selectedDate && selectedTime && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Scheduled for:</strong> {format(selectedDate, 'PPP')} at {selectedTime} ({timezone})
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
