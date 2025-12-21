"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { KPICards } from '@/components/dashboard/KPICard';
import { StagePipeline } from '@/components/dashboard/StagePipeline';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { InterviewTable } from '@/components/dashboard/InterviewTable';
import { ScheduleInterviewModal } from '@/components/scheduling/ScheduleInterviewModal';
import { AddCandidateModal } from '@/components/candidates/AddCandidateModal';
import { UploadCandidatesModal } from '@/components/candidates/UploadCandidatesModal';
import { BulkScheduleModal } from '@/components/scheduling/BulkScheduleModal';
import { useToast } from '@/hooks/use-toast';
import { InterviewStage, InterviewStatus } from '@/types/interview';
import { getOverview, getFunnel } from '@/lib/api/reports';
import { getInterviews } from '@/lib/api/interviews';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';

// Types for dashboard data
type Metrics = {
    scheduledToday: number;
    scheduledTodayTrend: number;
    pendingFeedback: number;
    pendingFeedbackTrend: number;
    completed: number;
    completedTrend: number;
    noShows: number;
    noShowsTrend: number;
};

type StageCount = {
    stage: InterviewStage;
    label: string;
    count: number;
    pending: number;
    completed: number;
};

type Interview = {
    id: string;
    candidateId: string;
    candidateName: string;
    candidateEmail: string;
    interviewerName: string;
    interviewerEmail: string;
    role: string;
    dateTime: string;
    stage: InterviewStage;
    status: InterviewStatus;
    tenantId: string;
};

const emptyMetrics: Metrics = {
    scheduledToday: 0,
    scheduledTodayTrend: 0,
    pendingFeedback: 0,
    pendingFeedbackTrend: 0,
    completed: 0,
    completedTrend: 0,
    noShows: 0,
    noShowsTrend: 0,
};

