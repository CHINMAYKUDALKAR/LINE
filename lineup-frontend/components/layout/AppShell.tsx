"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from './AppSidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import {
  mockTenants,
  mockCurrentUser,
  mainNavItems,
  adminNavItems
} from '@/lib/navigation-mock-data';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const [currentTenantId, setCurrentTenantId] = useState(mockCurrentUser.tenantId);

  const handleTenantChange = (tenantId: string) => {
    setCurrentTenantId(tenantId);
    const tenant = mockTenants.find((t) => t.id === tenantId);
    toast({
      title: 'Tenant Switched',
      description: `Now viewing ${tenant?.name || 'Unknown'}`,
    });
  };

  const handleLogout = () => {
    // Clear access token
    localStorage.removeItem('accessToken');

    toast({
      title: 'Signed out',
      description: 'You have been successfully signed out.',
    });

    // Redirect to login page
    router.push('/login');
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar
          tenants={mockTenants}
          currentTenantId={currentTenantId}
          currentUser={mockCurrentUser}
          mainNav={mainNavItems}
          adminNav={adminNavItems}
          onTenantChange={handleTenantChange}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto bg-slate-50 transition-colors">
          {children}
        </main>
      </div>
    </TooltipProvider>
  );
}
