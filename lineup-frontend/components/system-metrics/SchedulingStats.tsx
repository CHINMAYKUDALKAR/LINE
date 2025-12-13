"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, RefreshCw, XCircle, Clock, Timer } from "lucide-react";
import type { SchedulingMetrics } from "@/types/system-metrics";

interface SchedulingStatsProps {
    data?: SchedulingMetrics;
    isLoading?: boolean;
}

export function SchedulingStats({ data, isLoading }: SchedulingStatsProps) {
    const cards = [
        {
            title: "Interviews Today",
            value: data?.interviewsToday ?? 0,
            icon: Calendar,
            color: "text-blue-500",
            description: "Scheduled for today",
        },
        {
            title: "Rescheduled Today",
            value: data?.rescheduledToday ?? 0,
            icon: RefreshCw,
            color: "text-yellow-500",
            description: "Interviews moved",
        },
        {
            title: "Cancelled Today",
            value: data?.cancelledToday ?? 0,
            icon: XCircle,
            color: data && data.cancelledToday > 0 ? "text-red-500" : "text-muted-foreground",
            description: "Interviews cancelled",
        },
        {
            title: "Availability Engine",
            value: data ? `${data.availabilityEngineAvgMs}ms` : "-",
            icon: Timer,
            color: "text-green-500",
            description: "Avg response time",
        },
        {
            title: "Avg Time to First Interview",
            value: data ? `${data.avgTimeToFirstInterviewHours.toFixed(1)}h` : "-",
            icon: Clock,
            color: "text-purple-500",
            description: "From candidate creation",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {cards.map((card) => (
                <Card key={card.title}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {card.title}
                        </CardTitle>
                        <card.icon className={`h-4 w-4 ${card.color}`} />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{card.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {card.description}
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
