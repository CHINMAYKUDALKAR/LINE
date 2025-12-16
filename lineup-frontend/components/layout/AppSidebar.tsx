'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Search } from 'lucide-react';
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

  // Platform detection for shortcut hint
  const [shortcutKey, setShortcutKey] = useState<string>('Ctrl');

  useEffect(() => {
    if (typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)) {
      setShortcutKey('⌘');
    }
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

      {/* Search Button */}
      <div className="px-3 py-2">
        {!collapsed ? (
          <Button
            variant="outline"
            className="relative w-full justify-start text-sm text-muted-foreground shadow-sm bg-background/50 h-9"
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
          >
            <Search className="mr-2 h-4 w-4" />
            <span>Search...</span>
            <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">{shortcutKey}</span>K
            </kbd>
          </Button>
        ) : (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        )}
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
