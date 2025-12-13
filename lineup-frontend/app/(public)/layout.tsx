import type { Metadata } from 'next';
import '@/app/globals.css';

export const metadata: Metadata = {
    title: 'Lineup — Interview Management & Scheduling Platform',
    description: 'The modern ATS + Interview Scheduling system for HR teams. Automate scheduling, manage candidates, and track performance.',
    openGraph: {
        title: 'Lineup — Interview Management & Scheduling Platform',
        description: 'The modern ATS + Interview Scheduling system for HR teams.',
        type: 'website',
        url: 'https://lineup.app',
        images: ['/og-image.png'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Lineup — Interview Management & Scheduling Platform',
        description: 'The modern ATS + Interview Scheduling system for HR teams.',
    },
};

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
        </>
    );
}
