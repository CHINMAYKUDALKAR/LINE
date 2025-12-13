import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Video, MapPin, Phone, Check, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Interviewer, TimeSlot } from '@/types/scheduling';
import { durationOptions } from '@/lib/scheduling-mock-data';

type InterviewMode = 'online' | 'offline' | 'phone';

interface InterviewDetailsFormProps {
  interviewers: Interviewer[];
  timeSlots: TimeSlot[];
  selectedInterviewerIds: string[];
  onInterviewerChange: (ids: string[]) => void;
  interviewMode: InterviewMode;
  onModeChange: (mode: InterviewMode) => void;
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  selectedTime: string;
  onTimeChange: (time: string) => void;
  duration: number;
  onDurationChange: (duration: number) => void;
  location: string;
  onLocationChange: (location: string) => void;
  meetingLink: string;
  onMeetingLinkChange: (link: string) => void;
  isLoading?: boolean;
}

const modeOptions = [
  { value: 'online' as const, label: 'Online', icon: Video, description: 'Video call' },
  { value: 'offline' as const, label: 'In-Person', icon: MapPin, description: 'Office visit' },
  { value: 'phone' as const, label: 'Phone', icon: Phone, description: 'Phone call' },
];

export function InterviewDetailsForm({
  interviewers,
  timeSlots,
  selectedInterviewerIds,
  onInterviewerChange,
  interviewMode,
  onModeChange,
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeChange,
  duration,
  onDurationChange,
  location,
  onLocationChange,
  meetingLink,
  onMeetingLinkChange,
  isLoading,
}: InterviewDetailsFormProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const toggleInterviewer = (id: string) => {
    if (selectedInterviewerIds.includes(id)) {
      onInterviewerChange(selectedInterviewerIds.filter((i) => i !== id));
    } else {
      onInterviewerChange([...selectedInterviewerIds, id]);
    }
  };

  const getAvailabilityColor = (availability: Interviewer['availability']) => {
    switch (availability) {
      case 'available':
        return 'bg-emerald-500';
      case 'partial':
        return 'bg-amber-500';
      case 'busy':
        return 'bg-red-500';
    }
  };

  const getAvailabilityText = (availability: Interviewer['availability']) => {
    switch (availability) {
      case 'available':
        return 'Available today';
      case 'partial':
        return 'Limited availability';
      case 'busy':
        return 'Busy today';
    }
  };

  return (
    <div className="space-y-6">
      {/* Interviewers Section */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Select Interviewers</Label>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {interviewers.map((interviewer) => {
              const isSelected = selectedInterviewerIds.includes(interviewer.id);
              return (
                <Tooltip key={interviewer.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => toggleInterviewer(interviewer.id)}
                      className={cn(
                        'relative flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                        'hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20',
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-background'
                      )}
                    >
                      {/* Avatar with availability dot */}
                      <div className="relative flex-shrink-0">
                        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                          <span className="text-xs font-medium text-secondary-foreground">
                            {interviewer.name.split(' ').map((n) => n[0]).join('')}
                          </span>
                        </div>
                        <span
                          className={cn(
                            'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background',
                            getAvailabilityColor(interviewer.availability)
                          )}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {interviewer.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{interviewer.role}</p>
                      </div>

                      {/* Selection check */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{getAvailabilityText(interviewer.availability)}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}
      </div>

      {/* Interview Mode */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Interview Mode</Label>
        <div className="flex gap-2">
          {modeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = interviewMode === option.value;
            return (
              <button
                key={option.value}
                onClick={() => onModeChange(option.value)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all',
                  'hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-background'
                )}
              >
                <Icon className={cn('h-5 w-5', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                <span className={cn('text-sm font-medium', isSelected ? 'text-primary' : 'text-foreground')}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date & Time Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Date Picker */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Date</Label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !selectedDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  onDateChange(date);
                  setCalendarOpen(false);
                }}
                disabled={(date) => date < new Date()}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Duration</Label>
          <Select value={duration.toString()} onValueChange={(v) => onDurationChange(Number(v))}>
            <SelectTrigger className="bg-background">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50">
              {durationOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value.toString()}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Time Slots */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Time Slot</Label>
          <span className="text-xs text-muted-foreground">• Smart suggestions highlighted</span>
        </div>
        <ScrollArea className="w-full">
          <div className="flex flex-wrap gap-2 pb-1">
            {timeSlots.map((slot) => (
              <button
                key={slot.time}
                disabled={!slot.available}
                onClick={() => onTimeChange(slot.time)}
                className={cn(
                  'relative px-3 py-2 rounded-md text-sm font-medium transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-primary/20',
                  slot.available
                    ? selectedTime === slot.time
                      ? 'bg-primary text-primary-foreground'
                      : slot.recommended
                      ? 'bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    : 'bg-muted text-muted-foreground/50 cursor-not-allowed'
                )}
              >
                {slot.time}
                {slot.recommended && selectedTime !== slot.time && (
                  <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-primary" />
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Conditional: Meeting Link or Location */}
      {interviewMode === 'online' && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Meeting Link</Label>
          <Input
            placeholder="https://meet.google.com/..."
            value={meetingLink}
            onChange={(e) => onMeetingLinkChange(e.target.value)}
            className="bg-background"
          />
          <p className="text-xs text-muted-foreground">Leave empty to auto-generate</p>
        </div>
      )}

      {interviewMode === 'offline' && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Location</Label>
          <Input
            placeholder="Conference Room A, Floor 3"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            className="bg-background"
          />
        </div>
      )}
    </div>
  );
}
