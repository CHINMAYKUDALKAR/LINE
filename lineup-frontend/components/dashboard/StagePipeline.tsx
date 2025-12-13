import { cn } from '@/lib/utils';
import { StageCount, InterviewStage } from '@/types/interview';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowRight, Users } from 'lucide-react';

const stageColors: Record<InterviewStage, { bg: string; border: string; text: string; activeBg: string }> = {
  'received': {
    bg: 'bg-slate-50 dark:bg-slate-900/20',
    border: 'border-slate-200 dark:border-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    activeBg: 'bg-slate-100 dark:bg-slate-800/40'
  },
  'screening': {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-900',
    text: 'text-blue-700 dark:text-blue-400',
    activeBg: 'bg-blue-100 dark:bg-blue-900/40'
  },
  'interview-1': {
    bg: 'bg-cyan-50 dark:bg-cyan-950/20',
    border: 'border-cyan-200 dark:border-cyan-900',
    text: 'text-cyan-700 dark:text-cyan-400',
    activeBg: 'bg-cyan-100 dark:bg-cyan-900/40'
  },
  'interview-2': {
    bg: 'bg-indigo-50 dark:bg-indigo-950/20',
    border: 'border-indigo-200 dark:border-indigo-900',
    text: 'text-indigo-700 dark:text-indigo-400',
    activeBg: 'bg-indigo-100 dark:bg-indigo-900/40'
  },
  'hr-round': {
    bg: 'bg-violet-50 dark:bg-violet-950/20',
    border: 'border-violet-200 dark:border-violet-900',
    text: 'text-violet-700 dark:text-violet-400',
    activeBg: 'bg-violet-100 dark:bg-violet-900/40'
  },
  'offer': {
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-emerald-200 dark:border-emerald-900',
    text: 'text-emerald-700 dark:text-emerald-400',
    activeBg: 'bg-emerald-100 dark:bg-emerald-900/40'
  },
};

interface StagePipelineProps {
  stages: StageCount[];
  activeStage?: InterviewStage;
  isLoading?: boolean;
  onStageClick?: (stage: InterviewStage) => void;
}

export function StagePipeline({ stages, activeStage, isLoading, onStageClick }: StagePipelineProps) {
  if (isLoading) {
    return (
      <section className="bg-card rounded-lg border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-36 flex-shrink-0 rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  const totalCandidates = stages.reduce((sum, s) => sum + s.count, 0);

  return (
    <section aria-label="Interview pipeline" className="bg-card rounded-lg border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Interview Pipeline</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Track candidates across hiring stages</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>{totalCandidates} total candidates</span>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {stages.map((stage, index) => {
          const defaultColor = { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', activeBg: 'bg-gray-100' };
          const colors = stageColors[stage.stage] || defaultColor;
          const isActive = activeStage === stage.stage;

          return (
            <div key={stage.stage} className="flex items-center flex-shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onStageClick?.(stage.stage)}
                    className={cn(
                      "group relative px-5 py-4 rounded-lg border-2 transition-all duration-200 min-w-[140px]",
                      "hover:shadow-md hover:-translate-y-0.5",
                      "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
                      colors.border,
                      isActive ? colors.activeBg : colors.bg,
                      isActive && "ring-2 ring-primary/30 ring-offset-1"
                    )}
                  >
                    {isActive && (
                      <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                    )}
                    <div className={cn("text-xs font-medium", colors.text)}>{stage.label}</div>
                    <div className={cn("text-2xl font-bold mt-1.5", colors.text)}>{stage.count}</div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-muted-foreground">
                        <span className="font-medium">{stage.pending}</span> pending
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        <span className="font-medium">{stage.completed}</span> done
                      </span>
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px]">
                  <p className="text-xs font-medium">{stage.label} Stage</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stage.pending} candidates pending review, {stage.completed} completed
                  </p>
                </TooltipContent>
              </Tooltip>

              {index < stages.length - 1 && (
                <div className="mx-2 flex-shrink-0">
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
