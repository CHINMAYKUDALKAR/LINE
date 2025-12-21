import { useMemo, useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
import { CalendarEventCard } from './CalendarEvent';
import { CalendarEventPopover } from './CalendarEventPopover';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { UserRole } from '@/types/navigation';
import { cn } from '@/lib/utils';

interface CalendarMonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  userRole: UserRole;
  onEmptySlotClick: (date: Date) => void;
  onReschedule: (event: CalendarEvent) => void;
  onCancel: (event: CalendarEvent) => void;
  onComplete?: (event: CalendarEvent) => void;
  onAddNote?: (event: CalendarEvent) => void;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX_VISIBLE_EVENTS = 3;

export function CalendarMonthView({
  currentDate,
  events,
  userRole,
  onEmptySlotClick,
  onReschedule,
  onCancel,
  onComplete,
  onAddNote,
}: CalendarMonthViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(new Date(event.startTime), day));
  };

  return (
    <div className="bg-background/40 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-border/50">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="py-3 text-center text-sm font-medium text-muted-foreground bg-muted/30"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {days.map((day, idx) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);
              const hasMoreEvents = dayEvents.length > MAX_VISIBLE_EVENTS;

              return (
                <div
                  key={idx}
                  className={cn(
                    'min-h-[120px] border-b border-r border-border/30 p-2 transition-colors',
                    !isCurrentMonth && 'bg-muted/10',
                    isCurrentDay && 'bg-primary/5',
                    'hover:bg-muted/20 cursor-pointer'
                  )}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      onEmptySlotClick(day);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        !isCurrentMonth && 'text-muted-foreground',
                        isCurrentDay &&
                        'w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center'
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {dayEvents.slice(0, MAX_VISIBLE_EVENTS).map((event) => (
                      <Popover
                        key={event.id}
                        open={selectedEvent?.id === event.id}
                        onOpenChange={(open) => setSelectedEvent(open ? event : null)}
                      >
                        <PopoverTrigger asChild>
                          <div onClick={(e) => e.stopPropagation()}>
                            <CalendarEventCard
                              event={event}
                              compact
                              onClick={() => setSelectedEvent(event)}
                            />
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
                    ))}
                    {hasMoreEvents && (
                      <button
                        className="text-xs text-primary hover:underline font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Could open a modal showing all events
                        }}
                      >
                        + {dayEvents.length - MAX_VISIBLE_EVENTS} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
