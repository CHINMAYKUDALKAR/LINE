'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
    getRecycleBinItems,
    getRecycleBinStats,
    restoreRecycleBinItem,
    purgeRecycleBinItem,
    RecycleBinItem,
    RecycleBinStats,
    RecycleBinFilters
} from '@/lib/api/recycle-bin';
import { RecycleBinTable } from '@/components/recycle-bin/RecycleBinTable';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, FileText, Trash2 } from 'lucide-react';

export default function RecycleBinPage() {
    const { accessToken: token, tenants, activeTenantId } = useAuth();
    const { toast } = useToast();
    const [items, setItems] = useState<RecycleBinItem[]>([]);
    const [stats, setStats] = useState<RecycleBinStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [restoringId, setRestoringId] = useState<string | null>(null);
    const [purgingId, setPurgingId] = useState<string | null>(null);
    const [filters, setFilters] = useState<RecycleBinFilters>({});

    // Get current tenant role
    const activeTenant = tenants.find(t => t.id === activeTenantId);
    const userRole = activeTenant?.role || '';

    // Check if user is admin (can see all items and purge)
    const isAdmin = ['ADMIN', 'SUPERADMIN', 'SUPPORT'].includes(userRole.toUpperCase());

    const loadData = async () => {
        if (!token) return;
        try {
            setIsLoading(true);
            const [itemsResponse, statsResponse] = await Promise.all([
                getRecycleBinItems(token, filters),
                getRecycleBinStats(token)
            ]);
            setItems(itemsResponse.data);
            setStats(statsResponse);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load recycle bin data',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [token, filters]);

    const handleRestore = async (item: RecycleBinItem) => {
        if (!token) return;
        try {
            setRestoringId(item.id);
            await restoreRecycleBinItem(item.id, token);
            toast({
                title: 'Restored',
                description: 'Item has been restored successfully',
            });
            await loadData();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to restore item',
                variant: 'destructive',
            });
        } finally {
            setRestoringId(null);
        }
    };

    const handlePurge = async (item: RecycleBinItem) => {
        if (!token) return;
        if (!confirm('Are you sure you want to permanently delete this item? This cannot be undone.')) {
            return;
        }

        try {
            setPurgingId(item.id);
            await purgeRecycleBinItem(item.id, token);
            toast({
                title: 'Deleted',
                description: 'Item has been permanently deleted',
            });
            await loadData();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete item',
                variant: 'destructive',
            });
        } finally {
            setPurgingId(null);
        }
    };

    const handleFilterChange = (key: keyof RecycleBinFilters, value: string | undefined) => {
        setFilters(prev => ({
            ...prev,
            [key]: value === 'all' ? undefined : value
        }));
    };

    const getModuleIcon = (module: string) => {
        switch (module) {
            case 'candidate': return <Users className="h-4 w-4" />;
            case 'interview': return <Calendar className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Trash2 className="h-8 w-8" />
                        Recycle Bin
                    </h2>
                    <p className="text-muted-foreground">
                        {isAdmin
                            ? 'View and manage all deleted items in your organization'
                            : 'View and restore items you have deleted'
                        }
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Deleted</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <Trash2 className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    {stats.byModule.map(({ module, count }) => (
                        <Card key={module}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground capitalize">{module}s</p>
                                        <p className="text-2xl font-bold">{count}</p>
                                    </div>
                                    {getModuleIcon(module)}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Filters */}
            <div className="flex gap-4 items-center">
                <Select
                    value={filters.module || 'all'}
                    onValueChange={(value) => handleFilterChange('module', value)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="candidate">Candidates</SelectItem>
                        <SelectItem value="interview">Interviews</SelectItem>
                        <SelectItem value="file">Files</SelectItem>
                        <SelectItem value="template">Templates</SelectItem>
                    </SelectContent>
                </Select>

                {!isAdmin && (
                    <Badge variant="secondary" className="text-xs">
                        Showing only your deleted items
                    </Badge>
                )}
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading...</p>
                    </div>
                </div>
            ) : (
                <RecycleBinTable
                    items={items}
                    onRestore={handleRestore}
                    onPurge={handlePurge}
                    isRestoring={restoringId}
                    isPurging={purgingId}
                    isAdmin={isAdmin}
                />
            )}
        </div>
    );
}
