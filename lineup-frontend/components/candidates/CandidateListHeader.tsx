import { Plus, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types/navigation';

interface CandidateListHeaderProps {
  userRole: UserRole;
  onAddCandidate: () => void;
  onUploadSpreadsheet: () => void;
  onUploadResume: () => void;
}

export function CandidateListHeader({
  userRole,
  onAddCandidate,
  onUploadSpreadsheet,
  onUploadResume,
}: CandidateListHeaderProps) {
  const canEdit = userRole !== 'interviewer';

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-semibold text-foreground">Candidates</h1>

      {canEdit && (
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onAddCandidate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Candidate
          </Button>
          <Button variant="outline" onClick={onUploadSpreadsheet} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Spreadsheet
          </Button>
          <Button variant="ghost" onClick={onUploadResume} className="gap-2">
            <FileText className="h-4 w-4" />
            Upload Resume
          </Button>
        </div>
      )}
    </div>
  );
}
