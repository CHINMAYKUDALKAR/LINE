'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { TenantSelector } from './TenantSelector';
import { SidebarNavItem } from './SidebarNavItem';
import { SidebarUserFooter } from './SidebarUserFooter';
import {
    mockTenants,
    mockCurrentUser,
    mainNavItems,
    adminNavItems
} from '@/lib/navigation-mock-data';

export function MobileHeader() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [currentTenantId, setCurrentTenantId] = useState(mockCurrentUser.tenantId);

    const hasAdminAccess = adminNavItems.requiredRole?.includes(mockCurrentUser.role) ?? false;

    return (
        <div className="flex items-center gap-4 p-4 border-b border-border bg-card md:hidden sticky top-0 z-50">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 bg-background">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0 bg-card">
                    <SheetTitle className="hidden">Navigation Menu</SheetTitle>
                    <div className="flex flex-col h-full">
                        {/* Tenant Selector */}
                        <div className="p-3 border-b border-border">
                            <TenantSelector
                                tenants={mockTenants}
                                currentTenantId={currentTenantId}
                                collapsed={false}
                                onTenantChange={(id) => {
                                    setCurrentTenantId(id);
                                    setMobileOpen(false);
                                }}
                            />
                        </div>

                        {/* Navigation */}
                        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
                            <nav className="space-y-1">
                                {mainNavItems.items.map((item) => (
                                    <div key={item.path} onClick={() => setMobileOpen(false)}>
                                        <SidebarNavItem item={item} collapsed={false} />
                                    </div>
                                ))}
                            </nav>

                            {hasAdminAccess && (
                                <div className="space-y-2">
                                    {adminNavItems.label && (
                                        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            {adminNavItems.label}
                                        </p>
                                    )}
                                    <nav className="space-y-1">
                                        {adminNavItems.items.map((item) => (
                                            <div key={item.path} onClick={() => setMobileOpen(false)}>
                                                <SidebarNavItem item={item} collapsed={false} />
                                            </div>
                                        ))}
                                    </nav>
                                </div>
                            )}
                        </div>

                        {/* User Footer */}
                        <SidebarUserFooter
                            user={mockCurrentUser}
                            collapsed={false}
                            onToggleCollapse={() => { }}
                            onLogout={() => setMobileOpen(false)}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            <div className="font-semibold text-lg">Lineup</div>
        </div>
    );
}
