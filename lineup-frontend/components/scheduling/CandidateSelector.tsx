import { useState } from 'react';
import { Search, FileText, Check, User, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Candidate } from '@/types/scheduling';

interface CandidateSelectorProps {
  candidates: Candidate[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  isLoading?: boolean;
  error?: string;
}

export function CandidateSelector({
  candidates,
  selectedIds,
  onSelectionChange,
  isLoading,
  error,
}: CandidateSelectorProps) {
  const [search, setSearch] = useState('');

  const filteredCandidates = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase())
  );

  const toggleCandidate = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const selectedCandidates = candidates.filter((c) => selectedIds.includes(c.id));

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-destructive/10 p-3 mb-3">
          <X className="h-6 w-6 text-destructive" />
        </div>
        <p className="text-sm text-destructive font-medium">Failed to load candidates</p>
        <p className="text-xs text-muted-foreground mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-background border-border"
        />
      </div>

      {/* Selected Candidates Mini Cards */}
      {selectedCandidates.length > 0 && (
        <div className="space-y-2 flex-shrink-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Selected ({selectedCandidates.length})
          </p>
          <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-2">
            {selectedCandidates.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 text-sm"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.role} • {c.stage}</p>
                </div>
                <button
                  onClick={() => toggleCandidate(c.id)}
                  className="p-1 hover:bg-primary/10 rounded transition-colors"
                  aria-label={`Remove ${c.name}`}
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Candidate List */}
      <div className="flex-1 min-h-0 flex flex-col pt-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex-shrink-0">
          All Candidates
        </p>
        <ScrollArea className="flex-1 min-h-0 rounded-lg border border-border bg-background">
          {isLoading ? (
            <div className="p-3 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <User className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No candidates found</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting your search</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredCandidates.map((candidate) => {
                const isSelected = selectedIds.includes(candidate.id);
                return (
                  <button
                    key={candidate.id}
                    onClick={() => toggleCandidate(candidate.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 text-left transition-all',
                      'hover:bg-accent/50 focus:bg-accent/50 focus:outline-none',
                      isSelected && 'bg-primary/5'
                    )}
                  >
                    {/* Selection indicator */}
                    <div
                      className={cn(
                        'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                        isSelected
                          ? 'bg-primary border-primary'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>

                    {/* Avatar */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <span className="text-sm font-medium text-secondary-foreground">
                        {candidate.name.split(' ').map((n) => n[0]).join('')}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground truncate">{candidate.name}</p>
                        {candidate.hasResume && (
                          <FileText className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{candidate.email}</p>
                    </div>

                    {/* Stage Badge */}
                    <Badge variant="secondary" className="flex-shrink-0 text-xs">
                      {candidate.stage}
                    </Badge>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
