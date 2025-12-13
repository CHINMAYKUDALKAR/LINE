import { CalendarEvent as CalendarEventType } from '@/types/calendar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CalendarEventProps {
  event: CalendarEventType;
  compact?: boolean;
  onClick?: (event: CalendarEventType) => void;
}

const stageColors: Record<string, string> = {
  received: 'bg-slate-100 text-slate-700 border-slate-200',
  screening: 'bg-blue-50 text-blue-700 border-blue-200',
  'interview-1': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'interview-2': 'bg-violet-50 text-violet-700 border-violet-200',
  'hr-round': 'bg-amber-50 text-amber-700 border-amber-200',
  offer: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const statusColors: Record<string, string> = {
  scheduled: 'bg-primary/10 text-primary',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-muted text-muted-foreground',
  'no-show': 'bg-destructive/10 text-destructive',
  'pending-feedback': 'bg-amber-100 text-amber-700',
};

export function CalendarEventCard({ event, compact = false, onClick }: CalendarEventProps) {
  const stageColor = stageColors[event.stage] || stageColors.received;
  
  if (compact) {
    return (
      <button
        onClick={() => onClick?.(event)}
        className={cn(
          'w-full text-left px-2 py-1 rounded text-xs truncate border transition-all',
          'hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50',
          stageColor
        )}
        aria-label={`Interview with ${event.candidateName}`}
      >
        <span className="font-medium">{event.candidateName}</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => onClick?.(event)}
      className={cn(
        'w-full text-left p-2 rounded-md border transition-all cursor-pointer',
        'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50',
        stageColor
      )}
      aria-label={`Interview with ${event.candidateName} for ${event.role}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{event.candidateName}</p>
          <p className="text-xs text-muted-foreground truncate">{event.role}</p>
        </div>
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-background border flex items-center justify-center">
          <span className="text-xs font-medium">{event.interviewerInitials}</span>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Badge variant="outline" className={cn('text-xs px-1.5 py-0', statusColors[event.status])}>
          {event.status.replace('-', ' ')}
        </Badge>
      </div>
    </button>
  );
}
