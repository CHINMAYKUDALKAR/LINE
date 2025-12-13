"use client";

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarView, CalendarFilters, CalendarEvent } from '@/types/calendar';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarMonthView } from '@/components/calendar/CalendarMonthView';
import { CalendarWeekView } from '@/components/calendar/CalendarWeekView';
import { CalendarDayView } from '@/components/calendar/CalendarDayView';
import { CreateSlotModal } from '@/components/calendar/CreateSlotModal';
import { useSlots, useCancelSlot, useRescheduleSlot } from '@/lib/hooks/useCalendar';
import { slotsToCalendarEvents, getCalendarDateRange } from '@/lib/calendar-utils';
import { useAuth } from '@/lib/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format, addHours } from 'date-fns';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';

export default function Calendar() {
    const { activeTenantId, tenants } = useAuth();
    const activeTenant = tenants.find(t => t.id === activeTenantId);
    const userRole = (activeTenant?.role?.toLowerCase() as any) || 'recruiter';

    const [view, setView] = useState<CalendarView>('week');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [filters, setFilters] = useState<CalendarFilters>({
        interviewerId: 'all',
        stage: 'all',
    });
    const [isCreateSlotOpen, setIsCreateSlotOpen] = useState(false);
    const [selectedSlotDate, setSelectedSlotDate] = useState<Date | undefined>(undefined);
    const [rescheduleEvent, setRescheduleEvent] = useState<CalendarEvent | null>(null);
    const [cancelEvent, setCancelEvent] = useState<CalendarEvent | null>(null);
    const [rescheduleDateTime, setRescheduleDateTime] = useState('');

    // Calculate date range for the current view
    const dateRange = useMemo(() => getCalendarDateRange(currentDate, view), [currentDate, view]);

    // Fetch slots from API
    const {
        data: slotsData,
        isLoading,
        error,
    } = useSlots({
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
    });

    // Cancel and reschedule mutations
    const cancelSlotMutation = useCancelSlot();
    const rescheduleSlotMutation = useRescheduleSlot();

    // Transform slots to calendar events and apply filters
    const filteredEvents = useMemo(() => {
        if (!slotsData?.items) return [];

        const events = slotsToCalendarEvents(slotsData.items);

        return events.filter((event) => {
            if (filters.interviewerId !== 'all' && event.interviewerId !== filters.interviewerId) {
                return false;
            }
            if (filters.stage !== 'all' && event.stage !== filters.stage) {
                return false;
            }
            return true;
        });
    }, [slotsData, filters]);

    const handleEmptySlotClick = (date: Date) => {
        if (userRole === 'interviewer') return;
        setSelectedSlotDate(date);
        setIsCreateSlotOpen(true);
    };

    const handleScheduleClick = () => {
        setSelectedSlotDate(undefined);
        setIsCreateSlotOpen(true);
    };

    const handleReschedule = (event: CalendarEvent) => {
        setRescheduleEvent(event);
        // Pre-fill with new time (1 hour later)
        const currentStart = new Date(event.startTime);
        const suggestedStart = addHours(currentStart, 1);
        setRescheduleDateTime(format(suggestedStart, "yyyy-MM-dd'T'HH:mm"));
    };

    const handleConfirmReschedule = async () => {
        if (!rescheduleEvent || !rescheduleDateTime) return;

        try {
            const newStartAt = new Date(rescheduleDateTime);
            const duration = rescheduleEvent.duration; // in minutes
            const newEndAt = new Date(newStartAt.getTime() + duration * 60000);

            await rescheduleSlotMutation.mutateAsync({
                id: rescheduleEvent.id,
                data: {
                    newStartAt: newStartAt.toISOString(),
                    newEndAt: newEndAt.toISOString(),
                    reason: 'Rescheduled by organizer',
                },
            });

            toast({
                title: 'Interview Rescheduled',
                description: `Interview with ${rescheduleEvent.candidateName} has been rescheduled to ${format(newStartAt, 'PPp')}.`,
            });
            setRescheduleEvent(null);
            setRescheduleDateTime('');
        } catch (err: any) {
            toast({
                title: 'Reschedule Failed',
                description: err.message || 'Could not reschedule the interview.',
                variant: 'destructive',
            });
        }
    };

    const handleCancel = (event: CalendarEvent) => {
        setCancelEvent(event);
    };

    const handleConfirmCancel = async () => {
        if (!cancelEvent) return;

        try {
            await cancelSlotMutation.mutateAsync(cancelEvent.id);

            toast({
                title: 'Interview Cancelled',
                description: `Interview with ${cancelEvent.candidateName} has been cancelled.`,
            });
            setCancelEvent(null);
        } catch (err: any) {
            toast({
                title: 'Cancel Failed',
                description: err.message || 'Could not cancel the interview.',
                variant: 'destructive',
            });
        }
    };

    if (isLoading) {
        return (
            <div className="px-8 py-6 space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-32" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>
                <Skeleton className="h-[600px] w-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="px-8 py-6">
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
                    <h2 className="font-semibold">Failed to load calendar</h2>
                    <p className="text-sm mt-1">{(error as any)?.message || 'Please try again later.'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-8 py-6 h-full flex flex-col">
            <motion.div
                className="flex flex-col h-full space-y-4"
                initial="initial"
                animate="animate"
                variants={staggerContainer}
            >
                <div className="space-y-6">
                    <motion.div variants={fadeInUp}>
                        <CalendarHeader
                            view={view}
                            currentDate={currentDate}
                            filters={filters}
                            userRole={userRole}
                            onViewChange={setView}
                            onDateChange={setCurrentDate}
                            onFiltersChange={setFilters}
                            onScheduleClick={handleScheduleClick}
                        />
                    </motion.div>

                    {view === 'month' && (
                        <CalendarMonthView
                            currentDate={currentDate}
                            events={filteredEvents}
                            userRole={userRole}
                            onEmptySlotClick={handleEmptySlotClick}
                            onReschedule={handleReschedule}
                            onCancel={handleCancel}
                        />
                    )}

                    {view === 'week' && (
                        <CalendarWeekView
                            currentDate={currentDate}
                            events={filteredEvents}
                            userRole={userRole}
                            onEmptySlotClick={handleEmptySlotClick}
                            onReschedule={handleReschedule}
                            onCancel={handleCancel}
                        />
                    )}

                    {view === 'day' && (
                        <CalendarDayView
                            currentDate={currentDate}
                            events={filteredEvents}
                            userRole={userRole}
                            onEmptySlotClick={handleEmptySlotClick}
                            onReschedule={handleReschedule}
                            onCancel={handleCancel}
                        />
                    )}

                    <CreateSlotModal
                        open={isCreateSlotOpen}
                        onOpenChange={setIsCreateSlotOpen}
                        initialDate={selectedSlotDate}
                    />

                    {/* Reschedule Dialog */}
                    <AlertDialog open={!!rescheduleEvent} onOpenChange={() => setRescheduleEvent(null)}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Reschedule Interview</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Reschedule the interview with{' '}
                                    <strong>{rescheduleEvent?.candidateName}</strong>.
                                    Select a new date and time below.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="py-4">
                                <Label htmlFor="reschedule-datetime">New Date & Time</Label>
                                <Input
                                    id="reschedule-datetime"
                                    type="datetime-local"
                                    value={rescheduleDateTime}
                                    onChange={(e) => setRescheduleDateTime(e.target.value)}
                                    className="mt-2"
                                />
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleConfirmReschedule}
                                    disabled={!rescheduleDateTime || rescheduleSlotMutation.isPending}
                                >
                                    {rescheduleSlotMutation.isPending ? 'Rescheduling...' : 'Confirm'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Cancel Confirmation Dialog */}
                    <AlertDialog open={!!cancelEvent} onOpenChange={() => setCancelEvent(null)}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Interview</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to cancel the interview with{' '}
                                    <strong>{cancelEvent?.candidateName}</strong>? This action cannot be undone and all
                                    participants will be notified.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Keep Interview</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleConfirmCancel}
                                    disabled={cancelSlotMutation.isPending}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {cancelSlotMutation.isPending ? 'Cancelling...' : 'Cancel Interview'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </motion.div>
        </div>
    );
}
