"use client";

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CandidateListHeader, ViewType } from '@/components/candidates/CandidateListHeader';
import { CandidateFilters } from '@/components/candidates/CandidateFilters';
import { CandidateTable } from '@/components/candidates/CandidateTable';
import { CandidateBoard } from '@/components/candidates/CandidateBoard';
import { SendMessageDialog, MessageChannel } from '@/components/candidates/SendMessageDialog';
import { ScheduleInterviewModal } from '@/components/scheduling/ScheduleInterviewModal';
import { CandidateListFilters, CandidateBulkAction, CandidateListItem } from '@/types/candidate-list';
import { currentUserRole } from '@/lib/navigation-mock-data';
import { toast } from '@/hooks/use-toast';
import { useCandidates, useDeleteCandidate, useUpdateCandidate } from '@/lib/hooks/useCandidates';
import { InterviewStage } from '@/types/interview';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { QuickActionsToolbar, QUICK_ACTIONS } from '@/components/ui/quick-actions-toolbar';
import { Mail, MessageSquare, Calendar, Trash2 } from 'lucide-react';
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

export default function Candidates() {
    const [filters, setFilters] = useState<CandidateListFilters>({
        search: '',
        stage: 'all',
        source: 'all',
        recruiterId: 'all',
        experienceMin: null,
        experienceMax: null,
        dateAddedFrom: null,
        dateAddedTo: null,
    });
    const [view, setView] = useState<ViewType>('list');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [deleteCandidate, setDeleteCandidate] = useState<CandidateListItem | null>(null);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const deleteCandidateMutation = useDeleteCandidate();
    const updateCandidateMutation = useUpdateCandidate();

    // Message dialog state
    const [messageDialogOpen, setMessageDialogOpen] = useState(false);
    const [messageCandidate, setMessageCandidate] = useState<CandidateListItem | null>(null);
    const [messageChannel, setMessageChannel] = useState<MessageChannel>('EMAIL');

    // Pagination state
    const [page, setPage] = useState(1);
    const perPage = 25;

    // Bulk delete loading state (separate from deleteCandidateMutation)
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    // Use real API data with pagination
    const { data: candidatesData, isLoading } = useCandidates({
        page,
        perPage,
        q: filters.search || undefined,
        stage: filters.stage !== 'all' ? filters.stage : undefined,
        source: filters.source !== 'all' ? filters.source : undefined,
    });

    // Type for API candidate response
    interface ApiCandidate {
        id: string;
        name: string;
        email?: string;
        phone?: string;
        roleTitle?: string;
        stage?: string;
        source?: string;
        createdById?: string;
        updatedAt?: string;
        createdAt: string;
        tags?: string[];
        tenantId: string;
    }

    // Map API candidates to CandidateListItem format
    const candidates: CandidateListItem[] = useMemo(() => {
        if (!candidatesData?.data) return [];
        return candidatesData.data.map((c: ApiCandidate) => ({
            id: c.id,
            name: c.name,
            email: c.email || '',
            phone: c.phone || '',
            role: c.roleTitle || '',
            stage: (c.stage || 'applied') as InterviewStage,
            source: c.source || 'Unknown',
            recruiterName: 'Unassigned',
            recruiterId: c.createdById || '',
            lastActivity: c.updatedAt || c.createdAt,
            lastActivityType: 'created' as const,
            dateAdded: c.createdAt,
            skills: c.tags || [],
            experienceYears: 0,
            tenantId: c.tenantId,
        }));
    }, [candidatesData]);

    const filteredCandidates = useMemo(() => {
        return candidates.filter((candidate) => {
            // Recruiter filter (client-side)
            if (filters.recruiterId !== 'all' && candidate.recruiterId !== filters.recruiterId) {
                return false;
            }

            // Experience filter
            if (filters.experienceMin !== null) {
                if (candidate.experienceYears < filters.experienceMin) return false;
                if (filters.experienceMax !== null && candidate.experienceYears > filters.experienceMax) {
                    return false;
                }
            }

            // Date added filter
            if (filters.dateAddedFrom) {
                const candidateDate = new Date(candidate.dateAdded);
                if (candidateDate < filters.dateAddedFrom) return false;
                if (filters.dateAddedTo && candidateDate > filters.dateAddedTo) return false;
            }

            return true;
        });
    }, [candidates, filters]);


    const handleAddCandidate = () => {
        toast({
            title: 'Add Candidate',
            description: 'Add candidate modal would open here.',
        });
    };

    const handleUploadSpreadsheet = () => {
        toast({
            title: 'Upload Spreadsheet',
            description: 'Spreadsheet upload modal would open here.',
        });
    };

    const handleUploadResume = () => {
        toast({
            title: 'Upload Resume',
            description: 'Resume upload modal would open here.',
        });
    };

    const handleChangeStage = (candidate: CandidateListItem) => {
        toast({
            title: 'Change Stage',
            description: `Change stage modal for ${candidate.name} would open here.`,
        });
    };

    const handleScheduleInterview = (candidate: CandidateListItem) => {
        setIsScheduleModalOpen(true);
    };

    const handleSendEmail = (candidate: CandidateListItem) => {
        setMessageCandidate(candidate);
        setMessageChannel('EMAIL');
        setMessageDialogOpen(true);
    };

    const handleSendWhatsApp = (candidate: CandidateListItem) => {
        setMessageCandidate(candidate);
        setMessageChannel('WHATSAPP');
        setMessageDialogOpen(true);
    };

    const handleSendSMS = (candidate: CandidateListItem) => {
        setMessageCandidate(candidate);
        setMessageChannel('SMS');
        setMessageDialogOpen(true);
    };

    const handleDelete = (candidate: CandidateListItem) => {
        setDeleteCandidate(candidate);
    };

    const handleConfirmDelete = () => {
        if (deleteCandidate) {
            deleteCandidateMutation.mutate(deleteCandidate.id, {
                onSuccess: () => {
                    toast({
                        title: 'Candidate Deleted',
                        description: `${deleteCandidate.name} has been removed.`,
                    });
                    setDeleteCandidate(null);
                },
                onError: (error) => {
                    toast({
                        title: 'Delete Failed',
                        description: 'Failed to delete candidate.',
                        variant: 'destructive',
                    });
                }
            });
        }
    };

    const handleBulkAction = (action: CandidateBulkAction) => {
        const count = selectedIds.length;
        switch (action) {
            case 'change-stage':
                toast({
                    title: 'Bulk Change Stage',
                    description: `Change stage for ${count} candidates.`,
                });
                break;
            case 'send-email':
                toast({
                    title: 'Bulk Send Email',
                    description: `Send email to ${count} candidates.`,
                });
                break;
            case 'add-tag':
                toast({
                    title: 'Bulk Add Tag',
                    description: `Add tag to ${count} candidates.`,
                });
                break;
            case 'assign-recruiter':
                toast({
                    title: 'Bulk Assign Recruiter',
                    description: `Assign recruiter to ${count} candidates.`,
                });
                break;
            case 'delete':
                setShowBulkDeleteDialog(true);
                break;
        }
    };

    const confirmBulkDelete = async () => {
        setIsBulkDeleting(true);
        try {
            await Promise.all(selectedIds.map(id => deleteCandidateMutation.mutateAsync(id)));
            toast({
                title: 'Bulk Delete',
                description: `Deleted ${selectedIds.length} candidates.`,
                variant: 'destructive',
            });
            setSelectedIds([]);
        } catch (error) {
            toast({
                title: 'Bulk Delete Failed',
                description: 'Failed to delete some candidates.',
                variant: 'destructive',
            });
        } finally {
            setIsBulkDeleting(false);
        }
        setShowBulkDeleteDialog(false);
    };

    const handleStageChange = (candidateId: string, newStage: InterviewStage) => {
        updateCandidateMutation.mutate(
            { id: candidateId, data: { stage: newStage } },
            {
                onSuccess: () => {
                    toast({
                        title: 'Stage Updated',
                        description: `Candidate moved to ${newStage.replace('-', ' ')}.`,
                    });
                },
                onError: () => {
                    toast({
                        title: 'Update Failed',
                        description: 'Failed to update candidate stage.',
                        variant: 'destructive',
                    });
                }
            }
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-6 px-8 py-6">
                <div className="flex items-center justify-between">
                    <TableSkeleton rows={8} columns={5} showCheckbox showAvatar />
                </div>
            </div>
        );
    }

    return (
        <div className="px-8 py-6 h-full">
            <motion.main
                initial="initial"
                animate="animate"
                variants={staggerContainer}
            >
                <motion.div variants={fadeInUp} className="space-y-6">
                    <CandidateListHeader
                        userRole={currentUserRole}
                        view={view}
                        onViewChange={setView}
                        onAddCandidate={handleAddCandidate}
                        onUploadSpreadsheet={handleUploadSpreadsheet}
                        onUploadResume={handleUploadResume}
                    />

                    <CandidateFilters filters={filters} onFiltersChange={setFilters} />

                    {/* Empty State */}
                    {filteredCandidates.length === 0 && !isLoading && (
                        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No candidates found</h3>
                            <p className="text-slate-500 mb-4">Try adjusting your filters or add a new candidate to get started.</p>
                        </div>
                    )}

                    {filteredCandidates.length > 0 && view === 'list' ? (
                        <CandidateTable
                            candidates={filteredCandidates}
                            selectedIds={selectedIds}
                            userRole={currentUserRole}
                            onSelectionChange={setSelectedIds}
                            onChangeStage={handleChangeStage}
                            onScheduleInterview={handleScheduleInterview}
                            onSendEmail={handleSendEmail}
                            onSendWhatsApp={handleSendWhatsApp}
                            onSendSMS={handleSendSMS}
                            onDelete={handleDelete}
                            onUpdateCandidate={async (id, updates) => {
                                await updateCandidateMutation.mutateAsync({ id, data: updates as any });
                            }}
                        />
                    ) : (
                        <div className="h-[calc(100vh-280px)]">
                            <CandidateBoard
                                candidates={filteredCandidates}
                                onStageChange={handleStageChange}
                                onCandidateClick={(c) => {
                                    // Could open a detail modal or side panel
                                    toast({ title: "View Candidate", description: c.name });
                                }}
                            />
                        </div>
                    )}

                    <QuickActionsToolbar
                        selectedCount={selectedIds.length}
                        primaryActions={[
                            {
                                id: 'email',
                                label: 'Email',
                                icon: <Mail className="h-4 w-4" />,
                                onClick: () => handleBulkAction('email'),
                            },
                            {
                                id: 'schedule',
                                label: 'Schedule',
                                icon: <Calendar className="h-4 w-4" />,
                                onClick: () => handleBulkAction('schedule'),
                            },
                            {
                                id: 'delete',
                                label: 'Delete',
                                icon: <Trash2 className="h-4 w-4" />,
                                variant: 'destructive',
                                onClick: () => handleBulkAction('delete'),
                            },
                        ]}
                        secondaryActions={[
                            {
                                id: 'sms',
                                label: 'Send SMS',
                                icon: <MessageSquare className="h-4 w-4" />,
                                onClick: () => handleBulkAction('sms'),
                            },
                        ]}
                        onClearSelection={() => setSelectedIds([])}
                    />

                    <ScheduleInterviewModal
                        open={isScheduleModalOpen}
                        onOpenChange={setIsScheduleModalOpen}
                    />

                    {/* Delete Confirmation */}
                    <AlertDialog open={!!deleteCandidate} onOpenChange={() => setDeleteCandidate(null)}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Candidate</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete <strong>{deleteCandidate?.name}</strong>? This action
                                    moves the candidate to the recycle bin.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleConfirmDelete}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {deleteCandidateMutation.isPending ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Bulk Delete Confirmation */}
                    <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Bulk Delete Candidates</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete <strong>{selectedIds.length}</strong> candidates? This action
                                    moves them to the recycle bin.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={confirmBulkDelete}
                                    disabled={isBulkDeleting}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {isBulkDeleting ? 'Deleting...' : 'Delete All'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Send Message Dialog */}
                    {messageCandidate && (
                        <SendMessageDialog
                            open={messageDialogOpen}
                            onOpenChange={setMessageDialogOpen}
                            recipientId={messageCandidate.id}
                            recipientName={messageCandidate.name}
                            recipientEmail={messageCandidate.email}
                            recipientPhone={messageCandidate.phone}
                            defaultChannel={messageChannel}
                        />
                    )}
                </motion.div>
            </motion.main>
        </div>
    );
}
