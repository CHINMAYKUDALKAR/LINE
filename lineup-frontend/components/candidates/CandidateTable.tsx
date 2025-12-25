import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CandidateListItem } from '@/types/candidate-list';
import { CandidateDetailSheet } from './CandidateDetailSheet';
import { CandidateRowMenu } from './CandidateRowMenu';
import { CandidateMobileCard } from './CandidateMobileCard';
import { stageLabels, stageColors, getInitials } from '@/lib/candidate-constants';
import { UserRole } from '@/types/navigation';
import { cn } from '@/lib/utils';
import { EditableSelect } from '@/components/ui/editable-select';

interface CandidateTableProps {
  candidates: CandidateListItem[];
  selectedIds: string[];
  userRole: UserRole;
  onSelectionChange: (ids: string[]) => void;
  onChangeStage: (candidate: CandidateListItem) => void;
  onScheduleInterview: (candidate: CandidateListItem) => void;
  onSendEmail: (candidate: CandidateListItem) => void;
  onSendWhatsApp: (candidate: CandidateListItem) => void;
  onSendSMS: (candidate: CandidateListItem) => void;
  onDelete: (candidate: CandidateListItem) => void;
  /** Callback for inline updates */
  onUpdateCandidate?: (id: string, updates: Partial<CandidateListItem>) => Promise<void>;
}

type SortField = 'name' | 'stage' | 'role' | 'recruiter' | 'lastActivity';
type SortDirection = 'asc' | 'desc';

// Stage options for EditableSelect
const stageOptions = Object.entries(stageLabels).map(([value, label]) => ({
  value,
  label,
  color: stageColors[value],
}));



