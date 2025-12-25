'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Menu, X, LayoutDashboard, Users, Calendar, BarChart3, Settings } from 'lucide-react';

const mobileNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Candidates', href: '/candidates', icon: Users },
    { name: 'Interviews', href: '/interviews', icon: Calendar },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export function MobileHeader() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    return (
        <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white">
            <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    L
                </div>
                <span className="font-semibold text-slate-900">Lineup</span>
            </Link>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] p-0">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <div className="flex flex-col h-full">
                        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                            <span className="font-semibold text-slate-900">Menu</span>
                            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <nav className="flex-1 p-4 space-y-1">
                            {mobileNavItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        className={cn(
                                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                            isActive
                                                ? 'bg-indigo-50 text-indigo-700'
                                                : 'text-slate-600 hover:bg-slate-100'
                                        )}
                                    >
                                        <Icon className={cn('h-5 w-5', isActive ? 'text-indigo-600' : 'text-slate-400')} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </SheetContent>
            </Sheet>
        </header>
    );
}
