import { useState, useEffect, useRef } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CandidateListFilters } from '@/types/candidate-list';
import { mockRecruiters, mockSources } from '@/lib/candidate-list-mock-data';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CandidateFiltersProps {
  filters: CandidateListFilters;
  onFiltersChange: (filters: CandidateListFilters) => void;
}

const stageOptions = [
  { value: 'all', label: 'All Stages' },
  { value: 'received', label: 'Received' },
  { value: 'screening', label: 'Screening' },
  { value: 'interview-1', label: 'Interview 1' },
  { value: 'interview-2', label: 'Interview 2' },
  { value: 'hr-round', label: 'HR Round' },
  { value: 'offer', label: 'Offer' },
];

const experienceOptions = [
  { value: 'all', label: 'Any Experience' },
  { value: '0-2', label: '0-2 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '6-8', label: '6-8 years' },
  { value: '9+', label: '9+ years' },
];

export function CandidateFilters({ filters, onFiltersChange }: CandidateFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search);

  // Use refs to store latest values to avoid stale closures
  const filtersRef = useRef(filters);
  const onFiltersChangeRef = useRef(onFiltersChange);

  // Keep refs updated
  useEffect(() => {
    filtersRef.current = filters;
    onFiltersChangeRef.current = onFiltersChange;
  });

  // Debounce search update - uses refs to avoid re-running on filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filtersRef.current.search) {
        onFiltersChangeRef.current({ ...filtersRef.current, search: searchValue });
      }
    }, 500); // Increased debounce to 500ms for better UX

    return () => clearTimeout(timer);
  }, [searchValue]); // Only re-run when searchValue changes

  const hasActiveFilters =
    filters.stage !== 'all' ||
    filters.source !== 'all' ||
    filters.recruiterId !== 'all' ||
    filters.experienceMin !== null ||
    filters.dateAddedFrom !== null;

  const clearFilters = () => {
    onFiltersChange({
      ...filters,
      search: '', // Also clear search
      stage: 'all',
      source: 'all',
      recruiterId: 'all',
      experienceMin: null,
      experienceMax: null,
      dateAddedFrom: null,
      dateAddedTo: null,
    });
    setSearchValue(''); // Clear local state immediately
  };

  const handleExperienceChange = (value: string) => {
    if (value === 'all') {
      onFiltersChange({ ...filters, experienceMin: null, experienceMax: null });
    } else if (value === '9+') {
      onFiltersChange({ ...filters, experienceMin: 9, experienceMax: null });
    } else {
      const [min, max] = value.split('-').map(Number);
      onFiltersChange({ ...filters, experienceMin: min, experienceMax: max });
    }
  };

  const getExperienceValue = () => {
    if (filters.experienceMin === null) return 'all';
    if (filters.experienceMin === 9) return '9+';
    return `${filters.experienceMin}-${filters.experienceMax}`;
  };

  const activeFilterChips = [];
  if (filters.search) {
    activeFilterChips.push({
      key: 'search',
      label: `Search: ${filters.search}`,
      onRemove: () => {
        setSearchValue('');
        onFiltersChange({ ...filters, search: '' });
      },
    });
  }
  if (filters.stage !== 'all') {
    activeFilterChips.push({
      key: 'stage',
      label: stageOptions.find((s) => s.value === filters.stage)?.label || filters.stage,
      onRemove: () => onFiltersChange({ ...filters, stage: 'all' }),
    });
  }
  if (filters.source !== 'all') {
    activeFilterChips.push({
      key: 'source',
      label: filters.source,
      onRemove: () => onFiltersChange({ ...filters, source: 'all' }),
    });
  }
  if (filters.recruiterId !== 'all') {
    activeFilterChips.push({
      key: 'recruiter',
      label: mockRecruiters.find((r) => r.id === filters.recruiterId)?.name || 'Recruiter',
      onRemove: () => onFiltersChange({ ...filters, recruiterId: 'all' }),
    });
  }
  if (filters.experienceMin !== null) {
    activeFilterChips.push({
      key: 'experience',
      label: experienceOptions.find((e) => e.value === getExperienceValue())?.label || 'Experience',
      onRemove: () => onFiltersChange({ ...filters, experienceMin: null, experienceMax: null }),
    });
  }
  if (filters.dateAddedFrom) {
    activeFilterChips.push({
      key: 'dateAdded',
      label: `Added after ${format(filters.dateAddedFrom, 'MMM d')}`,
      onRemove: () => onFiltersChange({ ...filters, dateAddedFrom: null, dateAddedTo: null }),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone, or skills..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.stage}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, stage: value as CandidateListFilters['stage'] })
            }
          >
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {stageOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.source}
            onValueChange={(value) => onFiltersChange({ ...filters, source: value })}
          >
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">All Sources</SelectItem>
              {mockSources.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.recruiterId}
            onValueChange={(value) => onFiltersChange({ ...filters, recruiterId: value })}
          >
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Recruiter" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">All Recruiters</SelectItem>
              {mockRecruiters.map((recruiter) => (
                <SelectItem key={recruiter.id} value={recruiter.id}>
                  {recruiter.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={getExperienceValue()} onValueChange={handleExperienceChange}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Experience" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {experienceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 bg-background">
                <Filter className="h-4 w-4" />
                Date Added
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover" align="end">
              <Calendar
                mode="range"
                selected={{
                  from: filters.dateAddedFrom || undefined,
                  to: filters.dateAddedTo || undefined,
                }}
                onSelect={(range) =>
                  onFiltersChange({
                    ...filters,
                    dateAddedFrom: range?.from || null,
                    dateAddedTo: range?.to || null,
                  })
                }
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilterChips.map((chip) => (
            <Badge
              key={chip.key}
              variant="secondary"
              className="gap-1 pr-1 text-sm font-normal"
            >
              {chip.label}
              <button
                onClick={chip.onRemove}
                className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
