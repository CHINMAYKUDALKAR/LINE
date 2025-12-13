'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Search,
    Filter,
    Send,
    Clock,
    CheckCircle,
    AlertCircle,
    Eye,
    RefreshCw,
    Mail,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    Plus,
    Loader2
} from 'lucide-react';
import { useMessages, useRetryMessage } from '@/lib/hooks/useCommunication';
import type { Channel, MessageStatus, MessageFilters } from '@/lib/api/communication';
import { SendMessageModal } from '@/components/communication/messages/SendMessageModal';

const statusConfig: Record<MessageStatus, { color: string; icon: any; label: string }> = {
    PENDING: { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Pending' },
    QUEUED: { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'Queued' },
    SENT: { color: 'bg-green-100 text-green-700', icon: Send, label: 'Sent' },
    DELIVERED: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Delivered' },
    READ: { color: 'bg-emerald-100 text-emerald-700', icon: Eye, label: 'Read' },
    FAILED: { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Failed' },
    BOUNCED: { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Bounced' },
};

const channelIcon: Record<Channel, any> = {
    EMAIL: Mail,
    WHATSAPP: MessageSquare,
    SMS: MessageSquare,
};

function MessagesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const showCompose = searchParams.get('action') === 'compose';

    const [filters, setFilters] = useState<MessageFilters>({
        channel: undefined,
        status: undefined,
        search: '',
        page: 1,
        limit: 20,
    });
    const [searchInput, setSearchInput] = useState('');
    const [composeOpen, setComposeOpen] = useState(showCompose);

    const { data, isLoading, error, refetch } = useMessages(filters);
    const retryMutation = useRetryMessage();

    const handleRetry = async (id: string) => {
        await retryMutation.mutateAsync(id);
    };

    const handleSearch = () => {
        setFilters({ ...filters, search: searchInput, page: 1 });
    };

    const messages = data?.items || [];
    const totalPages = data?.totalPages || 1;

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Message Center</h1>
                    <p className="text-slate-600">View and manage all sent communications</p>
                </div>
                <button
                    onClick={() => setComposeOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Compose Message
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
                <div className="flex flex-wrap gap-4 items-center">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Channel filter */}
                    <select
                        value={filters.channel || ''}
                        onChange={(e) => setFilters({ ...filters, channel: e.target.value as Channel || undefined, page: 1 })}
                        className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Channels</option>
                        <option value="EMAIL">Email</option>
                        <option value="WHATSAPP">WhatsApp</option>
                        <option value="SMS">SMS</option>
                    </select>

                    {/* Status filter */}
                    <select
                        value={filters.status || ''}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value as MessageStatus || undefined, page: 1 })}
                        className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="QUEUED">Queued</option>
                        <option value="SENT">Sent</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="FAILED">Failed</option>
                    </select>

                    <button onClick={() => refetch()} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Messages Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-slate-500">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />
                        Loading messages...
                    </div>
                ) : error ? (
                    <div className="p-12 text-center text-red-500">
                        <AlertCircle className="w-8 h-8 mx-auto mb-3" />
                        <p>Failed to load messages</p>
                        <button onClick={() => refetch()} className="mt-2 text-blue-600 hover:underline">
                            Retry
                        </button>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <Mail className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p className="font-medium">No messages found</p>
                        <p className="text-sm mt-1">Try adjusting your filters</p>
                    </div>
                ) : (
                    <>
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Channel</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Recipient</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Subject</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Status</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Sent At</th>
                                    <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {messages.map((message, index) => {
                                    const status = statusConfig[message.status];
                                    const ChannelIcon = channelIcon[message.channel];
                                    const StatusIcon = status.icon;

                                    return (
                                        <motion.tr
                                            key={message.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.02 }}
                                            className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                                            onClick={() => router.push(`/communication/messages/${message.id}`)}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <ChannelIcon className="w-4 h-4 text-slate-500" />
                                                    <span className="text-sm text-slate-700">{message.channel}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-700">
                                                {message.recipientEmail || message.recipientPhone || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-700 max-w-xs truncate">
                                                {message.subject || '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-500">
                                                {message.sentAt
                                                    ? new Date(message.sentAt).toLocaleString()
                                                    : new Date(message.createdAt).toLocaleString()
                                                }
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => router.push(`/communication/messages/${message.id}`)}
                                                        className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {(message.status === 'FAILED' || message.status === 'BOUNCED') && (
                                                        <button
                                                            onClick={() => handleRetry(message.id)}
                                                            disabled={retryMutation.isPending}
                                                            className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded disabled:opacity-50"
                                                        >
                                                            <RefreshCw className={`w-4 h-4 ${retryMutation.isPending ? 'animate-spin' : ''}`} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
                            <p className="text-sm text-slate-600">
                                Page {filters.page} of {totalPages} ({data?.total || 0} total)
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                                    disabled={(filters.page || 1) <= 1}
                                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                                    disabled={(filters.page || 1) >= totalPages}
                                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Send Message Modal */}
            <SendMessageModal
                open={composeOpen}
                onOpenChange={setComposeOpen}
            />
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
            <MessagesContent />
        </Suspense>
    );
}
