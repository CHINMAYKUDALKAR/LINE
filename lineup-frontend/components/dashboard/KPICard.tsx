import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Calendar, Clock, CheckCircle, XCircle, LucideIcon, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface KPICardProps {
  title: string;
  value: number;
  trend: number;
  icon: LucideIcon;
  description: string;
  isLoading?: boolean;
  onClick?: () => void;
}

export function KPICard({ title, value, trend, icon: Icon, description, isLoading, onClick }: KPICardProps) {
  const isPositive = trend >= 0;

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
        <Skeleton className="mt-4 h-9 w-20" />
        <Skeleton className="mt-2 h-3 w-32" />
        <Skeleton className="mt-3 h-4 w-24" />
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "group w-full text-left bg-card rounded-lg border border-border p-5 shadow-sm",
            "transition-all duration-200",
            "hover:shadow-lg hover:border-primary/30 dark:hover:border-primary/50 dark:hover:shadow-blue-900/10 hover:-translate-y-0.5",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
            "active:translate-y-0 active:shadow-md"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</span>
            <div className={cn(
              "p-2.5 rounded-lg transition-colors duration-200",
              "bg-primary/5 group-hover:bg-primary/10 dark:bg-primary/10 dark:group-hover:bg-primary/20"
            )}>
              <Icon className="h-4 w-4 text-primary dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-foreground dark:text-white tracking-tight">{value}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{description}</p>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className={cn(
                "text-xs font-semibold",
                isPositive ? "text-emerald-600" : "text-red-500"
              )}>
                {isPositive ? '+' : ''}{trend}%
              </span>
              <span className="text-xs text-muted-foreground">vs last week</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <p className="text-xs">Click to filter interviews by this metric</p>
      </TooltipContent>
    </Tooltip>
  );
}

interface KPICardsProps {
  metrics: {
    scheduledToday: number;
    scheduledTodayTrend: number;
    pendingFeedback: number;
    pendingFeedbackTrend: number;
    completed: number;
    completedTrend: number;
    noShows: number;
    noShowsTrend: number;
  } | null;
  isLoading?: boolean;
  onCardClick?: (filter: string) => void;
}

export function KPICards({ metrics, isLoading, onCardClick }: KPICardsProps) {
  const cards = [
    {
      title: 'Scheduled Today',
      value: metrics?.scheduledToday ?? 0,
      trend: metrics?.scheduledTodayTrend ?? 0,
      icon: Calendar,
      filter: 'scheduled-today',
      description: 'Interviews happening today'
    },
    {
      title: 'Pending Feedback',
      value: metrics?.pendingFeedback ?? 0,
      trend: metrics?.pendingFeedbackTrend ?? 0,
      icon: Clock,
      filter: 'pending-feedback',
      description: 'Awaiting interviewer feedback'
    },
    {
      title: 'Completed',
      value: metrics?.completed ?? 0,
      trend: metrics?.completedTrend ?? 0,
      icon: CheckCircle,
      filter: 'completed',
      description: 'Successfully completed this week'
    },
    {
      title: 'No-Shows',
      value: metrics?.noShows ?? 0,
      trend: metrics?.noShowsTrend ?? 0,
      icon: XCircle,
      filter: 'no-shows',
      description: 'Candidates who missed interviews'
    },
  ];

  return (
    <section aria-label="Key metrics">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <KPICard
            key={card.filter}
            title={card.title}
            value={card.value}
            trend={card.trend}
            icon={card.icon}
            description={card.description}
            isLoading={isLoading}
            onClick={() => onCardClick?.(card.filter)}
          />
        ))}
      </div>
    </section>
  );
}
