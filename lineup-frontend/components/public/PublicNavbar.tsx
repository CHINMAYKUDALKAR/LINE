'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, Sparkles, BookOpen, HelpCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

export function PublicNavbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [scrolled, setScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className="sticky top-0 z-50 flex flex-col">
            <nav className={cn(
                "backdrop-blur-md border-b border-transparent transition-all duration-300",
                scrolled ? "border-slate-200 shadow-sm bg-white/90" : "bg-white/50"
            )}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20"> {/* Increased height for better presence */}
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-2 group">
                            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 group-hover:rotate-3 shadow-lg shadow-primary/20">
                                <span className="text-white font-bold text-lg">L</span>
                            </div>
                            <span className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-primary transition-colors">Lineup</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-1">
                            <NavigationMenu>
                                <NavigationMenuList>
                                    <NavigationMenuItem>
                                        <NavigationMenuTrigger className="text-base font-medium">Product</NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                                <li className="row-span-3">
                                                    <NavigationMenuLink asChild>
                                                        <a
                                                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-blue-50/50 to-blue-100/50 p-6 no-underline outline-none focus:shadow-md transition-all hover:bg-blue-50"
                                                            href="#features"
                                                        >
                                                            <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center mb-4 shadow-sm text-primary">
                                                                <Sparkles className="h-5 w-5" />
                                                            </div>
                                                            <div className="mb-2 mt-4 text-lg font-medium text-slate-900">
                                                                The Full Suite
                                                            </div>
                                                            <p className="text-sm leading-tight text-slate-600">
                                                                Everything you need to source, screen, and hire the best talent 10x faster.
                                                            </p>
                                                        </a>
                                                    </NavigationMenuLink>
                                                </li>
                                                <ListItem href="#scheduling" title="Smart Scheduling">
                                                    Eliminate email ping-pong with automated calendar sync.
                                                </ListItem>
                                                <ListItem href="#candidates" title="Candidate Database">
                                                    Unified view of all your candidates and their history.
                                                </ListItem>
                                                <ListItem href="#analytics" title="Analytics">
                                                    Data-driven insights into your hiring funnel.
                                                </ListItem>
                                            </ul>
                                        </NavigationMenuContent>
                                    </NavigationMenuItem>

                                    <NavigationMenuItem>
                                        <NavigationMenuTrigger className="text-base font-medium">Resources</NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <ul className="grid gap-3 p-4 w-[400px]">
                                                <ListItem href="#" title="Documentation">
                                                    <div className="flex items-center gap-2">
                                                        <BookOpen className="w-4 h-4 text-slate-400" />
                                                        <span>Guides & API Reference</span>
                                                    </div>
                                                </ListItem>
                                                <ListItem href="#" title="Blog">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-slate-400" />
                                                        <span>Latest updates & hiring tips</span>
                                                    </div>
                                                </ListItem>
                                                <ListItem href="#" title="Help Center">
                                                    <div className="flex items-center gap-2">
                                                        <HelpCircle className="w-4 h-4 text-slate-400" />
                                                        <span>Support & community</span>
                                                    </div>
                                                </ListItem>
                                            </ul>
                                        </NavigationMenuContent>
                                    </NavigationMenuItem>

                                    <NavigationMenuItem>
                                        <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "text-base font-medium")}>
                                            <Link href="#pricing">
                                                Pricing
                                            </Link>
                                        </NavigationMenuLink>
                                    </NavigationMenuItem>
                                </NavigationMenuList>
                            </NavigationMenu>
                        </div>

                        {/* CTA Buttons */}
                        <div className="hidden md:flex items-center space-x-4">
                            <Link href="/login">
                                <Button variant="ghost" className="text-slate-600 hover:text-slate-900 font-medium text-base">Login</Button>
                            </Link>
                            <Link href="/signup">
                                <Button className="h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 font-medium rounded-full transition-all hover:-translate-y-0.5">
                                    Get Started
                                </Button>
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-slate-600 hover:text-slate-900"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-white border-t border-slate-200 overflow-hidden"
                        >
                            <div className="px-4 py-6 space-y-4">
                                <div className="space-y-3">
                                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">Product</div>
                                    <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1 text-slate-600 hover:text-slate-900">Features</Link>
                                    <Link href="#scheduling" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1 text-slate-600 hover:text-slate-900">Scheduling</Link>
                                    <Link href="#analytics" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1 text-slate-600 hover:text-slate-900">Analytics</Link>
                                </div>
                                <div className="space-y-3">
                                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">Resources</div>
                                    <Link href="#" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1 text-slate-600 hover:text-slate-900">Documentation</Link>
                                    <Link href="#" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1 text-slate-600 hover:text-slate-900">Blog</Link>
                                </div>
                                <Link
                                    href="#pricing"
                                    className="block text-base font-medium text-slate-600 hover:text-slate-900 px-2"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Pricing
                                </Link>
                                <div className="pt-4 border-t border-slate-100 grid gap-3">
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                                        <Button variant="outline" className="w-full justify-center">Login</Button>
                                    </Link>
                                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="w-full">
                                        <Button className="w-full justify-center bg-primary hover:bg-primary/90">Get Started</Button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </header>
    );
}

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-50 focus:bg-slate-50 group",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none text-slate-900 group-hover:text-primary transition-colors">{title}</div>
                    <div className="line-clamp-2 text-sm leading-snug text-slate-500 mt-1">
                        {children}
                    </div>
                </a>
            </NavigationMenuLink>
        </li>
    )
})
ListItem.displayName = "ListItem"
