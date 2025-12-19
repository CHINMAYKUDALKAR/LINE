import { useMemo, useState } from 'react';
import {
  format,
  isSameDay,
  setHours,
  getHours,
  getMinutes,
  differenceInMinutes,
} from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
import { CalendarEventPopover } from './CalendarEventPopover';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { UserRole } from '@/types/navigation';
import { cn } from '@/lib/utils';

interface CalendarDayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  userRole: UserRole;
  onEmptySlotClick: (date: Date) => void;
  onReschedule: (event: CalendarEvent) => void;
  onCancel: (event: CalendarEvent) => void;
  onComplete?: (event: CalendarEvent) => void;
  onAddNote?: (event: CalendarEvent) => void;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);
const HOUR_HEIGHT = 80;

const stageColors: Record<string, string> = {
  received: 'bg-slate-100 border-slate-300',
  screening: 'bg-blue-50 border-blue-300',
  'interview-1': 'bg-indigo-50 border-indigo-300',
  'interview-2': 'bg-violet-50 border-violet-300',
  'hr-round': 'bg-amber-50 border-amber-300',
  offer: 'bg-emerald-50 border-emerald-300',
};

const statusBadgeColors: Record<string, string> = {
  scheduled: 'bg-primary/10 text-primary',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-muted text-muted-foreground',
  'no-show': 'bg-destructive/10 text-destructive',
  'pending-feedback': 'bg-amber-100 text-amber-700',
};

export function CalendarDayView({
  currentDate,
  events,
  userRole,
  onEmptySlotClick,
  onReschedule,
  onCancel,
  onComplete,
  onAddNote,
}: CalendarDayViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const dayEvents = useMemo(() => {
    return events.filter((event) => isSameDay(new Date(event.startTime), currentDate));
  }, [events, currentDate]);

  const getEventPosition = (event: CalendarEvent) => {
    const startDate = new Date(event.startTime);
    const startHour = getHours(startDate);
    const startMinutes = getMinutes(startDate);
    const durationMinutes = differenceInMinutes(new Date(event.endTime), startDate);

    const top = ((startHour - 8) * HOUR_HEIGHT) + ((startMinutes / 60) * HOUR_HEIGHT);
    const height = (durationMinutes / 60) * HOUR_HEIGHT;

    return { top, height: Math.max(height, 50) };
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Day Header */}
      <div className="py-4 px-6 border-b border-border bg-muted/30">
        <h2 className="text-lg font-semibold text-foreground">
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {dayEvents.length} interview{dayEvents.length !== 1 ? 's' : ''} scheduled
        </p>
      </div>

      {/* Timeline */}
      <div className="overflow-auto max-h-[700px]">
        <div className="grid grid-cols-[80px_1fr] min-w-[600px]">
          {/* Hour Labels */}
          <div className="border-r border-border">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-[80px] text-sm text-muted-foreground text-right pr-3 pt-0 -mt-2"
              >
                {format(setHours(new Date(), hour), 'h:mm a')}
              </div>
            ))}
          </div>

          {/* Event Column */}
          <div className="relative">
            {/* Hour Slots */}
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-[80px] border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => onEmptySlotClick(setHours(currentDate, hour))}
              />
            ))}

            {/* Events */}
            {dayEvents.map((event) => {
              const { top, height } = getEventPosition(event);
              const stageColor = stageColors[event.stage] || stageColors.received;
              const statusColor = statusBadgeColors[event.status] || statusBadgeColors.scheduled;

              return (
                <Popover
                  key={event.id}
                  open={selectedEvent?.id === event.id}
                  onOpenChange={(open) => setSelectedEvent(open ? event : null)}
                >
                  <PopoverTrigger asChild>
                    <div
                      className={cn(
                        'absolute left-2 right-2 p-3 rounded-lg border-l-4 shadow-sm cursor-pointer transition-all',
                        'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50',
                        stageColor
                      )}
                      style={{ top: `${top}px`, minHeight: `${height}px` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-foreground">
                              {format(new Date(event.startTime), 'h:mm a')} -{' '}
                              {format(new Date(event.endTime), 'h:mm a')}
                            </span>
                            <span
                              className={cn(
                                'text-xs px-2 py-0.5 rounded-full font-medium',
                                statusColor
                              )}
                            >
                              {event.status.replace('-', ' ')}
                            </span>
                          </div>
                          <h3 className="font-medium text-foreground">{event.candidateName}</h3>
                          <p className="text-sm text-muted-foreground">{event.role}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background border flex items-center justify-center">
                            <span className="text-xs font-medium">{event.interviewerInitials}</span>
                          </div>
                        </div>
                      </div>
                      {height > 80 && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          Interviewer: {event.interviewerName}
                        </div>
                      )}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-auto" align="start">
                    <CalendarEventPopover
                      event={event}
                      userRole={userRole}
                      onClose={() => setSelectedEvent(null)}
                      onReschedule={onReschedule}
                      onCancel={onCancel}
                      onComplete={onComplete}
                      onAddNote={onAddNote}
                    />
                  </PopoverContent>
                </Popover>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
