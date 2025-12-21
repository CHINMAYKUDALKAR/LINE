'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CandidateListItem } from '@/types/candidate-list';
import { formatDistanceToNow } from 'date-fns';
import { GripVertical } from 'lucide-react';

interface BoardCardProps {
    candidate: CandidateListItem;
    onClick?: (candidate: CandidateListItem) => void;
}

export function BoardCard({ candidate, onClick }: BoardCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: candidate.id, data: { candidate } });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const initials = candidate.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <div ref={setNodeRef} style={style} className="mb-3 touch-none group">
            <Card
                className={`hover:shadow-md hover:border-primary/40 transition-all cursor-pointer bg-card/80 backdrop-blur-sm ${isDragging ? 'shadow-lg border-primary/50 ring-2 ring-primary/20 rotate-2 scale-105 z-50' : ''}`}
                onClick={() => onClick?.(candidate)}
            >
                <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-medium leading-none">
                                {candidate.name}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">{candidate.role}</p>
                        </div>
                    </div>
                    <div {...attributes} {...listeners} className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing p-1 -mr-2 -mt-2">
                        <GripVertical className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                    <div className="flex flex-wrap gap-1 mb-3">
                        {candidate.skills.slice(0, 2).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-[10px] px-1 py-0 h-5">
                                {skill}
                            </Badge>
                        ))}
                        {candidate.skills.length > 2 && (
                            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5">
                                +{candidate.skills.length - 2}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{candidate.source}</span>
                        <span>{formatDistanceToNow(new Date(candidate.lastActivity))} ago</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
