'use client';

import { useState } from 'react';
import { JobSearch } from './job-search';
import { JobList } from './job-list';
import { JobsFeatured } from './jobs-featured';
import { getJobs, JobFilters } from '@/data/queries';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Job } from '@/lib/types/job';

// Type for JobsFeatured component (different from main Job type)
type FeaturedJob = {
    id: string;
    title: string;
    description: string;
    company: {
        name: string;
        slug: string;
        image: string;
    };
    workplace: string;
    link: string;
};

// Transform API job data to JobsFeatured format
function transformToFeaturedJob(job: Job): FeaturedJob {
    return {
        id: job.id,
        title: job.title,
        description: job.description,
        company: {
            name: job.company?.name || 'Unknown Company',
            slug: job.company?.slug || job.company?.name?.toLowerCase().replace(/\s+/g, '-') || 'unknown-company',
            image: job.company?.image || job.company?.logo || '',
        },
        workplace: job.workplace || job.remote ? 'Remote' : 'On-site',
        link: job.link || job.url || '#',
    };
}

interface JobSearchWrapperProps {
    initialFeaturedJobs: Job[];
    initialJobs: Job[];
    initialJobCount: number;
}

export function JobSearchWrapper({
    initialFeaturedJobs,
    initialJobs,
    initialJobCount
}: JobSearchWrapperProps) {
    const [jobs, setJobs] = useState(initialJobs);
    const [featuredJobs] = useState(initialFeaturedJobs.map(transformToFeaturedJob));
    const [loading, setLoading] = useState(false);
    const [jobCount, setJobCount] = useState(initialJobCount);
    const [filters, setFilters] = useState<JobFilters>({});
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 20;

    // Handle filter changes
    const handleFiltersChange = async (newFilters: JobFilters) => {
        setFilters(newFilters);
        setCurrentPage(1);
        setLoading(true);

        try {
            const { data: jobsData, count } = await getJobs(newFilters, jobsPerPage, 0);
            setJobs(jobsData || []);
            setJobCount(count);
        } catch (error) {
            console.error('Error applying filters:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle pagination
    const handlePageChange = async (page: number) => {
        setCurrentPage(page);
        setLoading(true);

        try {
            const offset = (page - 1) * jobsPerPage;
            const { data: jobsData } = await getJobs(filters, jobsPerPage, offset);
            setJobs(jobsData || []);

            // Scroll to top of results
            window.scrollTo({ top: 400, behavior: 'smooth' });
        } catch (error) {
            console.error('Error loading page:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(jobCount / jobsPerPage);
    const hasActiveFilters = Object.keys(filters).some(key =>
        key !== 'search' && filters[key as keyof JobFilters] !== undefined
    ) || (filters.search && filters.search.length > 0);

    return (
        <>
            {/* Hero Section with Search */}
            <section className="bg-gradient-to-b from-background to-muted/50 py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <JobSearch
                        onFiltersChange={handleFiltersChange}
                        initialFilters={filters}
                        jobCount={jobCount}
                    />
                </div>
            </section>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Featured Jobs Section */}
                {!hasActiveFilters && featuredJobs.length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-semibold mb-2">Featured Jobs</h2>
                                <p className="text-muted-foreground">
                                    Premium opportunities from top African companies
                                </p>
                            </div>
                            <Badge variant="secondary" className="hidden sm:flex">
                                {featuredJobs.length} featured
                            </Badge>
                        </div>
                        <JobsFeatured data={featuredJobs} />
                        <Separator className="mt-8" />
                    </section>
                )}

                {/* Jobs Results Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-semibold mb-2">
                                {hasActiveFilters ? 'Search Results' : 'All Jobs'}
                            </h2>
                            <p className="text-muted-foreground">
                                {loading ? (
                                    <Skeleton className="h-4 w-48" />
                                ) : (
                                    <>
                                        {jobCount.toLocaleString()} jobs found
                                        {hasActiveFilters && ' matching your criteria'}
                                    </>
                                )}
                            </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-4">
                            <Link
                                href="/jobs/new"
                                className="text-sm text-primary hover:underline border-b border-dashed border-primary/50"
                            >
                                Post a job
                            </Link>
                            <Badge variant="outline">
                                Page {currentPage} of {totalPages || 1}
                            </Badge>
                        </div>
                    </div>

                    {/* Jobs List */}
                    <JobList
                        jobs={jobs}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        loading={loading}
                        totalJobs={jobCount}
                        onJobClick={(job) => {
                            // Handle job click - could navigate to job details
                            window.open(job.url, '_blank');
                        }}
                    />
                </section>

                {/* Call to Action */}
                <section className="mt-16 text-center py-12 bg-muted/50 rounded-lg">
                    <h3 className="text-2xl font-semibold mb-4">
                        Ready to hire top African talent?
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                        Post your job and reach over 200,000+ monthly active tech professionals
                        across Africa&apos;s fastest-growing tech ecosystems.
                    </p>
                    <Link
                        href="/jobs/new"
                        className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Post a Job
                    </Link>
                </section>
            </main>
        </>
    );
}
