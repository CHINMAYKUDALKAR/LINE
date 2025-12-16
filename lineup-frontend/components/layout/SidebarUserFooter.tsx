import Link from 'next/link';
import { Settings, LogOut, PanelLeftClose, PanelLeft } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CurrentUser } from '@/types/navigation';
import { cn } from '@/lib/utils';

interface SidebarUserFooterProps {
  user: CurrentUser;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
}

const roleLabels: Record<string, string> = {
  interviewer: 'Interviewer',
  recruiter: 'Recruiter',
  manager: 'Hiring Manager',
  admin: 'Administrator',
};

export function SidebarUserFooter({
  user,
  collapsed,
  onToggleCollapse,
  onLogout
}: SidebarUserFooterProps) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="mt-auto border-t border-border">
      {/* Collapse Button */}
      <div className={cn('px-3 py-2', collapsed ? 'flex justify-center' : '')}>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className={cn(
                'h-9 text-muted-foreground hover:text-foreground',
                collapsed ? 'w-9 p-0' : 'w-full justify-start gap-2'
              )}
            >
              {collapsed ? (
                <PanelLeft className="w-4 h-4" />
              ) : (
                <>
                  <PanelLeftClose className="w-4 h-4" />
                  <span className="text-sm">Collapse</span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right">Expand Sidebar</TooltipContent>
          )}
        </Tooltip>
      </div>

      {/* User Menu */}
      <div className="px-3 pb-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'w-full flex items-center gap-3 p-2 rounded-lg',
                'hover:bg-muted/50 transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                collapsed ? 'justify-center' : ''
              )}
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-primary">{initials}</span>
                )}
              </div>
              {!collapsed && (
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {roleLabels[user.role] || user.role}
                  </p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={collapsed ? 'center' : 'start'}
            side="top"
            className="w-56 bg-popover border border-border shadow-lg mb-2"
          >
            <div className="px-3 py-2 border-b border-border">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/settings/account" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Account Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onLogout}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