const Dashboard = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [activeStage, setActiveStage] = useState<InterviewStage | undefined>();
    const [activeKPIFilter, setActiveKPIFilter] = useState<string | undefined>();

    // Data states - initialize with empty data, not mock data
    const [metrics, setMetrics] = useState<Metrics>(emptyMetrics);
    const [stageCounts, setStageCounts] = useState<StageCount[]>([]);
    const [interviews, setInterviews] = useState<Interview[]>([]);

    // Modal states
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [addCandidateModalOpen, setAddCandidateModalOpen] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [bulkScheduleModalOpen, setBulkScheduleModalOpen] = useState(false);

    const { toast } = useToast();

    const loadDashboardData = useCallback(async () => {
        setIsLoading(true);
        setHasError(false);

        try {
            // Try to fetch real data from APIs
            const [overviewData, funnelData, interviewsData] = await Promise.allSettled([
                getOverview(),
                getFunnel(),
                getInterviews({ perPage: 50 }), // Fetch all statuses for client-side filtering
            ]);

            // Process overview data for KPI cards
            if (overviewData.status === 'fulfilled') {
                const overview = overviewData.value;
                setMetrics({
                    scheduledToday: overview.activeInterviews || 0,
                    scheduledTodayTrend: 0,
                    pendingFeedback: overview.pendingFeedback || 0,
                    pendingFeedbackTrend: 0,
                    completed: overview.completedThisWeek || 0,
                    completedTrend: 0,
                    noShows: 0,
                    noShowsTrend: 0,
                });
            }

            // Process funnel data for stage pipeline
            if (funnelData.status === 'fulfilled') {
                const funnel = funnelData.value;
                // Normalize funnel stages to match interview stage format (lowercase-hyphenated)
                const normalizeStage = (stage: string): string => {
                    if (!stage) return 'interview-1';
                    return stage.toLowerCase().replace(/_/g, '-');
                };

                // Aggregate counts by normalized stage to avoid duplicate keys
                const aggregatedStages = funnel.reduce((acc, s) => {
                    const normalizedStage = normalizeStage(s.stage) as InterviewStage;

                    if (!acc[normalizedStage]) {
                        acc[normalizedStage] = {
                            stage: normalizedStage,
                            // Ensure label is nicely formatted (Title Case) regardless of input casing
                            label: s.stage.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                            count: 0,
                            pending: 0,
                            completed: 0,
                        };
                    }

                    acc[normalizedStage].count += s.count;
                    // Distribute pending/completed counts roughly 50/50 as per original logic
                    acc[normalizedStage].pending += Math.floor(s.count / 2);
                    acc[normalizedStage].completed += Math.ceil(s.count / 2);

                    return acc;
                }, {} as Record<InterviewStage, StageCount>);

                const newStageCounts = Object.values(aggregatedStages);

                if (newStageCounts.length > 0) {
                    setStageCounts(newStageCounts);
                }
            }

            // Process interviews data
            if (interviewsData.status === 'fulfilled') {
                const data = interviewsData.value;

                // Helper to convert backend status to frontend format
                const normalizeStatus = (status: string): string => {
                    const statusMap: Record<string, string> = {
                        'SCHEDULED': 'scheduled',
                        'COMPLETED': 'completed',
                        'CANCELLED': 'cancelled',
                        'NO_SHOW': 'no-show',
                        'PENDING_FEEDBACK': 'pending-feedback',
                        'RESCHEDULED': 'scheduled', // Map rescheduled to scheduled
                    };
                    return statusMap[status?.toUpperCase()] || status?.toLowerCase() || 'scheduled';
                };

                // Simple stage normalization - backend uses uppercase, frontend displays lowercase-hyphenated
                const normalizeStage = (stage: string): string => {
                    if (!stage) return 'interview-1';
                    // Convert INTERVIEW_1 → interview-1, HR_ROUND → hr-round, etc.
                    return stage.toLowerCase().replace(/_/g, '-');
                };

                const mappedInterviews = data.data.map((i: any) => ({
                    id: i.id,
                    candidateId: i.candidateId,
                    candidateName: i.candidateName || i.candidate?.name || 'Unknown',
                    candidateEmail: i.candidateEmail || i.candidate?.email || '',
                    interviewerName: i.interviewers?.[0]?.name || '',
                    interviewerEmail: i.interviewers?.[0]?.email || '',
                    role: i.roleTitle || i.stage || 'Interview',
                    dateTime: i.date,
                    stage: normalizeStage(i.stage) as InterviewStage,
                    status: normalizeStatus(i.status) as any,
                    tenantId: i.tenantId,
                }));
                setInterviews(mappedInterviews);
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    const handleKPIClick = (filter: string) => {
        const newFilter = activeKPIFilter === filter ? undefined : filter;
        setActiveKPIFilter(newFilter);

        if (newFilter) {
            setActiveStage(undefined);
        }

        toast({
            title: newFilter ? `Filtering by: ${filter}` : 'Filter cleared',
            description: newFilter ? 'Showing filtered interviews' : 'Showing all interviews'
        });
    };

    const handleStageClick = (stage: InterviewStage) => {
        const newStage = activeStage === stage ? undefined : stage;
        setActiveStage(newStage);

        if (newStage) {
            setActiveKPIFilter(undefined);
        }

        toast({
            title: newStage ? `Stage: ${stage}` : 'Filter cleared',
            description: newStage ? 'Filtering by stage' : 'Showing all stages'
        });
    };

    const handleRetry = () => {
        loadDashboardData();
        toast({ title: 'Retrying...', description: 'Attempting to reload data.' });
    };

    const handleModalSuccess = (action: string) => {
        toast({ title: 'Success!', description: `${action} completed successfully.` });
        loadDashboardData(); // Refresh data after successful action
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 h-full">
            <motion.main
                initial="initial"
                animate="animate"
                variants={staggerContainer}
            >
                {/* Page Header */}
                <motion.div
                    variants={fadeInUp}
                    className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6"
                >
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Interview Dashboard</h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 hidden sm:block">
                            Manage and track all interviews across your hiring pipeline
                        </p>
                    </div>
                    <QuickActions
                        onSchedule={() => setScheduleModalOpen(true)}
                        onBulkSchedule={() => setBulkScheduleModalOpen(true)}
                        onAddCandidate={() => setAddCandidateModalOpen(true)}
                        onUpload={() => setUploadModalOpen(true)}
                    />
                </motion.div>

                {/* KPI Section */}
                <motion.div variants={staggerItem} className="mb-8">
                    <KPICards
                        metrics={metrics}
                        isLoading={isLoading}
                        onCardClick={handleKPIClick}
                    />
                </motion.div>

                {/* Pipeline Section */}
                <motion.div variants={staggerItem} className="mb-8">
                    <StagePipeline
                        stages={stageCounts}
                        activeStage={activeStage}
                        isLoading={isLoading}
                        onStageClick={handleStageClick}
                    />
                </motion.div>

                {/* Table Section */}
                <motion.section variants={staggerItem}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-base sm:text-lg font-semibold text-foreground">Upcoming Interviews</h2>
                            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">View and manage scheduled interviews</p>
                        </div>
                    </div>
                    <InterviewTable
                        interviews={interviews}
                        isLoading={isLoading}
                        hasError={hasError}
                        onRetry={handleRetry}
                        initialStageFilter={activeStage}
                        initialKPIFilter={activeKPIFilter}
                        onAction={(action, interview) => {
                            toast({
                                title: `${action} action`,
                                description: `Action on ${interview.candidateName}`
                            });
                        }}
                    />
                </motion.section>
            </motion.main>

            {/* Modals */}
            <ScheduleInterviewModal
                open={scheduleModalOpen}
                onOpenChange={setScheduleModalOpen}
                onSuccess={() => handleModalSuccess('Interview scheduled')}
            />

            <AddCandidateModal
                open={addCandidateModalOpen}
                onOpenChange={setAddCandidateModalOpen}
                onSuccess={() => handleModalSuccess('Candidate added')}
            />

            <UploadCandidatesModal
                open={uploadModalOpen}
                onOpenChange={setUploadModalOpen}
                onSuccess={() => handleModalSuccess('Candidates imported')}
            />

            <BulkScheduleModal
                open={bulkScheduleModalOpen}
                onOpenChange={setBulkScheduleModalOpen}
                onSuccess={() => handleModalSuccess('Interviews scheduled')}
            />
        </div>
    );
};

export default Dashboard;
