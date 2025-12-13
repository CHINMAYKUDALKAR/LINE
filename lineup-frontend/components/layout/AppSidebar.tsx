'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { TenantSelector } from './TenantSelector';
import { SidebarNavItem } from './SidebarNavItem';
import { SidebarUserFooter } from './SidebarUserFooter';
import { Tenant, CurrentUser, NavGroup } from '@/types/navigation';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  tenants: Tenant[];
  currentTenantId: string;
  currentUser: CurrentUser;
  mainNav: NavGroup;
  adminNav: NavGroup;
  onTenantChange: (tenantId: string) => void;
  onLogout: () => void;
}

export function AppSidebar({
  tenants,
  currentTenantId,
  currentUser,
  mainNav,
  adminNav,
  onTenantChange,
  onLogout,
}: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Check if user has admin access
  const hasAdminAccess = adminNav.requiredRole?.includes(currentUser.role) ?? false;

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(false);
      } else if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Tenant Selector */}
      <div className="p-3 border-b border-border">
        <TenantSelector
          tenants={tenants}
          currentTenantId={currentTenantId}
          collapsed={isMobile ? false : collapsed}
          onTenantChange={(id) => {
            onTenantChange(id);
            if (isMobile) setMobileOpen(false);
          }}
        />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {/* Main Navigation */}
        <nav className="space-y-1">
          {mainNav.items.map((item) => (
            <div key={item.path} onClick={() => isMobile && setMobileOpen(false)}>
              <SidebarNavItem
                item={item}
                collapsed={isMobile ? false : collapsed}
              />
            </div>
          ))}
        </nav>

        {/* Admin Navigation */}
        {hasAdminAccess && (
          <div className="space-y-2">
            {!collapsed && !isMobile && adminNav.label && (
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {adminNav.label}
              </p>
            )}
            {(isMobile || (!isMobile && !collapsed)) && adminNav.label && collapsed && (
              <div className="h-px bg-border mx-2" />
            )}
            {isMobile && adminNav.label && (
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {adminNav.label}
              </p>
            )}
            <nav className="space-y-1">
              {adminNav.items.map((item) => (
                <div key={item.path} onClick={() => isMobile && setMobileOpen(false)}>
                  <SidebarNavItem
                    item={item}
                    collapsed={isMobile ? false : collapsed}
                  />
                </div>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* User Footer */}
      <SidebarUserFooter
        user={currentUser}
        collapsed={isMobile ? false : collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onLogout={() => {
          onLogout();
          if (isMobile) setMobileOpen(false);
        }}
      />
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-card shadow-sm">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-card">
            <SidebarContent isMobile />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col h-full bg-card border-r border-border',
          'transition-all duration-300 ease-in-out flex-shrink-0',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
