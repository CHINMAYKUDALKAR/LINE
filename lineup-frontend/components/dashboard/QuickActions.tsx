import { Button } from '@/components/ui/button';
import { Plus, Users, Upload, Calendar } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface QuickActionsProps {
  onSchedule?: () => void;
  onBulkSchedule?: () => void;
  onAddCandidate?: () => void;
  onUpload?: () => void;
}

export function QuickActions({ onSchedule, onBulkSchedule, onAddCandidate, onUpload }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Primary Action */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={onSchedule} className="gap-2 shadow-sm">
            <Calendar className="h-4 w-4" />
            Schedule Interview
          </Button>
        </TooltipTrigger>
        <TooltipContent>Schedule a new interview session</TooltipContent>
      </Tooltip>

      {/* Secondary Actions */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={onBulkSchedule} variant="secondary" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Bulk Schedule</span>
            <span className="sm:hidden">Bulk</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Schedule multiple interviews at once</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={onAddCandidate} variant="secondary" className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Candidate</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add a new candidate to the pipeline</TooltipContent>
      </Tooltip>

      {/* Tertiary Action */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={onUpload} variant="outline" className="gap-2 border-dashed border-primary/20 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Import Candidates</span>
            <span className="sm:hidden">Import</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Import candidates from spreadsheet</TooltipContent>
      </Tooltip>
    </div>
  );
}
