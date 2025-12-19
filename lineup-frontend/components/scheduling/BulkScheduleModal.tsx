'use client';

import { useState, useEffect, useMemo } from 'react';
import { Loader2, Calendar, Users, Clock, Zap, Info, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useCandidates, Candidate } from '@/lib/hooks/useCandidates';
import { useBulkSchedule, useInterviewers } from '@/lib/hooks/useInterviews';

const DURATIONS = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
];

type ScheduleStrategy = 'AUTO' | 'SAME_TIME' | 'PER_CANDIDATE';

interface BulkScheduleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    preSelectedCandidateIds?: string[];
}

export function BulkScheduleModal({
    open,
    onOpenChange,
    onSuccess,
    preSelectedCandidateIds = [],
}: BulkScheduleModalProps) {
    const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>(preSelectedCandidateIds);
    const [selectedInterviewerIds, setSelectedInterviewerIds] = useState<string[]>([]);
    const [duration, setDuration] = useState(30);
    const [strategy, setStrategy] = useState<ScheduleStrategy>('AUTO');
    const [scheduledTime, setScheduledTime] = useState('');
    const [rangeStart, setRangeStart] = useState('');
    const [rangeEnd, setRangeEnd] = useState('');
    const [stage, setStage] = useState('interview');
    const [candidateSearch, setCandidateSearch] = useState('');

    const { data: candidatesData, isLoading: loadingCandidates } = useCandidates({ perPage: 100 });
    const { data: interviewersData, isLoading: loadingInterviewers } = useInterviewers();
    const bulkSchedule = useBulkSchedule();

    const candidates = candidatesData?.data || [];
    const interviewers = interviewersData || [];

    // Filter candidates based on search
    const filteredCandidates = useMemo(() => {
        if (!candidateSearch.trim()) return candidates;
        const searchLower = candidateSearch.toLowerCase();
        return candidates.filter((c: Candidate) =>
            c.name?.toLowerCase().includes(searchLower) ||
            c.email?.toLowerCase().includes(searchLower) ||
            c.stage?.toLowerCase().includes(searchLower)
        );
    }, [candidates, candidateSearch]);

    useEffect(() => {
        if (preSelectedCandidateIds.length > 0) {
            setSelectedCandidateIds(preSelectedCandidateIds);
        }
    }, [preSelectedCandidateIds]);

    const toggleCandidate = (id: string) => {
        setSelectedCandidateIds(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const toggleInterviewer = (id: string) => {
        setSelectedInterviewerIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectAllCandidates = () => {
        // Select all filtered candidates (respects search)
        setSelectedCandidateIds(prev => {
            const filteredIds = filteredCandidates.map((c: Candidate) => c.id);
            const newSelection = new Set([...prev, ...filteredIds]);
            return Array.from(newSelection);
        });
    };

    const clearCandidates = () => {
        setSelectedCandidateIds([]);
    };

    const handleSchedule = async () => {
        if (selectedCandidateIds.length === 0) {
            toast.error('Please select at least one candidate');
            return;
        }
        if (selectedInterviewerIds.length === 0) {
            toast.error('Please select at least one interviewer');
            return;
        }
        if (strategy === 'SAME_TIME' && !scheduledTime) {
            toast.error('Please select a time for SAME_TIME strategy');
            return;
        }

        try {
            const result = await bulkSchedule.mutateAsync({
                candidateIds: selectedCandidateIds,
                interviewerIds: selectedInterviewerIds,
                durationMins: duration,
                strategy,
                stage,
                scheduledTime: strategy === 'SAME_TIME' || strategy === 'PER_CANDIDATE' ? scheduledTime : undefined,
                rangeStart: strategy === 'AUTO' ? rangeStart || undefined : undefined,
                rangeEnd: strategy === 'AUTO' ? rangeEnd || undefined : undefined,
            });

            toast.success(`Scheduled ${result.scheduled} interviews successfully`);
            if (result.failed > 0) {
                toast.warning(`${result.failed} interviews failed to schedule`);
            }
            handleClose();
            onSuccess?.();
        } catch (error) {
            toast.error('Failed to schedule interviews');
        }
    };

    const handleClose = () => {
        setSelectedCandidateIds([]);
        setSelectedInterviewerIds([]);
        setDuration(30);
        setStrategy('AUTO');
        setScheduledTime('');
        setRangeStart('');
        setRangeEnd('');
        onOpenChange(false);
    };

    const isValid = selectedCandidateIds.length > 0 && selectedInterviewerIds.length > 0;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="w-screen h-[100dvh] max-w-none sm:max-w-[800px] sm:h-auto sm:max-h-[90vh] sm:rounded-lg overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Bulk Schedule Interviews
                    </DialogTitle>
                    <DialogDescription>
                        Schedule interviews for multiple candidates at once
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-auto space-y-6 py-4">
                    {/* Candidates Selection */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Candidates ({selectedCandidateIds.length} selected)
                            </Label>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={selectAllCandidates}>
                                    Select All
                                </Button>
                                <Button variant="ghost" size="sm" onClick={clearCandidates}>
                                    Clear
                                </Button>
                            </div>
                        </div>
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search candidates by name, email, or stage..."
                                value={candidateSearch}
                                onChange={(e) => setCandidateSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <ScrollArea className="h-[150px] border rounded-lg p-2">
                            {loadingCandidates ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : filteredCandidates.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    {candidateSearch ? 'No candidates match your search' : 'No candidates found'}
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {filteredCandidates.map((candidate: Candidate) => (
                                        <div
                                            key={candidate.id}
                                            className="flex items-center space-x-2 p-2 hover:bg-accent rounded cursor-pointer"
                                            onClick={() => toggleCandidate(candidate.id)}
                                        >
                                            <Checkbox
                                                checked={selectedCandidateIds.includes(candidate.id)}
                                                onCheckedChange={() => toggleCandidate(candidate.id)}
                                            />
                                            <span className="flex-1">{candidate.name}</span>
                                            {candidate.email && (
                                                <span className="text-sm text-muted-foreground">
                                                    {candidate.email}
                                                </span>
                                            )}
                                            <Badge variant="outline">{candidate.stage}</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Interviewers Selection */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Interviewers ({selectedInterviewerIds.length} selected)
                        </Label>
                        <ScrollArea className="h-[120px] border rounded-lg p-2">
                            {loadingInterviewers ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : interviewers.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No interviewers found
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {interviewers.map((interviewer: any) => (
                                        <div
                                            key={interviewer.id}
                                            className="flex items-center space-x-2 p-2 hover:bg-accent rounded cursor-pointer"
                                            onClick={() => toggleInterviewer(interviewer.id)}
                                        >
                                            <Checkbox
                                                checked={selectedInterviewerIds.includes(interviewer.id)}
                                                onCheckedChange={() => toggleInterviewer(interviewer.id)}
                                            />
                                            <span className="flex-1">{interviewer.name}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {interviewer.email}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Duration & Stage */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Duration
                            </Label>
                            <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {DURATIONS.map((d) => (
                                        <SelectItem key={d.value} value={String(d.value)}>
                                            {d.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Stage</Label>
                            <Select value={stage} onValueChange={setStage}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="screening">Screening</SelectItem>
                                    <SelectItem value="interview">Interview</SelectItem>
                                    <SelectItem value="technical">Technical</SelectItem>
                                    <SelectItem value="final">Final Round</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Strategy Selection */}
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Scheduling Strategy
                        </Label>
                        <RadioGroup value={strategy} onValueChange={(v) => setStrategy(v as ScheduleStrategy)}>
                            <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                                <RadioGroupItem value="AUTO" id="auto" />
                                <div className="flex-1">
                                    <Label htmlFor="auto" className="cursor-pointer font-medium">
                                        Auto Schedule
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Automatically spread interviews across available times
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                                <RadioGroupItem value="SAME_TIME" id="same" />
                                <div className="flex-1">
                                    <Label htmlFor="same" className="cursor-pointer font-medium">
                                        Same Time
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        All candidates interview at the same time (panel interview)
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                                <RadioGroupItem value="PER_CANDIDATE" id="sequential" />
                                <div className="flex-1">
                                    <Label htmlFor="sequential" className="cursor-pointer font-medium">
                                        Sequential
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Back-to-back interviews for each candidate
                                    </p>
                                </div>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Strategy-specific options */}
                    {strategy === 'SAME_TIME' && (
                        <div className="space-y-2">
                            <Label>Schedule Time</Label>
                            <Input
                                type="datetime-local"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                            />
                        </div>
                    )}

                    {strategy === 'PER_CANDIDATE' && (
                        <div className="space-y-2">
                            <Label>Start Time</Label>
                            <Input
                                type="datetime-local"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                            />
                            <p className="text-sm text-muted-foreground">
                                Interviews will be scheduled sequentially with 15 min breaks
                            </p>
                        </div>
                    )}

                    {strategy === 'AUTO' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>From</Label>
                                <Input
                                    type="datetime-local"
                                    value={rangeStart}
                                    onChange={(e) => setRangeStart(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>To</Label>
                                <Input
                                    type="datetime-local"
                                    value={rangeEnd}
                                    onChange={(e) => setRangeEnd(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Summary */}
                    {isValid && (
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>Ready to schedule</AlertTitle>
                            <AlertDescription>
                                {selectedCandidateIds.length} candidate(s) × {selectedInterviewerIds.length} interviewer(s) × {duration} min
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSchedule} disabled={!isValid || bulkSchedule.isPending}>
                        {bulkSchedule.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Scheduling...
                            </>
                        ) : (
                            `Schedule ${selectedCandidateIds.length} Interview${selectedCandidateIds.length > 1 ? 's' : ''}`
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
