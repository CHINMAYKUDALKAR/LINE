"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CandidateProfileHeader } from '@/components/candidate-profile/CandidateProfileHeader';
import { CandidateOverviewCard } from '@/components/candidate-profile/CandidateOverviewCard';
import { ResumeDocuments } from '@/components/candidate-profile/ResumeDocuments';
import { InterviewHistory } from '@/components/candidate-profile/InterviewHistory';
import { CommunicationHistory } from '@/components/candidate-profile/CommunicationHistory';
import { CandidateSnapshotPanel } from '@/components/candidate-profile/CandidateSnapshotPanel';
import { SkillsTags } from '@/components/candidate-profile/SkillsTags';
import { CandidateNotesSection } from '@/components/candidate-profile/CandidateNotesSection';
import {
    mockCandidateProfile,
    mockDocuments,
    mockInterviews,
    mockCommunications,
    mockNotes,
    currentUserRole,
} from '@/lib/candidate-mock-data';
import {
    CandidateProfile as CandidateProfileType,
    CandidateDocument,
    CandidateInterview,
    CommunicationEntry,
    CandidateNote,
} from '@/types/candidate';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { uploadCandidateResume, getCandidate, getCandidateDocuments, getCandidateNotes, addCandidateNote, getDocumentDownloadUrl } from '@/lib/api/candidates';
import { getAuthToken } from '@/lib/auth';
import { fadeInUp, fadeInRight, staggerContainer, staggerItem } from '@/lib/animations';
import { useDeleteCandidate, useUpdateCandidate } from '@/lib/hooks/useCandidates';
import { ChangeStageModal } from '@/components/candidates/ChangeStageModal';
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

