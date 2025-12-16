"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

import { IntegrationCard } from '@/components/integrations/IntegrationCard';
import { IntegrationDetailPanel } from '@/components/integrations/IntegrationDetailPanel';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Integration } from '@/types/integrations';
import { IntegrationsHeader } from '@/components/integrations/IntegrationsHeader';
import * as integrationsApi from '@/lib/api/integrations';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';

export default function Integrations() {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    // Always allow access (real RBAC should use auth context)
    const hasAccess = true;

    const fetchIntegrations = useCallback(async () => {
        if (!hasAccess) return;

        setIsLoading(true);
        setError(null);

        try {
            // Try to fetch from API first
            const data = await integrationsApi.getIntegrations();

            // Merge API data with available providers (to show disconnected ones)
            const availableProviders = integrationsApi.getAvailableProviders();
            const connectedProviderIds = data.map(i => i.provider);

            // Create Integration objects for providers not yet connected
            const disconnectedIntegrations: Integration[] = availableProviders
                .filter(p => !connectedProviderIds.includes(p.id as any))
                .map(p => ({
                    id: `available-${p.id}`,
                    tenantId: '',
                    provider: p.id as Integration['provider'],
                    name: p.name,
                    description: p.description,
                    status: 'disconnected' as const,
                    authType: p.authType,
                    supportedObjects: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }));

            setIntegrations([...data, ...disconnectedIntegrations]);
        } catch (err) {
            console.error('Failed to fetch integrations:', err);
            setError('Failed to load integrations. Please try again.');
            // Don't fall back to mock data - show error state
            setIntegrations([]);
        } finally {
            setIsLoading(false);
        }
    }, [hasAccess]);

    useEffect(() => {
        fetchIntegrations();
    }, [fetchIntegrations]);

    const filteredIntegrations = integrations.filter((integration) => {
        const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            integration.provider.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || integration.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleConfigure = (id: string) => {
        const integration = integrations.find((i) => i.id === id);
        if (integration) {
            setSelectedIntegration(integration);
            setIsPanelOpen(true);
        }
    };

    const handleConnect = async (id: string) => {
        const integration = integrations.find((i) => i.id === id);
        if (!integration) return;

        // For disconnected integrations, initiate OAuth flow
        if (integration.status === 'disconnected') {
            setIsConnecting(true);
            try {
                const response = await integrationsApi.connect(integration.provider);
                if (response.authUrl) {
                    // Redirect to OAuth provider
                    window.location.href = response.authUrl;
                }
            } catch (err) {
                console.error('Failed to initiate connection:', err);
                toast.error('Connection Failed', {
                    description: `Could not connect to ${integration.name}. Please try again.`
                });
                // Open panel for manual configuration if OAuth fails
                setSelectedIntegration(integration);
                setIsPanelOpen(true);
            } finally {
                setIsConnecting(false);
            }
        } else {
            // For connected integrations, open the panel
            setSelectedIntegration(integration);
            setIsPanelOpen(true);
        }
    };

    const handleDisconnect = async (provider: string) => {
        try {
            await integrationsApi.disconnect(provider);
            toast.success('Disconnected', {
                description: `Successfully disconnected the integration.`
            });
            // Refresh the list
            fetchIntegrations();
        } catch (err) {
            console.error('Failed to disconnect:', err);
            toast.error('Disconnect Failed', {
                description: 'Could not disconnect the integration. Please try again.'
            });
        }
    };

    const handleSync = async (provider: string) => {
        try {
            const response = await integrationsApi.triggerSync(provider);
            if (response.success) {
                toast.success('Sync Started', {
                    description: response.message || 'Sync job has been queued.'
                });
            }
        } catch (err) {
            console.error('Failed to trigger sync:', err);
            toast.error('Sync Failed', {
                description: 'Could not start sync. Please try again.'
            });
        }
    };

    const handleAddNew = () => {
        toast.info('Add Integration', { description: 'Select an integration card and click "Connect" to get started.' });
    };

    const handleUpdateIntegration = (updated: Integration) => {
        setIntegrations(integrations.map((i) => (i.id === updated.id ? updated : i)));
        setSelectedIntegration(updated);
    };

    if (!hasAccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <span className="text-2xl">🔒</span>
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Admin Access Required</h2>
                <p className="text-muted-foreground max-w-md">
                    Only administrators can manage integrations. Please contact your admin for access.
                </p>
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
                <div className="space-y-6">
                    <motion.div variants={fadeInUp}>
                        <IntegrationsHeader
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            statusFilter={statusFilter}
                            onStatusFilterChange={setStatusFilter}
                            onAddNew={handleAddNew}
                        />
                    </motion.div>

                    {error && (
                        <motion.div
                            variants={staggerItem}
                            className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive"
                        >
                            {error}
                        </motion.div>
                    )}

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="bg-card rounded-lg border border-border p-5">
                                    <div className="flex items-start gap-3">
                                        <Skeleton className="w-10 h-10 rounded-lg" />
                                        <div className="flex-1">
                                            <Skeleton className="h-5 w-32 mb-2" />
                                            <Skeleton className="h-4 w-48" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-6 w-full mt-4" />
                                    <Skeleton className="h-4 w-24 mt-3" />
                                    <Skeleton className="h-9 w-full mt-4" />
                                </div>
                            ))}
                        </div>
                    ) : filteredIntegrations.length === 0 ? (
                        <motion.div variants={staggerItem} className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <span className="text-2xl">🔌</span>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">No integrations found</h3>
                            <p className="text-muted-foreground max-w-md">
                                {searchQuery || statusFilter !== 'all'
                                    ? 'Try adjusting your search or filters.'
                                    : 'Get started by adding your first integration.'}
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            variants={staggerItem}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        >
                            {filteredIntegrations.map((integration, index) => (
                                <motion.div
                                    key={integration.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <IntegrationCard
                                        integration={integration}
                                        onConfigure={handleConfigure}
                                        onConnect={handleConnect}
                                        isConnecting={isConnecting}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    <IntegrationDetailPanel
                        integration={selectedIntegration}
                        isOpen={isPanelOpen}
                        onClose={() => {
                            setIsPanelOpen(false);
                            setSelectedIntegration(null);
                        }}
                        onUpdate={handleUpdateIntegration}
                        onDisconnect={handleDisconnect}
                        onSync={handleSync}
                    />
                </div>
            </motion.main>
        </div>
    );
}
