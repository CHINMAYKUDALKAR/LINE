import { Tenant, CurrentUser, NavGroup } from '@/types/navigation';

export const mockTenants: Tenant[] = [
  { id: 'tenant_123', name: 'Mintskill', logo: undefined },
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
