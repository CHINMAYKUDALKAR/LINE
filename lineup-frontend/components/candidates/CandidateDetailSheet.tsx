import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    FileText,
    Clock,
    MoreHorizontal,
    Edit,
    Trash,
    Link2,
    Loader2,
    Copy,
    Check,
    Send,
    MessageSquare,
    User,
    Activity
} from 'lucide-react';
import { useCandidate, useGeneratePortalLink, useCandidateNotes, useAddCandidateNote, useDeleteCandidateNote } from '@/lib/hooks/useCandidates';
import { getInitials, stageLabels, stageColors } from '@/lib/candidate-constants';
import { format, formatDistanceToNow } from 'date-fns';
import { CandidateListItem } from '@/types/candidate-list';

interface CandidateDetailSheetProps {
    candidateId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit?: (id: string) => void;
    onSchedule?: (candidate: any) => void;
}

export function CandidateDetailSheet({
    candidateId,
    open,
    onOpenChange,
    onEdit,
    onSchedule
}: CandidateDetailSheetProps) {
    const router = useRouter();
    const { data: candidate, isLoading } = useCandidate(candidateId || '');
    const { data: notesData, isLoading: notesLoading } = useCandidateNotes(candidateId || '');
    const addNoteMutation = useAddCandidateNote();
    const deleteNoteMutation = useDeleteCandidateNote();
    const generatePortalLink = useGeneratePortalLink();
    const [portalLink, setPortalLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [newNote, setNewNote] = useState('');

    if (!candidateId) return null;

    const handleViewFullProfile = () => {
        onOpenChange(false);
        router.push(`/candidates/${candidateId}`);
    };

    const handleGeneratePortalLink = async () => {
        try {
            const result = await generatePortalLink.mutateAsync(candidateId);
            setPortalLink(result.portalUrl);
        } catch (error) {
            console.error('Failed to generate portal link:', error);
        }
    };

    const handleCopyLink = () => {
        if (portalLink) {
            navigator.clipboard.writeText(portalLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim() || !candidateId) return;
        try {
            await addNoteMutation.mutateAsync({ candidateId, content: newNote.trim() });
            setNewNote('');
        } catch (error) {
            console.error('Failed to add note:', error);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!candidateId) return;
        try {
            await deleteNoteMutation.mutateAsync({ candidateId, noteId });
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    };

    const notes = notesData?.data || [];

    // Mock activity history based on candidate data
    const activityHistory = candidate ? [
        {
            id: '1',
            type: 'stage_change',
            description: `Stage changed to ${stageLabels[candidate.stage] || candidate.stage}`,
            timestamp: candidate.updatedAt,
            user: 'System',
        },
        {
            id: '2',
            type: 'created',
            description: 'Candidate profile created',
            timestamp: candidate.createdAt,
            user: 'System',
        },
    ] : [];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0 gap-0">
                {isLoading ? (
                    <div className="p-6 space-y-6">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-16 w-16 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-40" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                ) : candidate ? (
                    <>
                        {/* Header */}
                        <div className="p-6 pr-12 border-b border-border bg-muted/10">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                                        <AvatarFallback className="text-lg bg-primary/10 text-primary">
                                            {getInitials(candidate.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className="text-xl font-semibold text-foreground">{candidate.name}</h2>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                                            <Briefcase className="h-3.5 w-3.5" />
                                            {candidate.roleTitle || 'No Role'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge variant="outline" className={stageColors[candidate.stage]}>
                                        {stageLabels[candidate.stage]}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-6">
                                <Button size="sm" onClick={() => onSchedule?.(candidate)} className="flex-1">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Schedule
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => onEdit?.(candidate.id)} className="flex-1">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                                <Button size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Portal Link Section */}
                            <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-dashed">
                                {portalLink ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-foreground">Portal Link</span>
                                            <Button size="sm" variant="ghost" onClick={handleCopyLink} className="h-7">
                                                {copied ? (
                                                    <><Check className="mr-1 h-3 w-3 text-green-500" /> Copied!</>
                                                ) : (
                                                    <><Copy className="mr-1 h-3 w-3" /> Copy</>
                                                )}
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground break-all font-mono bg-background p-2 rounded">
                                            {portalLink}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Candidate Portal</p>
                                            <p className="text-xs text-muted-foreground">Generate a link for the candidate to view their application</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleGeneratePortalLink}
                                            disabled={generatePortalLink.isPending}
                                        >
                                            {generatePortalLink.isPending ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Link2 className="mr-2 h-4 w-4" />
                                            )}
                                            Generate Link
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <ScrollArea className="flex-1">
                            <div className="p-6">
                                <Tabs defaultValue="overview" className="w-full">
                                    <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
                                        <TabsTrigger
                                            value="overview"
                                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                                        >
                                            Overview
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="notes"
                                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                                        >
                                            Notes {notes.length > 0 && <Badge variant="secondary" className="ml-1.5 h-5 px-1.5">{notes.length}</Badge>}
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="history"
                                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                                        >
                                            History
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="overview" className="space-y-6 mt-0">
                                        {/* Contact Info */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-medium text-foreground">Contact Information</h3>
                                            <div className="grid gap-3">
                                                <div className="flex items-center gap-3 text-sm">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <a href={`mailto:${candidate.email}`} className="text-primary hover:underline">
                                                        {candidate.email || 'No email provided'}
                                                    </a>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-foreground">{candidate.phone || 'No phone provided'}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-muted-foreground">
                                                        Added {format(new Date(candidate.createdAt), 'MMM d, yyyy')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Skills */}
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-medium text-foreground">Skills</h3>
                                            <div className="flex flex-wrap gap-1.5">
                                                {candidate.tags && candidate.tags.length > 0 ? (
                                                    candidate.tags.map((tag: string) => (
                                                        <Badge key={tag} variant="secondary" className="font-normal border-transparent bg-secondary/50 hover:bg-secondary/70">
                                                            {tag}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-muted-foreground italic">No skills listed</span>
                                                )}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Resume */}
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-medium text-foreground">Resume</h3>
                                            {candidate.resumeUrl ? (
                                                <div className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-background rounded-md border">
                                                            <FileText className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium">Resume.pdf</span>
                                                            <span className="text-xs text-muted-foreground">PDF Document</span>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">View</a>
                                                    </Button>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground italic">No resume uploaded</p>
                                            )}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="notes" className="mt-0 space-y-4">
                                        {/* Add Note Form */}
                                        <div className="space-y-3">
                                            <Textarea
                                                placeholder="Add a note about this candidate..."
                                                value={newNote}
                                                onChange={(e) => setNewNote(e.target.value)}
                                                rows={3}
                                                className="resize-none"
                                            />
                                            <Button
                                                size="sm"
                                                onClick={handleAddNote}
                                                disabled={!newNote.trim() || addNoteMutation.isPending}
                                                className="w-full"
                                            >
                                                {addNoteMutation.isPending ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Send className="mr-2 h-4 w-4" />
                                                )}
                                                Add Note
                                            </Button>
                                        </div>

                                        <Separator />

                                        {/* Notes List */}
                                        {notesLoading ? (
                                            <div className="space-y-3">
                                                <Skeleton className="h-20 w-full" />
                                                <Skeleton className="h-20 w-full" />
                                            </div>
                                        ) : notes.length === 0 ? (
                                            <div className="text-center py-8">
                                                <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                                                <p className="text-sm text-muted-foreground">No notes yet</p>
                                                <p className="text-xs text-muted-foreground">Add a note to keep track of important information</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {notes.map((note) => (
                                                    <div key={note.id} className="p-3 rounded-lg border bg-muted/20">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="h-6 w-6">
                                                                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                                                        {note.author?.name?.charAt(0) || 'U'}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <span className="text-sm font-medium">{note.author?.name || 'Unknown'}</span>
                                                                    <span className="text-xs text-muted-foreground ml-2">
                                                                        {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                                onClick={() => handleDeleteNote(note.id)}
                                                                disabled={deleteNoteMutation.isPending}
                                                            >
                                                                <Trash className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                        <p className="text-sm mt-2 whitespace-pre-wrap">{note.content}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="history" className="mt-0">
                                        {activityHistory.length === 0 ? (
                                            <div className="text-center py-8">
                                                <Activity className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                                                <p className="text-sm text-muted-foreground">No activity yet</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {activityHistory.map((activity, index) => (
                                                    <div key={activity.id} className="flex gap-3">
                                                        <div className="flex flex-col items-center">
                                                            <div className="p-2 rounded-full bg-muted">
                                                                {activity.type === 'stage_change' ? (
                                                                    <Activity className="h-3 w-3 text-primary" />
                                                                ) : (
                                                                    <User className="h-3 w-3 text-muted-foreground" />
                                                                )}
                                                            </div>
                                                            {index < activityHistory.length - 1 && (
                                                                <div className="w-px h-full bg-border my-1" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 pb-4">
                                                            <p className="text-sm font-medium">{activity.description}</p>
                                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })} • {activity.user}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </ScrollArea>

                        {/* Footer */}
                        <SheetFooter className="p-6 border-t bg-muted/10 sm:justify-between">
                            <Button variant="ghost" className="text-muted-foreground hover:text-destructive" size="sm">
                                <Trash className="mr-2 h-4 w-4" />
                                Delete Candidate
                            </Button>
                            <Button onClick={handleViewFullProfile}>
                                View Full Profile
                            </Button>
                        </SheetFooter>
                    </>
                ) : (
                    <div className="p-6 text-center">
                        <p>Candidate not found</p>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
