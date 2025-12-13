import { useMemo, useState } from 'react';
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  setHours,
  getHours,
  getMinutes,
  differenceInMinutes,
  isWeekend,
} from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
import { CalendarEventPopover } from './CalendarEventPopover';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { UserRole } from '@/types/navigation';
import { cn } from '@/lib/utils';

interface CalendarWeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  userRole: UserRole;
  onEmptySlotClick: (date: Date) => void;
  onReschedule: (event: CalendarEvent) => void;
  onCancel: (event: CalendarEvent) => void;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
const HOUR_HEIGHT = 64; // Increased slightly for better readability

const stageColors: Record<string, string> = {
  received: 'border-l-slate-500 bg-slate-50 text-slate-700 hover:bg-slate-100',
  screening: 'border-l-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100',
  'interview-1': 'border-l-indigo-500 bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
  'interview-2': 'border-l-violet-500 bg-violet-50 text-violet-700 hover:bg-violet-100',
  'hr-round': 'border-l-amber-500 bg-amber-50 text-amber-700 hover:bg-amber-100',
  offer: 'border-l-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
};

export function CalendarWeekView({
  currentDate,
  events,
  userRole,
  onEmptySlotClick,
  onReschedule,
  onCancel,
}: CalendarWeekViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);

  const days = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentDate]);

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(new Date(event.startTime), day));
  };

  const getEventPosition = (event: CalendarEvent) => {
    const startDate = new Date(event.startTime);
    const startHour = getHours(startDate);
    const startMinutes = getMinutes(startDate);
    const durationMinutes = differenceInMinutes(new Date(event.endTime), startDate);

    const top = ((startHour - 8) * HOUR_HEIGHT) + ((startMinutes / 60) * HOUR_HEIGHT);
    const height = (durationMinutes / 60) * HOUR_HEIGHT;

    return { top, height: Math.max(height, 34) };
  };

  const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
    if (userRole === 'interviewer') return;
    setDraggedEvent(event);
    e.dataTransfer.setData('text/plain', event.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, day: Date, hour: number) => {
    e.preventDefault();
    if (draggedEvent && userRole !== 'interviewer') {
      const newDate = setHours(day, hour);
      onReschedule({ ...draggedEvent, startTime: newDate.toISOString() });
    }
    setDraggedEvent(null);
  };

  return (
    <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden flex flex-col h-[calc(100vh-240px)]">
      {/* Day Headers */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border bg-muted/30">
        <div className="py-4 border-r border-border/50" />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              'py-3 text-center border-r border-border/50 last:border-r-0',
              isToday(day) ? 'bg-primary/5' : '',
              isWeekend(day) ? 'bg-muted/30' : ''
            )}
          >
            <div className={cn(
              "text-xs font-medium uppercase mb-1",
              isToday(day) ? "text-primary" : "text-muted-foreground"
            )}>
              {format(day, 'EEE')}
            </div>
            <div
              className={cn(
                'text-xl font-semibold inline-flex items-center justify-center w-8 h-8 rounded-full',
                isToday(day)
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground'
              )}
            >
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Time Grid */}
      <div className="overflow-y-auto flex-1 custom-scrollbar">
        <div className="grid grid-cols-[60px_repeat(7,1fr)] min-h-full">
          {/* Hour Labels */}
          <div className="border-r border-border/50 bg-background sticky left-0 z-20">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="relative h-[64px]"
              >
                <span className="absolute -top-2.5 right-3 text-xs font-medium text-muted-foreground/70">
                  {format(setHours(new Date(), hour), 'h a')}
                </span>
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isDayToday = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'relative border-r border-border/50 last:border-r-0 min-h-full',
                  isDayToday ? 'bg-primary/[0.02]' : '',
                  isWeekend(day) ? 'bg-muted/20' : ''
                )}
              >
                {/* Hour Slots */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="h-[64px] border-b border-dashed border-border/40 hover:bg-muted/40 cursor-pointer transition-colors"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, day, hour)}
                    onClick={() => onEmptySlotClick(setHours(day, hour))}
                  />
                ))}

                {/* Current Time Indicator */}
                {isDayToday && (
                  <div
                    className="absolute w-full border-t-2 border-red-500 z-10 pointer-events-none flex items-center"
                    style={{
                      top: `${((getHours(new Date()) - 8) * HOUR_HEIGHT) + ((getMinutes(new Date()) / 60) * HOUR_HEIGHT)}px`
                    }}
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full -ml-1" />
                  </div>
                )}

                {/* Events */}
                {dayEvents.map((event) => {
                  const { top, height } = getEventPosition(event);
                  const stageStyle = stageColors[event.stage] || stageColors.received;

                  return (
                    <Popover
                      key={event.id}
                      open={selectedEvent?.id === event.id}
                      onOpenChange={(open) => setSelectedEvent(open ? event : null)}
                    >
                      <PopoverTrigger asChild>
                        <div
                          draggable={userRole !== 'interviewer'}
                          onDragStart={(e) => handleDragStart(e, event)}
                          className={cn(
                            'absolute left-1 right-1 rounded-md border-l-4 px-2 py-1.5 cursor-pointer transition-all duration-200',
                            'shadow-sm hover:shadow-md hover:-translate-y-0.5',
                            'focus:outline-none focus:ring-2 focus:ring-primary/50',
                            stageStyle,
                            draggedEvent?.id === event.id && 'opacity-50 scale-95'
                          )}
                          style={{ top: `${top}px`, height: `${height}px` }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                        >
                          <div className="font-semibold text-xs leading-tight truncate">
                            {event.candidateName}
                          </div>
                          {height > 40 && (
                            <div className="text-[11px] opacity-80 truncate mt-0.5 font-medium">
                              {event.role}
                            </div>
                          )}
                          {height > 55 && (
                            <div className="text-[10px] opacity-70 truncate mt-0.5">
                              {format(new Date(event.startTime), 'h:mm a')}
                            </div>
                          )}
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-auto border-none shadow-xl" align="start" sideOffset={5}>
                        <CalendarEventPopover
                          event={event}
                          userRole={userRole}
                          onClose={() => setSelectedEvent(null)}
                          onReschedule={onReschedule}
                          onCancel={onCancel}
                        />
                      </PopoverContent>
                    </Popover>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
