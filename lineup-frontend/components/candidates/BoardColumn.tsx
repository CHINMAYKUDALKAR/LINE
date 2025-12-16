'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CandidateListItem } from '@/types/candidate-list';
import { BoardCard } from './BoardCard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BoardColumnProps {
    id: string;
    title: string;
    candidates: CandidateListItem[];
    onCardClick?: (candidate: CandidateListItem) => void;
}

export function BoardColumn({ id, title, candidates, onCardClick }: BoardColumnProps) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div className="flex flex-col h-full bg-muted/30 rounded-lg border border-border/50">
            <div className="p-3 border-b border-border/50 bg-muted/20 rounded-t-lg flex items-center justify-between">
                <h3 className="font-semibold text-sm">{title}</h3>
                <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-0.5 rounded-full border">
                    {candidates.length}
                </span>
            </div>
            <div ref={setNodeRef} className="flex-1 p-2 min-h-[100px]">
                <ScrollArea className="h-full">
                    <SortableContext
                        items={candidates.map(c => c.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-3 min-h-[50px]">
                            {candidates.map((candidate) => (
                                <BoardCard
                                    key={candidate.id}
                                    candidate={candidate}
                                    onClick={onCardClick}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </ScrollArea>
            </div>
        </div>
    );
}
