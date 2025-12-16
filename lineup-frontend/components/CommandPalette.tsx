'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
    CalendarIcon,
    LayoutDashboardIcon,
    SettingsIcon,
    UsersIcon,
    FileTextIcon,
    MegaphoneIcon,
    InboxIcon,
    BriefcaseIcon,
    LayersIcon,
} from 'lucide-react';

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';

export function CommandPalette() {
    const [open, setOpen] = React.useState(false);
    const router = useRouter();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                    <CommandItem
                        onSelect={() => runCommand(() => router.push('/dashboard'))}
                    >
                        <LayoutDashboardIcon className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push('/candidates'))}
                    >
                        <UsersIcon className="mr-2 h-4 w-4" />
                        <span>Candidates</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push('/interviews'))}
                    >
                        <BriefcaseIcon className="mr-2 h-4 w-4" />
                        <span>Interviews</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push('/calendar'))}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span>Calendar</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Communication">
                    <CommandItem
                        onSelect={() => runCommand(() => router.push('/communication'))}
                    >
                        <InboxIcon className="mr-2 h-4 w-4" />
                        <span>Inbox</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push('/communication/campaigns'))}
                    >
                        <MegaphoneIcon className="mr-2 h-4 w-4" />
                        <span>Campaigns</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Admin">
                    <CommandItem
                        onSelect={() => runCommand(() => router.push('/admin/users-and-teams'))}
                    >
                        <UsersIcon className="mr-2 h-4 w-4" />
                        <span>Users & Teams</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push('/admin/tenant-settings'))}
                    >
                        <SettingsIcon className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Other">
                    <CommandItem
                        onSelect={() => runCommand(() => router.push('/reports'))}
                    >
                        <FileTextIcon className="mr-2 h-4 w-4" />
                        <span>Reports</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push('/integrations'))}
                    >
                        <LayersIcon className="mr-2 h-4 w-4" />
                        <span>Integrations</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
