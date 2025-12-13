'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Upload, X, User } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useCreateCandidate } from '@/lib/hooks/useCandidates';

const SOURCES = [
    'LinkedIn',
    'Indeed',
    'Referral',
    'Website',
    'Job Board',
    'Agency',
    'Other',
];

const STAGES = [
    'applied',
    'screening',
    'interview',
    'technical',
    'offer',
    'hired',
    'rejected',
];

interface AddCandidateFormData {
    name: string;
    email: string;
    phone: string;
    roleTitle: string;
    source: string;
    stage: string;
    notes: string;
}

interface AddCandidateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function AddCandidateModal({ open, onOpenChange, onSuccess }: AddCandidateModalProps) {
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isUploadingResume, setIsUploadingResume] = useState(false);

    const createCandidate = useCreateCandidate();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<AddCandidateFormData>({
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            roleTitle: '',
            source: '',
            stage: 'applied',
            notes: '',
        },
    });

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ];
            if (!allowedTypes.includes(file.type)) {
                toast.error('Please upload a PDF or Word document');
                return;
            }
            // Validate file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File size must be less than 10MB');
                return;
            }
            setResumeFile(file);
        }
    };

    const onSubmit = async (data: AddCandidateFormData) => {
        try {
            const candidateData = {
                name: data.name,
                email: data.email || undefined,
                phone: data.phone || undefined,
                roleTitle: data.roleTitle || undefined,
                source: data.source || undefined,
                stage: data.stage || 'applied',
                tags: tags.length > 0 ? tags : undefined,
                notes: data.notes || undefined,
            };


            const newCandidate = await createCandidate.mutateAsync(candidateData);

            // Upload resume if provided
            if (resumeFile && newCandidate?.id) {
                setIsUploadingResume(true);
                try {
                    // TODO: Implement resume upload using presigned URL flow
                    // For now, just show success
                    toast.success('Resume upload will be implemented');
                } catch (err) {
                    toast.error('Failed to upload resume');
                } finally {
                    setIsUploadingResume(false);
                }
            }

            toast.success(`Candidate "${data.name}" created successfully`);
            handleClose();
            onSuccess?.();
        } catch (error) {
            toast.error('Failed to create candidate');
        }
    };

    const handleClose = () => {
        reset();
        setTags([]);
        setTagInput('');
        setResumeFile(null);
        onOpenChange(false);
    };

    const isSubmitting = createCandidate.isPending || isUploadingResume;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Add New Candidate
                    </DialogTitle>
                    <DialogDescription>
                        Add a candidate to your hiring pipeline. Fill in the details below.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Name - Required */}
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            placeholder="Full name"
                            {...register('name', { required: 'Name is required' })}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Email & Phone - Side by side */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="email@example.com"
                                {...register('email', {
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: 'Invalid email format',
                                    },
                                })}
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                placeholder="+1 (555) 000-0000"
                                {...register('phone')}
                            />
                        </div>
                    </div>

                    {/* Role & Source - Side by side */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="roleTitle">Role / Position</Label>
                            <Input
                                id="roleTitle"
                                placeholder="e.g. Software Engineer"
                                {...register('roleTitle')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Source</Label>
                            <Select
                                value={watch('source')}
                                onValueChange={(value) => setValue('source', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select source" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SOURCES.map((source) => (
                                        <SelectItem key={source} value={source}>
                                            {source}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Stage */}
                    <div className="space-y-2">
                        <Label>Stage</Label>
                        <Select
                            value={watch('stage')}
                            onValueChange={(value) => setValue('stage', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select stage" />
                            </SelectTrigger>
                            <SelectContent>
                                {STAGES.map((stage) => (
                                    <SelectItem key={stage} value={stage}>
                                        {stage.charAt(0).toUpperCase() + stage.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label>Tags</Label>
                        <div className="flex gap-2">
                            <Input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Add a tag and press Enter"
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleAddTag}
                                disabled={!tagInput.trim()}
                            >
                                Add
                            </Button>
                        </div>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="gap-1">
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="hover:text-destructive"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Resume Upload */}
                    <div className="space-y-2">
                        <Label>Resume</Label>
                        <div className="border-2 border-dashed rounded-lg p-4 text-center">
                            {resumeFile ? (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm truncate">{resumeFile.name}</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setResumeFile(null)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <label className="cursor-pointer block">
                                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                    <span className="text-sm text-muted-foreground">
                                        Click to upload resume (PDF, DOC, DOCX)
                                    </span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Additional notes about the candidate..."
                            rows={3}
                            {...register('notes')}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Creating...
                                </>
                            ) : (
                                'Add Candidate'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
