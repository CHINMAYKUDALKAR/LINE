'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Send,
    FileText,
    Zap,
    Settings,
    Mail,
    MessageSquare,
    Smartphone,
    TrendingUp,
    Clock,
    AlertCircle,
    ArrowRight,
    RefreshCw
} from 'lucide-react';
import { useStats } from '@/lib/hooks/useCommunication';

const quickActions = [
    { label: 'Send Message', href: '/communication/messages?action=compose', icon: Send, color: 'bg-blue-500' },
    { label: 'Create Template', href: '/communication/templates?action=new', icon: FileText, color: 'bg-purple-500' },
    { label: 'New Automation', href: '/communication/automations?action=new', icon: Zap, color: 'bg-amber-500' },
    { label: 'Configure Channels', href: '/communication/channels', icon: Settings, color: 'bg-slate-500' },
];

const channelIcons = {
    email: Mail,
    whatsapp: MessageSquare,
    sms: Smartphone,
};

export default function CommunicationOverviewPage() {
    const { data: stats, isLoading, error, refetch } = useStats();

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 w-64 bg-slate-200 rounded" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-slate-200 rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
                    <h3 className="font-semibold text-red-900">Failed to load communication stats</h3>
                    <p className="text-sm text-red-700 mt-1">{(error as Error).message}</p>
                    <button
                        onClick={() => refetch()}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const statCards = [
        { label: 'Messages Sent', value: stats?.totalSent || 0, icon: Send, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Pending', value: stats?.totalPending || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Failed', value: stats?.totalFailed || 0, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Scheduled', value: stats?.totalScheduled || 0, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    ];

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Communication Center</h1>
                <p className="text-slate-600">Manage all your candidate and interviewer communications</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-xl border border-slate-200 p-5"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">{stat.label}</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Channel Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-xl border border-slate-200 p-5"
                >
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Messages by Channel</h2>
                    <div className="space-y-4">
                        {Object.entries(stats?.byChannel || { email: 0, whatsapp: 0, sms: 0 }).map(([channel, count]) => {
                            const Icon = channelIcons[channel as keyof typeof channelIcons] || Mail;
                            const total = (stats?.byChannel?.email || 0) + (stats?.byChannel?.whatsapp || 0) + (stats?.byChannel?.sms || 0);
                            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                            return (
                                <div key={channel} className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg">
                                        <Icon className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-slate-700 capitalize">{channel}</span>
                                            <span className="text-slate-500">{count} ({percentage}%)</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-xl border border-slate-200 p-5"
                >
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {quickActions.map((action) => (
                            <Link
                                key={action.label}
                                href={action.href}
                                className="flex flex-col items-center p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                            >
                                <div className={`p-2 rounded-lg ${action.color} text-white mb-2`}>
                                    <action.icon className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 text-center">
                                    {action.label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-xl border border-slate-200 p-5"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
                        <Link href="/communication/messages" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            View all <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {(stats?.recentActivity || []).slice(0, 5).map((activity) => {
                            const Icon = channelIcons[activity.channel?.toLowerCase() as keyof typeof channelIcons] || Mail;
                            return (
                                <div key={activity.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                                    <div className="p-1.5 bg-slate-100 rounded">
                                        <Icon className="w-4 h-4 text-slate-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-900 truncate">
                                            {activity.subject || activity.recipientEmail || 'Message'}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {activity.createdAt ? new Date(activity.createdAt).toLocaleString() : ''}
                                        </p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${activity.status === 'SENT' || activity.status === 'DELIVERED'
                                        ? 'bg-green-100 text-green-700'
                                        : activity.status === 'FAILED'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {activity.status}
                                    </span>
                                </div>
                            );
                        })}
                        {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                            <p className="text-sm text-slate-500 text-center py-4">No recent activity</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
