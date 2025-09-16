'use client';

import { motion } from 'framer-motion';
import { JobSearchWrapper } from '@/components/jobs/job-search-wrapper';
import CookieConsent from '@/components/design/tracking-cookie';
import { Job } from '@/lib/types/job';

interface HomeClientProps {
    initialFeaturedJobs: Job[];
    initialJobs: Job[];
    initialJobCount: number;
}

export default function HomeClient({
    initialFeaturedJobs,
    initialJobs,
    initialJobCount,
}: HomeClientProps) {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="relative pt-24 md:pt-32 mb-6 text-center">
                <motion.h1
                    className="text-4xl sm:text-5xl md:text-7xl tracking-tighter font-regular text-zinc-800 dark:text-white mb-6"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    Find your next role today.
                </motion.h1>
                <motion.p
                    className="text-xl sm:text-2xl text-zinc-600 dark:text-zinc-300 max-w-4xl mx-auto leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    Discover opportunities from Cape Town to Cairo, Abidjan to Nairobi on the n°1 tech job board with thousands of active positions updated every day.
                </motion.p>
            </div>

            <JobSearchWrapper
                initialFeaturedJobs={initialFeaturedJobs}
                initialJobs={initialJobs}
                initialJobCount={initialJobCount}
            />
            <CookieConsent />
        </div>
    );
}
