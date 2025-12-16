import { cn } from '@/lib/utils';
import { StageCount, InterviewStage } from '@/types/interview';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowRight, Users } from 'lucide-react';

const stageColors: Record<InterviewStage, { bg: string; border: string; text: string; activeBg: string }> = {
  'applied': {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    activeBg: 'bg-purple-100'
  },
  'received': {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-700',
    activeBg: 'bg-slate-100'
  },
  'screening': {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    activeBg: 'bg-blue-100'
  },
  'interview-1': {
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    text: 'text-cyan-700',
    activeBg: 'bg-cyan-100'
  },
  'interview-2': {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    activeBg: 'bg-indigo-100'
  },
  'hr-round': {
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-700',
    activeBg: 'bg-violet-100'
  },
  'offer': {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    activeBg: 'bg-emerald-100'
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
