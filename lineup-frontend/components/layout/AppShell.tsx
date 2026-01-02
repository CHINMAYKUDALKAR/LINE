"use client";

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from './AppSidebar';
import { MobileHeader } from './MobileHeader';
import { CommandPalette, useCommandEvent } from '@/components/command-palette';
import { TooltipProvider } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import {
  mockTenants,
  mockCurrentUser,
  mainNavItems,
  opsNavItems,
  adminNavItems
} from '@/lib/navigation-mock-data';
import { TenantProvider, useTenant } from '@/lib/tenant-context';
import { UploadCandidatesModal } from '@/components/candidates/UploadCandidatesModal';
import { ScheduleInterviewModal } from '@/components/scheduling/ScheduleInterviewModal';

interface AppShellProps {
  children: React.ReactNode;
}

function AppShellContent({ children }: AppShellProps) {
  const router = useRouter();
  const { currentTenantId, setCurrentTenantId } = useTenant();

  // Modal states for keyboard shortcuts
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Listen for command events from keyboard shortcuts
  const handleAddCandidate = useCallback(() => {
    setShowAddCandidateModal(true);
  }, []);

  const handleScheduleInterview = useCallback(() => {
    setShowScheduleModal(true);
  }, []);

  useCommandEvent('ADD_CANDIDATE', handleAddCandidate);
  useCommandEvent('SCHEDULE_INTERVIEW', handleScheduleInterview);

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
      <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden bg-background">
        <MobileHeader
          mainNav={mainNavItems}
          opsNav={opsNavItems}
          adminNav={adminNavItems}
          currentUser={mockCurrentUser}
          onLogout={handleLogout}
        />

        <CommandPalette />

        <AppSidebar
          tenants={mockTenants}
          currentTenantId={currentTenantId}
          currentUser={mockCurrentUser}
          mainNav={mainNavItems}
          opsNav={opsNavItems}
          adminNav={adminNavItems}
          onTenantChange={handleTenantChange}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto bg-slate-50 transition-colors relative">
          {children}
        </main>
      </div>

      {/* Global modals triggered by keyboard shortcuts */}
      <UploadCandidatesModal
        open={showAddCandidateModal}
        onOpenChange={setShowAddCandidateModal}
        onSuccess={() => {
          toast({
            title: 'Candidates Added',
            description: 'Candidates have been imported successfully.',
          });
        }}
      />

      <ScheduleInterviewModal
        open={showScheduleModal}
        onOpenChange={setShowScheduleModal}
        onSuccess={() => {
          toast({
            title: 'Interview Scheduled',
            description: 'The interview has been scheduled successfully.',
          });
        }}
      />
    </TooltipProvider>
  );
}

// Exported wrapper that provides TenantContext
export function AppShell({ children }: AppShellProps) {
  return (
    <TenantProvider initialTenantId={mockCurrentUser.tenantId}>
      <AppShellContent>{children}</AppShellContent>
    </TenantProvider>
  );
}
