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
import { mockMetrics, mockStageCounts, mockInterviews } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { InterviewStage } from '@/types/interview';
import { Separator } from '@/components/ui/separator';
import { getOverview, getFunnel } from '@/lib/api/reports';
import { getInterviews } from '@/lib/api/interviews';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';

const Dashboard = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [activeStage, setActiveStage] = useState<InterviewStage | undefined>();
    const [activeKPIFilter, setActiveKPIFilter] = useState<string | undefined>();

    // Data states
    const [metrics, setMetrics] = useState(mockMetrics);
    const [stageCounts, setStageCounts] = useState(mockStageCounts);
    const [interviews, setInterviews] = useState(mockInterviews);

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
                getInterviews({ perPage: 10 }),
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
                const newStageCounts = funnel.map(s => ({
                    stage: s.stage as InterviewStage,
                    label: s.stage.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()),
                    count: s.count,
                    pending: Math.floor(s.count / 2),
                    completed: Math.ceil(s.count / 2),
                }));
                if (newStageCounts.length > 0) {
                    setStageCounts(newStageCounts);
                }
            }

            // Process interviews data
            if (interviewsData.status === 'fulfilled') {
                const data = interviewsData.value;
                const mappedInterviews = data.data.map((i) => ({
                    id: i.id,
                    candidateId: i.candidateId,
                    candidateName: i.candidateName || 'Unknown',
                    candidateEmail: i.candidateEmail || '',
                    interviewerName: i.interviewers[0]?.name || '',
                    interviewerEmail: i.interviewers[0]?.email || '',
                    role: i.roleTitle || '',
                    dateTime: i.date,
                    stage: i.stage as InterviewStage,
                    status: i.status as any,
                    tenantId: i.tenantId,
                }));
                if (mappedInterviews.length > 0) {
                    setInterviews(mappedInterviews);
                }
            }
        } catch (error) {
            console.warn('Failed to load dashboard data, using mock data:', error);
            // Keep mock data on error
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
        <div className="px-8 py-6 h-full">
            <motion.main
                initial="initial"
                animate="animate"
                variants={staggerContainer}
            >
                {/* Page Header */}
                <motion.div
                    variants={fadeInUp}
                    className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6"
                >
                    <div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">Interview Dashboard</h1>
                        <p className="text-sm text-muted-foreground mt-1">
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
                <motion.div variants={staggerItem}>
                    <KPICards
                        metrics={metrics}
                        isLoading={isLoading}
                        onCardClick={handleKPIClick}
                    />
                </motion.div>

                <Separator className="my-6" />

                {/* Pipeline Section */}
                <motion.div variants={staggerItem}>
                    <StagePipeline
                        stages={stageCounts}
                        activeStage={activeStage}
                        isLoading={isLoading}
                        onStageClick={handleStageClick}
                    />
                </motion.div>

                <Separator className="my-6" />

                {/* Table Section */}
                <motion.section variants={staggerItem}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Upcoming Interviews</h2>
                            <p className="text-sm text-muted-foreground">View and manage scheduled interviews</p>
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