export default function CandidateProfile() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const deleteCandidateMutation = useDeleteCandidate();
    const updateCandidateMutation = useUpdateCandidate();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [stageModalOpen, setStageModalOpen] = useState(false);

    const [candidate, setCandidate] = useState<CandidateProfileType | null>(null);
    const [documents, setDocuments] = useState<CandidateDocument[]>([]);
    const [interviews, setInterviews] = useState<CandidateInterview[]>([]);
    const [communications, setCommunications] = useState<CommunicationEntry[]>([]);
    const [notes, setNotes] = useState<CandidateNote[]>([]);
    const [tags, setTags] = useState<string[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [errors, setErrors] = useState({
        candidate: '',
        documents: '',
        interviews: '',
        communications: '',
        notes: '',
    });

    // Helper function to map API response to CandidateProfile type
    const mapApiToProfile = (apiData: any): CandidateProfileType => {
        return {
            id: apiData.id,
            name: apiData.name,
            email: apiData.email || '',
            phone: apiData.phone || '',
            location: apiData.location || '',
            appliedRole: apiData.roleTitle || apiData.appliedRole || '',
            experienceSummary: apiData.notes || apiData.experienceSummary || '',
            assignedRecruiter: apiData.assignedRecruiter || {
                id: '',
                name: 'Unassigned',
                email: '',
            },
            tags: apiData.tags || [],
            currentStage: apiData.currentStage || apiData.stage || 'screening',
            source: apiData.source || 'Direct',
            createdAt: apiData.createdAt,
            updatedAt: apiData.updatedAt,
            tenantId: apiData.tenantId,
        };
    };

    const loadData = useCallback(async () => {
        if (!id) return;

        setIsLoading(true);
        const token = getAuthToken();

        try {
            if (token) {
                // Fetch real candidate data from API
                const apiData = await getCandidate(id, token) as any;
                const candidateProfile = mapApiToProfile(apiData);

                setCandidate(candidateProfile);
                setTags(candidateProfile.tags);

                // Fetch documents and notes from real API endpoints
                try {
                    const docsResponse = await getCandidateDocuments(id, token) as { data: any[] };
                    const docsWithUrls = await Promise.all(
                        (docsResponse.data || []).map(async (doc: any) => {
                            let downloadUrl = '';
                            try {
                                downloadUrl = await getDocumentDownloadUrl(doc.id);
                            } catch (e) {
                                console.warn(`Failed to get download URL for doc ${doc.id}:`, e);
                            }
                            return {
                                id: doc.id,
                                type: (doc.mimeType?.includes('pdf') ? 'resume' : 'other') as CandidateDocument['type'],
                                name: doc.filename,
                                url: downloadUrl,
                                uploadedAt: doc.createdAt,
                                uploadedBy: 'System',
                                size: doc.size || 0,
                            };
                        })
                    );
                    setDocuments(docsWithUrls);
                } catch (e) {
                    console.error('Failed to fetch documents:', e);
                    setDocuments([]);
                    setErrors(prev => ({ ...prev, documents: 'Failed to load documents' }));
                    toast({ title: 'Warning', description: 'Could not load documents', variant: 'destructive' });
                }

                try {
                    const notesResponse = await getCandidateNotes(id, token);
                    const frontendNotes = (notesResponse.data || []).map((note: any) => ({
                        id: note.id,
                        content: note.content,
                        authorId: note.authorId,
                        authorName: note.author?.name || 'Unknown',
                        createdAt: note.createdAt,
                    }));
                    setNotes(frontendNotes);
                } catch (e) {
                    console.error('Failed to fetch notes:', e);
                    setNotes([]);
                    setErrors(prev => ({ ...prev, notes: 'Failed to load notes' }));
                    toast({ title: 'Warning', description: 'Could not load notes', variant: 'destructive' });
                }

                setInterviews(apiData.interviews || mockInterviews);
                setCommunications(apiData.communications || mockCommunications);
            } else {
                // No token - fall back to mock data
                console.warn('No auth token, using mock data');
                setCandidate(mockCandidateProfile);
                setDocuments(mockDocuments);
                setInterviews(mockInterviews);
                setCommunications(mockCommunications);
                setNotes(mockNotes);
                setTags(mockCandidateProfile.tags);
            }
        } catch (error) {
            console.error('Failed to fetch candidate:', error);
            setErrors(prev => ({ ...prev, candidate: 'Failed to load candidate data' }));

            // Fall back to mock data on error (for development)
            setCandidate(mockCandidateProfile);
            setDocuments(mockDocuments);
            setInterviews(mockInterviews);
            setCommunications(mockCommunications);
            setNotes(mockNotes);
            setTags(mockCandidateProfile.tags);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleScheduleInterview = () => {
        toast({
            title: 'Schedule Interview',
            description: 'Opening interview scheduling modal...',
        });
    };

    const handleSendEmail = () => {
        toast({
            title: 'Send Email',
            description: 'Opening email composer...',
        });
    };

    const handleAddNote = async (content: string) => {
        const token = getAuthToken();
        if (!token) {
            toast({ title: 'Error', description: 'Please log in to add notes.', variant: 'destructive' });
            return;
        }

        try {
            const newNote = await addCandidateNote(id, content, token);
            const frontendNote: CandidateNote = {
                id: newNote.id,
                content: newNote.content,
                authorId: newNote.authorId,
                authorName: newNote.author?.name || 'Unknown',
                createdAt: newNote.createdAt,
            };
            setNotes([frontendNote, ...notes]);
            toast({ title: 'Note Added', description: 'Your note has been saved.' });
        } catch (error) {
            console.error('Failed to add note:', error);
            toast({ title: 'Error', description: 'Failed to add note. Please try again.', variant: 'destructive' });
        }
    };

    const handleEditCandidate = () => {
        toast({
            title: 'Edit Candidate',
            description: 'Opening edit form...',
        });
    };

    const handleChangeStage = () => {
        setStageModalOpen(true);
    };

    const handleStageChangeConfirm = async (candidateId: string, newStage: string, note?: string) => {
        await updateCandidateMutation.mutateAsync({ id: candidateId, data: { stage: newStage } });
        setStageModalOpen(false);
        // Reload data to reflect stage change
        loadData();
        toast({
            title: 'Stage Updated',
            description: `Candidate stage changed to ${newStage}.`,
        });
    };

    const handleDeleteCandidate = () => {
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        deleteCandidateMutation.mutate(id, {
            onSuccess: () => {
                toast({
                    title: 'Candidate Deleted',
                    description: 'The candidate has been moved to the recycle bin.',
                });
                router.push('/candidates');
            },
            onError: (error) => {
                toast({
                    title: 'Delete Failed',
                    description: 'Failed to delete candidate. Please try again.',
                    variant: 'destructive',
                });
                console.error('Delete error:', error);
            }
        });
        setShowDeleteDialog(false);
    };

    const handleUploadDocument = async () => {
        // Create file input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx';

        input.onchange = async (e: Event) => {
            const target = e.target as HTMLInputElement;
            const file = target.files?.[0];

            if (!file) return;

            // Validate file size (100MB max)
            if (file.size > 100 * 1024 * 1024) {
                toast({
                    title: 'File Too Large',
                    description: 'Please upload a file smaller than 100MB.',
                    variant: 'destructive',
                });
                return;
            }

            try {
                toast({
                    title: 'Uploading Resume',
                    description: 'Please wait while we upload your file...',
                });

                // Get auth token from localStorage
                const token = getAuthToken();

                if (!token) {
                    toast({
                        title: 'Authentication Required',
                        description: 'Please log in to upload files.',
                        variant: 'destructive',
                    });
                    return;
                }

                // Upload the file
                const { success, fileId } = await uploadCandidateResume(id, file, token);

                if (success) {
                    toast({
                        title: 'Upload Successful',
                        description: 'Your resume has been uploaded and is being scanned.',
                    });

                    // Optionally reload documents
                    // You can add API call here to refresh the documents list
                }
            } catch (error) {
                console.error('Upload failed:', error);
                toast({
                    title: 'Upload Failed',
                    description: error instanceof Error ? error.message : 'Failed to upload file. Please try again.',
                    variant: 'destructive',
                });
            }
        };

        input.click();
    };

    const handleAddTag = (tag: string) => {
        if (!tags.includes(tag)) {
            setTags([...tags, tag]);
            toast({
                title: 'Tag Added',
                description: `"${tag}" has been added.`,
            });
        }
    };

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
        toast({
            title: 'Tag Removed',
            description: `"${tag}" has been removed.`,
        });
    };

    if (isLoading) {
        return (
            <TooltipProvider>
                <div className="min-h-screen bg-background">
                    {/* Header Skeleton */}
                    <div className="bg-card border-b border-border">
                        <div className="max-w-7xl mx-auto px-6 py-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-9 w-9 rounded-lg" />
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-48" />
                                    <Skeleton className="h-5 w-24" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Skeleton */}
                    <div className="max-w-7xl mx-auto px-6 py-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <Skeleton className="h-64 w-full rounded-xl" />
                                <Skeleton className="h-80 w-full rounded-xl" />
                                <Skeleton className="h-48 w-full rounded-xl" />
                            </div>
                            <div className="space-y-6">
                                <Skeleton className="h-48 w-full rounded-xl" />
                                <Skeleton className="h-32 w-full rounded-xl" />
                                <Skeleton className="h-64 w-full rounded-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </TooltipProvider>
        );
    }

    if (!candidate) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Candidate not found</p>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="px-8 py-6 h-full">
                <motion.div
                    initial="initial"
                    animate="animate"
                    variants={staggerContainer}
                >
                    {/* Header */}
                    <motion.div variants={fadeInUp} className="mb-6">
                        <CandidateProfileHeader
                            candidateName={candidate.name}
                            stage={candidate.currentStage}
                            userRole={currentUserRole}
                            onScheduleInterview={handleScheduleInterview}
                            onSendEmail={handleSendEmail}
                            onSendWhatsApp={() => toast({ title: 'WhatsApp', description: 'Opening WhatsApp composer...' })}
                            onSendSMS={() => toast({ title: 'SMS', description: 'Opening SMS composer...' })}
                            onAddNote={() => document.getElementById('notes-section')?.scrollIntoView({ behavior: 'smooth' })}
                            onEditCandidate={handleEditCandidate}
                            onChangeStage={handleChangeStage}
                            onDeleteCandidate={handleDeleteCandidate}
                        />
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Main Content */}
                        <motion.div variants={staggerItem} className="lg:col-span-2 space-y-6">
                            <CandidateOverviewCard
                                candidate={candidate}
                                userRole={currentUserRole}
                                isLoading={false}
                                onEdit={handleEditCandidate}
                            />

                            <ResumeDocuments
                                documents={documents}
                                userRole={currentUserRole}
                                isLoading={false}
                                error={errors.documents}
                                onUpload={handleUploadDocument}
                            />

                            <InterviewHistory
                                interviews={interviews}
                                isLoading={false}
                                error={errors.interviews}
                            />

                            <CommunicationHistory
                                communications={communications}
                                isLoading={false}
                                error={errors.communications}
                            />
                        </motion.div>

                        {/* Right Sidebar */}
                        <motion.div variants={fadeInRight} className="space-y-6">
                            <CandidateSnapshotPanel
                                candidate={candidate}
                                isLoading={false}
                                error={errors.candidate}
                            />

                            <SkillsTags
                                tags={tags}
                                userRole={currentUserRole}
                                isLoading={false}
                                onAddTag={handleAddTag}
                                onRemoveTag={handleRemoveTag}
                            />

                            <div id="notes-section">
                                <CandidateNotesSection
                                    notes={notes}
                                    userRole={currentUserRole}
                                    isLoading={false}
                                    error={errors.notes}
                                    onAddNote={handleAddNote}
                                />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will move the candidate to the recycle bin. You can restore them later if needed.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                {deleteCandidateMutation.isPending ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Change Stage Modal */}
                {candidate && (
                    <ChangeStageModal
                        open={stageModalOpen}
                        onOpenChange={setStageModalOpen}
                        candidateId={candidate.id}
                        candidateName={candidate.name}
                        currentStage={candidate.currentStage}
                        onStageChange={handleStageChangeConfirm}
                    />
                )}
            </div>
        </TooltipProvider>
    );
}