export function CandidateTable({
  candidates,
  selectedIds,
  userRole,
  onSelectionChange,
  onChangeStage,
  onScheduleInterview,
  onSendEmail,
  onSendWhatsApp,
  onSendSMS,
  onDelete,
  onUpdateCandidate,
}: CandidateTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>('lastActivity');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const allSelected = candidates.length > 0 && selectedIds.length === candidates.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < candidates.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(candidates.map((c) => c.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCandidates = [...candidates].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'stage':
        comparison = a.stage.localeCompare(b.stage);
        break;
      case 'role':
        comparison = a.role.localeCompare(b.role);
        break;
      case 'recruiter':
        comparison = a.recruiterName.localeCompare(b.recruiterName);
        break;
      case 'lastActivity':
        comparison = new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime();
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown className="h-4 w-4 ml-1 opacity-50" />;
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  // ... existing code ...

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  const handleRowClick = (candidate: CandidateListItem, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('[role="checkbox"]') ||
      target.closest('[data-radix-collection-item]')
    ) {
      return;
    }
    setSelectedCandidateId(candidate.id);
    setSheetOpen(true);
  };



  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Mobile View */}
      <div className="md:hidden">
        <div className="p-3 border-b border-border bg-muted/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={allSelected}
              ref={(el) => {
                if (el) {
                  (el as HTMLButtonElement & { indeterminate: boolean }).indeterminate = someSelected;
                }
              }}
              onCheckedChange={handleSelectAll}
              aria-label="Select all candidates"
            />
            <span className="text-sm font-medium text-muted-foreground">Select All</span>
          </div>
          {/* Add sort dropdown for mobile if needed later */}
        </div>

        <div className="divide-y divide-border">
          {sortedCandidates.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No candidates found</p>
            </div>
          ) : (
            sortedCandidates.map((candidate) => (
              <CandidateMobileCard
                key={candidate.id}
                candidate={candidate}
                isSelected={selectedIds.includes(candidate.id)}
                userRole={userRole}
                onSelect={handleSelectOne}
                onClick={handleRowClick}
                onViewProfile={(c) => router.push(`/candidate/${c.id}`)}
                onScheduleInterview={onScheduleInterview}
                onChangeStage={onChangeStage}
                onSendEmail={onSendEmail}
                onSendWhatsApp={onSendWhatsApp}
                onSendSMS={onSendSMS}
                onDelete={onDelete}
                onUpdateCandidate={onUpdateCandidate}
                stageOptions={stageOptions}
              />
            ))
          )}
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader className="sticky top-0 z-10 bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  ref={(el) => {
                    if (el) {
                      (el as HTMLButtonElement & { indeterminate: boolean }).indeterminate = someSelected;
                    }
                  }}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all candidates"
                />
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center hover:text-foreground transition-colors"
                >
                  Candidate
                  <SortIcon field="name" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('stage')}
                  className="flex items-center hover:text-foreground transition-colors"
                >
                  Stage
                  <SortIcon field="stage" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('role')}
                  className="flex items-center hover:text-foreground transition-colors"
                >
                  Role
                  <SortIcon field="role" />
                </button>
              </TableHead>
              {/* Hidden on mobile: Recruiter */}
              <TableHead className="hidden md:table-cell">
                <button
                  onClick={() => handleSort('recruiter')}
                  className="flex items-center hover:text-foreground transition-colors"
                >
                  Recruiter
                  <SortIcon field="recruiter" />
                </button>
              </TableHead>
              {/* Hidden on mobile: Source */}
              <TableHead className="hidden lg:table-cell">Source</TableHead>
              {/* Hidden on mobile: Status */}
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCandidates.map((candidate) => {
              const isSelected = selectedIds.includes(candidate.id);
              const stageColor = stageColors[candidate.stage] || stageColors.received;

              return (
                <TableRow
                  key={candidate.id}
                  className={cn(
                    'cursor-pointer transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
                    isSelected && 'bg-primary/5'
                  )}
                  onClick={(e) => handleRowClick(candidate, e)}
                >
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleSelectOne(candidate.id)}
                      aria-label={`Select ${candidate.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(candidate.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{candidate.name}</p>
                        <p className="text-sm text-muted-foreground">{candidate.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {onUpdateCandidate && userRole !== 'interviewer' ? (
                      <EditableSelect
                        value={candidate.stage}
                        options={stageOptions}
                        onSave={async (newStage) => {
                          await onUpdateCandidate(candidate.id, { stage: newStage as any });
                        }}
                        fieldName="stage"
                        editable={true}
                      />
                    ) : (
                      <Badge
                        variant="outline"
                        className={cn('cursor-pointer transition-colors', stageColor)}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (userRole !== 'interviewer') {
                            onChangeStage(candidate);
                          }
                        }}
                      >
                        {stageLabels[candidate.stage]}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-foreground">{candidate.role}</span>
                  </TableCell>
                  {/* Hidden on mobile: Recruiter */}
                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">{candidate.recruiterName}</span>
                  </TableCell>
                  {/* Hidden on mobile: Source */}
                  <TableCell className="hidden lg:table-cell">
                    {candidate.source === 'ZOHO_CRM' || candidate.source === 'zoho' ? (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Zoho CRM
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">{candidate.source}</span>
                    )}
                  </TableCell>
                  {/* Hidden on mobile: Status */}
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="secondary" className="font-normal">Active</Badge>
                  </TableCell>
                  <TableCell>
                    <CandidateRowMenu
                      candidate={candidate}
                      userRole={userRole}
                      onViewProfile={(c) => router.push(`/candidate/${c.id}`)}
                      onScheduleInterview={onScheduleInterview}
                      onChangeStage={onChangeStage}
                      onSendEmail={onSendEmail}
                      onSendWhatsApp={onSendWhatsApp}
                      onSendSMS={onSendSMS}
                      onDelete={onDelete}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {sortedCandidates.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No candidates found</p>
          </div>
        )}
      </div>
      <CandidateDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        candidateId={selectedCandidateId}
        onSchedule={(c) => onScheduleInterview(c as CandidateListItem)}
        onEdit={(id) => router.push(`/candidates/${id}/edit`)}
      />
    </div>
  );
}
