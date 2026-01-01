'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Search,
  LayoutDashboard,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Trash2,
  Activity,
  Plug,
  Video,
  MessageSquare,
  UserCog,
  LucideIcon
} from 'lucide-react';
import { SidebarNavItem } from './SidebarNavItem';
import { SidebarUserFooter } from './SidebarUserFooter';
import { TenantSelector } from './TenantSelector';
import { NavGroup, NavItem as NavItemType, CurrentUser, Tenant } from '@/types/navigation';

// Icon mapping from string to actual icon component
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Trash2,
  Activity,
  Plug,
  Video,
  MessageSquare,
  UserCog,
};

interface AppSidebarProps {
  tenants: Tenant[];
  currentTenantId: string;
  currentUser: CurrentUser;
  mainNav: NavGroup;
  opsNav: NavGroup;
  adminNav: NavGroup;
  onTenantChange: (tenantId: string) => void;
  onLogout: () => void;
}

export function AppSidebar({
  tenants,
  currentTenantId,
  currentUser,
  mainNav,
  opsNav,
  adminNav,
  onTenantChange,
  onLogout,
}: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

  const currentTenant = tenants.find((t) => t.id === currentTenantId);

  // Transform NavItem from types to the format expected by SidebarNavItem
  const transformNavItem = (item: NavItemType) => ({
    name: item.title,
    href: item.path,
    icon: iconMap[item.icon] || LayoutDashboard,
    badge: item.badge,
  });

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-screen bg-white border-r border-slate-200 transition-all duration-300 relative',
        collapsed ? 'w-[68px]' : 'w-64'
      )}
    >
      {/* Header / Tenant Selector */}
      <div className="p-4 border-b border-slate-200">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm cursor-pointer">
                {currentTenant?.name?.charAt(0) || 'L'}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">{currentTenant?.name || 'Lineup'}</TooltipContent>
          </Tooltip>
        ) : (
          <TenantSelector
            tenants={tenants}
            currentTenantId={currentTenantId}
            onTenantChange={onTenantChange}
            collapsed={collapsed}
          />
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-slate-50 border-slate-200 focus:bg-white"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        {/* Main Section */}
        {!collapsed && (
          <div className="mb-2 px-3 py-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Main</span>
          </div>
        )}
        <nav className="space-y-1">
          {mainNav.items.map((item) => {
            const transformed = transformNavItem(item);
            return (
              <SidebarNavItem
                key={transformed.href}
                item={transformed}
                collapsed={collapsed}
                isActive={pathname === transformed.href || pathname.startsWith(transformed.href + '/')}
              />
            );
          })}
        </nav>

        {/* Operations Section */}
        {opsNav && opsNav.items && opsNav.items.length > 0 && (
          <>
            {!collapsed && (
              <div className="mt-6 mb-2 px-3 py-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {opsNav.label || 'Operations'}
                </span>
              </div>
            )}
            <nav className="space-y-1 mt-2">
              {opsNav.items.map((item) => {
                const transformed = transformNavItem(item);
                return (
                  <SidebarNavItem
                    key={transformed.href}
                    item={transformed}
                    collapsed={collapsed}
                    isActive={pathname === transformed.href || pathname.startsWith(transformed.href + '/')}
                  />
                );
              })}
            </nav>
          </>
        )}

        {/* Admin Section */}
        {adminNav && adminNav.items && adminNav.items.length > 0 && (
          <>
            {!collapsed && (
              <div className="mt-6 mb-2 px-3 py-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {adminNav.label || 'Admin'}
                </span>
              </div>
            )}
            <nav className="space-y-1 mt-2">
              {adminNav.items.map((item) => {
                const transformed = transformNavItem(item);
                return (
                  <SidebarNavItem
                    key={transformed.href}
                    item={transformed}
                    collapsed={collapsed}
                    isActive={pathname === transformed.href || pathname.startsWith(transformed.href + '/')}
                  />
                );
              })}
            </nav>
          </>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="mt-auto border-t border-slate-200">
        <SidebarUserFooter
          user={{
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role,
            avatar: currentUser.avatarUrl,
          }}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          onLogout={onLogout}
        />
      </div>
    </aside>
  );
}
