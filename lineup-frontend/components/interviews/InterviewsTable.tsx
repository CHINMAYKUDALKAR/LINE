import { useState } from 'react';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CalendarEvent } from '@/types/calendar';
import { InterviewRowActions } from './InterviewRowActions';
import { UserRole } from '@/types/navigation';
import { cn } from '@/lib/utils';
import { Ban, CalendarClock } from 'lucide-react';

interface InterviewsTableProps {
    events: CalendarEvent[];
    userRole: UserRole;
    onAction: (action: string, event: CalendarEvent) => void;
    onBulkAction: (action: string, eventIds: string[]) => void;
    isLoading?: boolean;
}

const stageColors: Record<string, string> = {
    received: 'bg-slate-100 text-slate-700 border-slate-200',
    screening: 'bg-blue-100 text-blue-700 border-blue-200',
    'interview-1': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'interview-2': 'bg-violet-100 text-violet-700 border-violet-200',
    'hr-round': 'bg-amber-100 text-amber-700 border-amber-200',
    offer: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const statusColors: Record<string, string> = {
    scheduled: 'bg-sky-100 text-sky-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    'no-show': 'bg-orange-100 text-orange-700',
};

export function InterviewsTable({
    events,
    userRole,
    onAction,
    onBulkAction,
    isLoading,
}: InterviewsTableProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleSelectAll = () => {
        if (selectedIds.size === events.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(events.map((e) => e.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-10 bg-muted/20 rounded-md w-full animate-pulse" />
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted/10 rounded-md w-full animate-pulse" />
                ))}
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="text-center py-12 bg-muted/10 rounded-lg border border-dashed border-border">
                <p className="text-muted-foreground">No interviews found matching your criteria.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Bulk Actions Bar */}
            {selectedIds.size > 0 && (
                <div className="bg-primary/5 border border-primary/20 px-4 py-2 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <span className="text-sm font-medium text-primary">
                        {selectedIds.size} selected
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-primary/20 hover:bg-primary/10 text-primary"
                            onClick={() => onBulkAction('reschedule', Array.from(selectedIds))}
                        >
                            <CalendarClock className="w-3.5 h-3.5 mr-2" />
                            Reschedule
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-destructive/20 hover:bg-destructive/10 text-destructive hover:text-destructive"
                            onClick={() => onBulkAction('cancel', Array.from(selectedIds))}
                        >
                            <Ban className="w-3.5 h-3.5 mr-2" />
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            <div className="rounded-md border border-border bg-card overflow-hidden">
                {/* Responsive: horizontal scroll on mobile */}
                <div className="overflow-x-auto">
                    <Table className="min-w-[700px]">
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="w-[40px] pl-4">
                                    <Checkbox
                                        checked={selectedIds.size === events.length && events.length > 0}
                                        onCheckedChange={toggleSelectAll}
                                        aria-label="Select all"
                                    />
                                </TableHead>
                                <TableHead>Candidate</TableHead>
                                {/* Hidden on mobile: Interviewer */}
                                <TableHead className="hidden md:table-cell">Interviewer</TableHead>
                                <TableHead>Date & Time</TableHead>
                                {/* Hidden on smaller screens: Stage */}
                                <TableHead className="hidden sm:table-cell">Stage</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {events.map((event) => (
                                <TableRow
                                    key={event.id}
                                    className={cn(
                                        selectedIds.has(event.id) && "bg-primary/5 hover:bg-primary/10"
                                    )}
                                >
                                    <TableCell className="pl-4">
                                        <Checkbox
                                            checked={selectedIds.has(event.id)}
                                            onCheckedChange={() => toggleSelect(event.id)}
                                            aria-label={`Select ${event.candidateName}`}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 bg-primary/10 text-primary">
                                                <AvatarFallback>
                                                    {event.candidateName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium text-sm">{event.candidateName}</div>
                                                <div className="text-xs text-muted-foreground">{event.role}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    {/* Hidden on mobile: Interviewer */}
                                    <TableCell className="hidden md:table-cell">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                                                {event.interviewerInitials}
                                            </div>
                                            <span className="text-sm text-muted-foreground">{event.interviewerName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">
                                                {format(new Date(event.startTime), 'MMM d, yyyy')}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(event.startTime), 'h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}
                                            </span>
                                        </div>
                                    </TableCell>
                                    {/* Hidden on smaller screens: Stage */}
                                    <TableCell className="hidden sm:table-cell">
                                        <Badge
                                            variant="outline"
                                            className={cn("font-normal capitalize", stageColors[event.stage])}
                                        >
                                            {event.stage.replace('-', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="secondary"
                                            className={cn("font-normal capitalize", statusColors[event.status])}
                                        >
                                            {event.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <InterviewRowActions
                                            event={event}
                                            onAction={onAction}
                                            disabled={userRole === 'interviewer'}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination (Simple placeholder for now) */}
            <div className="flex items-center justify-between px-2">
                <p className="text-sm text-muted-foreground">
                    Showing {events.length} results
                </p>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled>Previous</Button>
                    <Button variant="outline" size="sm" disabled>Next</Button>
                </div>
            </div>
        </div>
    );
}
