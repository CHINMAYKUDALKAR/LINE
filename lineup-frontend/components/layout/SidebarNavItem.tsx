import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Video, Calendar, Users, BarChart3, MessageSquare,
  UserCog, Settings, Plug, Activity, Trash2, LucideIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
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
        'group flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl transition-all duration-300 ease-out',
        isActive
          ? 'bg-primary/10 text-primary font-semibold shadow-sm translate-x-1'
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 dark:hover:text-slate-200 dark:hover:bg-slate-800/50',
        collapsed ? 'justify-center px-0 mx-0 w-12 h-12 rounded-2xl mx-auto' : ''
      )}
    >
      <Icon
        className={cn(
          'w-5 h-5 flex-shrink-0 transition-all duration-300',
          isActive ? 'text-primary scale-110' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300',
          collapsed && isActive && 'scale-125'
        )}
        strokeWidth={isActive ? 2 : 1.75}
      />
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -5 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-hidden"
        >
          <span className={cn(
            'text-[14px] font-medium whitespace-nowrap block',
            isActive ? 'text-primary' : ''
          )}>
            {item.title}
          </span>
        </motion.div>
      )}
      {!collapsed && item.badge && item.badge > 0 && (
        <Badge
          variant="secondary"
          className="h-5 min-w-5 px-1.5 text-[10px] bg-primary/10 text-primary rounded-full"
        >
          {item.badge}
        </Badge>
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
