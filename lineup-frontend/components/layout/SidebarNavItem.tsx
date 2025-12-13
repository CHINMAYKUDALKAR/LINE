import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Video, Calendar, Users, BarChart3, MessageSquare,
  UserCog, Settings, Plug, Activity, Trash2, LucideIcon
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { NavItem } from '@/types/navigation';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Video,
  Calendar,
  Users,
  BarChart3,
  MessageSquare,
  UserCog,
  Settings,
  Plug,
  Activity,
  Trash2,
};

interface SidebarNavItemProps {
  item: NavItem;
  collapsed: boolean;
}

export function SidebarNavItem({ item, collapsed }: SidebarNavItemProps) {
  const pathname = usePathname();
  const Icon = iconMap[item.icon] || LayoutDashboard;

  const isActive =
    item.path === '/'
      ? pathname === '/' || pathname === '/dashboard'
      : pathname === item.path || pathname?.startsWith(`${item.path}/`);

  const linkContent = (
    <Link
      href={item.path}
      className={cn(
        'group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150',
        isActive
          ? 'bg-primary/10 text-primary dark:bg-primary/15 dark:text-blue-400 font-semibold border-l-[3px] border-primary ml-0 pl-[9px]'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 border-l-[3px] border-transparent ml-0 pl-[9px]',
        collapsed ? 'justify-center px-2' : ''
      )}
    >
      <Icon
        className={cn(
          'w-5 h-5 flex-shrink-0 transition-colors',
          isActive ? 'text-primary dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
        )}
        strokeWidth={1.75}
      />
      {!collapsed && (
        <>
          <span className={cn(
            'text-sm font-medium flex-1',
            isActive ? 'text-primary' : ''
          )}>
            {item.title}
          </span>
          {item.badge && item.badge > 0 && (
            <Badge
              variant="secondary"
              className="h-5 min-w-5 px-1.5 text-xs bg-primary/10 text-primary"
            >
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          {linkContent}
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {item.title}
          {item.badge && item.badge > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {item.badge}
            </Badge>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}
