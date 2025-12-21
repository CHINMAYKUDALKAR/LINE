"use client"

import * as React from "react"
import {
    Calendar,
    CreditCard,
    Settings,
    User,
    LayoutDashboard,
    Users,
    Video,
    Search,

    Plus,
    Inbox,
    Megaphone,
    FileText,
    Layers,
    Briefcase
} from "lucide-react"
import { useRouter } from "next/navigation"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"

export function CommandPalette() {
    const [open, setOpen] = React.useState(false)
    const router = useRouter()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [])

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <div className="glass backdrop-blur-3xl">
                <CommandInput placeholder="Type a command or search..." />
                <CommandList className="max-h-[350px]">
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                        <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/candidates'))}>
                            <Users className="mr-2 h-4 w-4" />
                            <span>Candidates</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/interviews'))}>
                            <Video className="mr-2 h-4 w-4" />
                            <span>Interviews</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/calendar'))}>
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Calendar</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Quick Actions">
                        <CommandItem onSelect={() => runCommand(() => console.log("New candidate"))}>
                            <Plus className="mr-2 h-4 w-4" />
                            <span>Add Candidate</span>
                            <CommandShortcut>⌘C</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => console.log("New interview"))}>
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Schedule Interview</span>
                            <CommandShortcut>⌘I</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => console.log("New interview"))}>
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Schedule Interview</span>
                            <CommandShortcut>⌘I</CommandShortcut>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Communication">
                        <CommandItem onSelect={() => runCommand(() => router.push('/communication'))}>
                            <Inbox className="mr-2 h-4 w-4" />
                            <span>Inbox</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/communication/campaigns'))}>
                            <Megaphone className="mr-2 h-4 w-4" />
                            <span>Campaigns</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Admin">
                        <CommandItem onSelect={() => runCommand(() => router.push('/admin/users-and-teams'))}>
                            <Users className="mr-2 h-4 w-4" />
                            <span>Users & Teams</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/admin/tenant-settings'))}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Tenant Settings</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Other">
                        <CommandItem onSelect={() => runCommand(() => router.push('/reports'))}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Reports</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/integrations'))}>
                            <Layers className="mr-2 h-4 w-4" />
                            <span>Integrations</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Settings">
                        <CommandItem onSelect={() => runCommand(() => router.push('/settings'))}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/profile'))}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </div>
        </CommandDialog>
    )
}
