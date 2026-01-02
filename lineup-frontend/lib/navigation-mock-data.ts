import { Tenant, CurrentUser, NavGroup } from '@/types/navigation';

export const mockTenants: Tenant[] = [
  { id: 'tenant_123', name: 'Mintskill', logo: undefined },
  { id: 'tenant_456', name: 'Mintskill 2', logo: undefined },
];

export const mockCurrentUser: CurrentUser = {
  id: 'user-001',
  name: 'Chinmay Kudalkar',
  email: 'admin@mintskill.com',
  role: 'admin',
  avatarUrl: undefined,
  tenantId: 'tenant_123',
};

export const currentUserRole = mockCurrentUser.role;

export const mainNavItems: NavGroup = {
  items: [
    { title: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { title: 'Interviews', path: '/interviews', icon: 'Video' },
    { title: 'Calendar', path: '/calendar', icon: 'Calendar' },
    { title: 'Candidates', path: '/candidates', icon: 'Users' },
    { title: 'Reports', path: '/reports', icon: 'BarChart3' },
    { title: 'Communication', path: '/communication', icon: 'MessageSquare' },
    { title: 'Recycle Bin', path: '/recycle-bin', icon: 'Trash2' },
  ],
};

// Operations - workflow/action-based modules for business users
export const opsNavItems: NavGroup = {
  label: 'Operations',
  requiredRole: ['admin'],
  items: [
    { title: 'Application Status', path: '/admin/status', icon: 'Activity' },
    { title: 'Pending Approvals', path: '/admin/pending-approvals', icon: 'UserCog' },
    { title: 'Missed Approvals', path: '/admin/missed-approvals', icon: 'UserCog' },
  ],
};

// Admin - configuration/system modules
export const adminNavItems: NavGroup = {
  label: 'Admin',
  requiredRole: ['admin'],
  items: [
    { title: 'Users & Teams', path: '/admin/users-and-teams', icon: 'UserCog' },
    { title: 'Tenant Settings', path: '/admin/tenant-settings', icon: 'Settings' },
    { title: 'Integrations', path: '/integrations', icon: 'Plug' },
    { title: 'System Metrics', path: '/admin/metrics', icon: 'Activity' },
  ],
};
