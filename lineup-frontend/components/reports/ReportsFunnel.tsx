import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FunnelStage } from '@/types/reports';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, TrendingDown } from 'lucide-react';

interface ReportsFunnelProps {
  stages: FunnelStage[];
  isLoading?: boolean;
  onStageClick?: (stage: string) => void;
}

export function ReportsFunnel({ stages, isLoading, onStageClick }: ReportsFunnelProps) {
  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="flex items-center justify-between gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-1">
              <Skeleton className="h-24 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const maxCount = stages[0]?.count || 1;

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-foreground">Hiring Funnel</h3>
        <span className="text-xs text-muted-foreground">Click stage to filter</span>
      </div>

      <div className="flex items-end gap-1 sm:gap-2">
        {stages.map((stage, index) => {
          const heightPercent = (stage.count / maxCount) * 100;
          const isLast = index === stages.length - 1;

          return (
            <div key={stage.stage} className="flex-1 flex flex-col items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onStageClick?.(stage.stage)}
                    className={cn(
                      "w-full rounded-t-lg transition-all duration-200 cursor-pointer",
                      "hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary/20",
                      "bg-gradient-to-t from-primary/80 to-primary"
                    )}
                    style={{ height: `${Math.max(heightPercent, 20)}px`, minHeight: '40px', maxHeight: '120px' }}
                  >
                    <span className="sr-only">{stage.label}: {stage.count}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-medium">{stage.label}</p>
                    <p className="text-sm">{stage.count} candidates ({stage.percentage}%)</p>
                    {stage.dropOff > 0 && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <TrendingDown className="h-3 w-3 text-red-500" />
                        {stage.dropOff}% drop-off from previous
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>

              <div className="mt-3 text-center">
                <p className="text-lg font-bold text-foreground">{stage.count}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[80px]">{stage.label}</p>
                <p className="text-xs text-muted-foreground">{stage.percentage}%</p>
              </div>

              {!isLast && (
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 hidden xl:block">
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Drop-off indicators */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Total drop-off: {100 - (stages[stages.length - 1]?.percentage || 0)}%</span>
          <span className="text-border">•</span>
          <span>Conversion rate: {stages[stages.length - 1]?.percentage || 0}%</span>
        </div>
      </div>
    </div>
  );
}
