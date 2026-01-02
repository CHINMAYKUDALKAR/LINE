'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Settings,
  User,
  ChevronsLeft,
  ChevronsRight,
  Accessibility
} from 'lucide-react';
import { AccessibilitySettingsPanel } from '@/components/accessibility/AccessibilitySettingsPanel';

interface SidebarUserFooterProps {
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onLogout: () => void;
}

export function SidebarUserFooter({ user, collapsed, onCollapsedChange, onLogout }: SidebarUserFooterProps) {
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn('p-3', collapsed ? 'flex flex-col items-center gap-3' : 'space-y-3')}>
      {/* Enhanced Collapse Toggle */}
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCollapsedChange(!collapsed)}
            className={cn(
              'group relative overflow-hidden transition-all duration-300',
              collapsed
                ? 'w-10 h-10 p-0 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 hover:from-blue-50 hover:to-blue-100 hover:shadow-md border border-slate-200/50'
                : 'w-full h-9 justify-start gap-2 px-3 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-blue-50 hover:to-blue-100 border border-slate-200/50 rounded-lg hover:shadow-sm'
            )}
          >
            {/* Animated Icon Container */}
            <span className={cn(
              'flex items-center justify-center transition-transform duration-300',
              !collapsed && 'group-hover:-translate-x-0.5'
            )}>
              {collapsed ? (
                <ChevronsRight className={cn(
                  'h-4 w-4 text-slate-500 transition-all duration-300',
                  'group-hover:text-blue-600 group-hover:scale-110'
                )} />
              ) : (
                <ChevronsLeft className={cn(
                  'h-4 w-4 text-slate-500 transition-all duration-300',
                  'group-hover:text-blue-600 group-hover:scale-110'
                )} />
              )}
            </span>

            {/* Label for expanded state */}
            {!collapsed && (
              <span className="text-sm font-medium text-slate-600 group-hover:text-blue-600 transition-colors duration-200">
                Collapse
              </span>
            )}

            {/* Subtle shine effect on hover */}
            <span className={cn(
              'absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent',
              'group-hover:translate-x-full transition-transform duration-700'
            )} />
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="bg-slate-900 text-white border-0 shadow-lg"
        >
          <div className="flex items-center gap-2">
            {collapsed ? (
              <>
                <PanelLeftOpen className="h-3.5 w-3.5" />
                <span>Expand sidebar</span>
              </>
            ) : (
              <>
                <PanelLeftClose className="h-3.5 w-3.5" />
                <span>Collapse sidebar</span>
              </>
            )}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">⌘ + B</span>
        </TooltipContent>
      </Tooltip>

      {/* Accessibility Settings Button */}
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAccessibilityOpen(true)}
            className={cn(
              'group relative overflow-hidden transition-all duration-300',
              collapsed
                ? 'w-10 h-10 p-0 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 hover:from-indigo-50 hover:to-indigo-100 hover:shadow-md border border-slate-200/50'
                : 'w-full h-9 justify-start gap-2 px-3 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-indigo-50 hover:to-indigo-100 border border-slate-200/50 rounded-lg hover:shadow-sm'
            )}
          >
            <span className={cn(
              'flex items-center justify-center transition-transform duration-300',
              !collapsed && 'group-hover:scale-110'
            )}>
              <Accessibility className={cn(
                'h-4 w-4 text-slate-500 transition-all duration-300',
                'group-hover:text-indigo-600'
              )} />
            </span>
            {!collapsed && (
              <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600 transition-colors duration-200">
                Accessibility
              </span>
            )}
            <span className={cn(
              'absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent',
              'group-hover:translate-x-full transition-transform duration-700'
            )} />
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="bg-slate-900 text-white border-0 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <Accessibility className="h-3.5 w-3.5" />
            <span>Accessibility Settings</span>
          </div>
        </TooltipContent>
      </Tooltip>

      {/* Accessibility Settings Sheet */}
      <Sheet open={accessibilityOpen} onOpenChange={setAccessibilityOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[450px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Accessibility className="h-5 w-5" />
              Accessibility Settings
            </SheetTitle>
            <SheetDescription>
              Customize your experience for better accessibility and comfort.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <AccessibilitySettingsPanel />
          </div>
        </SheetContent>
      </Sheet>

      {/* User Card */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'flex items-center gap-3 w-full p-2 rounded-lg hover:bg-slate-100 transition-all duration-200 text-left group',
              collapsed && 'justify-center p-2'
            )}
          >
            <Avatar className={cn(
              'h-8 w-8 ring-2 ring-transparent transition-all duration-200',
              'group-hover:ring-blue-200 group-hover:ring-offset-1'
            )}>
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 truncate">{user.role}</p>
              </div>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={collapsed ? 'center' : 'end'} side="top" className="w-56">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
