'use client';

import { Skeleton } from '@/components/ui/skeleton';

interface TableSkeletonProps {
    /** Number of rows to show */
    rows?: number;
    /** Number of columns to show */
    columns?: number;
    /** Show checkbox column */
    showCheckbox?: boolean;
    /** Show avatar in first data column */
    showAvatar?: boolean;
}

/**
 * Reusable table skeleton loader for consistent loading states
 * Prevents layout shift by matching table structure
 */
export function TableSkeleton({
    rows = 5,
    columns = 6,
    showCheckbox = true,
    showAvatar = true,
}: TableSkeletonProps) {
    return (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
            {/* Header */}
            <div className="bg-muted/50 p-4 border-b border-border">
                <div className="flex items-center gap-4">
                    {showCheckbox && <Skeleton className="h-4 w-4" />}
                    {Array.from({ length: columns }).map((_, i) => (
                        <Skeleton
                            key={i}
                            className={`h-4 ${i === 0 ? 'w-24' : 'w-16'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="p-4 flex items-center gap-4">
                        {showCheckbox && <Skeleton className="h-4 w-4" />}

                        {/* First column with avatar */}
                        <div className="flex items-center gap-3 min-w-[200px]">
                            {showAvatar && <Skeleton className="h-9 w-9 rounded-full" />}
                            <div className="space-y-1.5">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-3 w-36" />
                            </div>
                        </div>

                        {/* Other columns */}
                        {Array.from({ length: columns - 1 }).map((_, colIndex) => (
                            <Skeleton
                                key={colIndex}
                                className={`h-6 ${colIndex === 0 ? 'w-20 rounded-full' : 'w-16'
                                    }`}
                            />
                        ))}

                        {/* Actions */}
                        <div className="ml-auto">
                            <Skeleton className="h-8 w-8" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TableSkeleton;
