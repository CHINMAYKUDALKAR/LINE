'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, ShieldCheck, CreditCard, Users, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export function Hero() {
    return (
        <section className="relative overflow-hidden bg-white pt-8 pb-16 sm:pt-12 sm:pb-24 lg:pb-32 lg:pt-16">
            {/* Background decoration */}
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                    {/* Left Column: Text */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="text-left"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 backdrop-blur-sm px-3 py-1 text-sm font-medium text-primary mb-6 shadow-sm"
                        >
                            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                            New: Smart Interview Scheduling
                        </motion.div>

                        {/* Headline */}
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight mb-6 leading-[1.1]">
                            Hire Top Talent,
                            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary to-sky-500 animate-gradient-x pb-2">
                                Without the Chaos
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <p className="mt-4 text-xl text-slate-600 max-w-lg leading-relaxed mb-8">
                            Lineup streamlines your entire hiring process. From sourcing to scheduling, manage it all in one cohesive dashboard designed for modern teams.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-start items-center sm:items-stretch w-full sm:w-auto">
                            <Link href="/signup">
                                <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 w-full sm:w-auto">
                                    Start Hiring for Free
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="#contact">
                                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all hover:-translate-y-0.5 w-full sm:w-auto">
                                    <Calendar className="mr-2 h-5 w-5 text-slate-600" />
                                    Book a Demo
                                </Button>
                            </Link>
                        </div>

                        {/* Trust indicators */}
                        <div className="mt-10 flex items-center justify-start gap-x-8 gap-y-4 text-sm font-medium text-slate-500 flex-wrap">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                                SOC2 Compliant
                            </div>
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-primary" />
                                No credit card required
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Image */}
                    <div className="relative mt-8 lg:mt-0">
                        <motion.div
                            initial={{ opacity: 0, x: 20, rotateY: -10 }}
                            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, type: "spring", bounce: 0.2 }}
                            className="relative rounded-xl lg:rounded-2xl shadow-2xl shadow-blue-900/20 border border-slate-200/60 bg-white/50 backdrop-blur-sm p-2 w-full max-w-[600px] mx-auto lg:mx-0 lg:ml-auto"
                        >
                            <Image
                                src="/images/dashboard-hero.png"
                                alt="Lineup Dashboard Preview"
                                width={1200}
                                height={800}
                                className="rounded-lg lg:rounded-xl shadow-sm w-full h-auto"
                                priority
                            />

                            {/* Floating Cards (Decorative) */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="absolute -left-12 bottom-12 bg-white p-4 rounded-lg shadow-xl border border-slate-100 hidden lg:block max-w-[220px]"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-800">Auto-Scheduled</div>
                                        <div className="text-[10px] text-slate-500">Interview with Sarah</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    Confirmed for 2:00 PM
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Bottom Gradient */}
            <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-white to-transparent"></div>
        </section>
    );
}
