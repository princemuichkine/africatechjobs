"use client";

import { useState, useCallback } from "react";
import { JobSearch } from "./job-search";
import { JobList } from "./job-list";
import { JobsFeatured } from "./jobs-featured";
import { getJobs, JobFilters } from "@/data/queries";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Job } from "@/lib/types/job";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
      name: job.company?.name || "Unknown Company",
      slug:
        job.company?.slug ||
        job.company?.name?.toLowerCase().replace(/\s+/g, "-") ||
        "unknown-company",
      image: job.company?.image || job.company?.logo || "",
    },
    workplace: job.workplace || job.remote ? "Remote" : "On-site",
    link: job.link || job.url || "#",
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
  initialJobCount,
}: JobSearchWrapperProps) {
  const router = useRouter();
  const [jobs, setJobs] = useState(initialJobs);
  const [featuredJobs] = useState(
    initialFeaturedJobs.map(transformToFeaturedJob),
  );
  const [loading, setLoading] = useState(false);
  const [jobCount, setJobCount] = useState(initialJobCount);
  const [filters, setFilters] = useState<JobFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 100;

  // Handle filter changes - memoized to prevent infinite re-renders
  const handleFiltersChange = useCallback(async (newFilters: JobFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setLoading(true);

    try {
      const { data: jobsData, count } = await getJobs(
        newFilters,
        jobsPerPage,
        0,
      );
      setJobs(jobsData || []);
      setJobCount(count);
    } catch (error) {
      console.error("Error applying filters:", error);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since we don't depend on any props or state

  // Handle pagination
  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    setLoading(true);

    try {
      const offset = (page - 1) * jobsPerPage;
      const { data: jobsData } = await getJobs(filters, jobsPerPage, offset);
      setJobs(jobsData || []);

      // Scroll to top of results
      window.scrollTo({ top: 400, behavior: "smooth" });
    } catch (error) {
      console.error("Error loading page:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle click on "Ready to hire" CTA with sound
  const handleHireCTAClick = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.preventDefault();

      try {
        // Play click sound
        const audio = new Audio("/sounds/light.mp3");
        audio.play().catch(() => {
          // Ignore audio play failures (user hasn't interacted with page yet, etc.)
        });
      } catch {
        // Ignore audio creation/play failures
      }

      // Navigate to job posting page
      router.push("/jobs/new");
    },
    [router],
  );

  const totalPages = Math.ceil(jobCount / jobsPerPage);
  const getActiveFilterCount = () => {
    // Count filters from the filters object
    let count = 0;

    // Search filter
    if (filters.search && filters.search.trim() !== "") {
      count++;
    }

    // Country filter (can be comma-separated)
    if (filters.country) {
      const countries = filters.country.split(",").filter(c => c.trim() !== "");
      count += countries.length;
    }

    // Other filters
    Object.entries(filters).forEach(([key, value]) => {
      if (
        key !== "search" &&
        key !== "country" &&
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        // For arrays or comma-separated values, count each item
        if (typeof value === "string" && value.includes(",")) {
          const items = value.split(",").filter(item => item.trim() !== "");
          count += items.length;
        } else {
          count++;
        }
      }
    });

    return count;
  };

  const activeFilterCount = getActiveFilterCount();
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <>
      {/* Hero Section with Search */}
      <section className="pt-4 pb-8 px-6">
        <div className="flex flex-col items-center justify-center max-w-screen-md mx-auto">
          <JobSearch
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
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
                <h2 className="text-2xl font-semibold mb-2">Featured jobs</h2>
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
                {hasActiveFilters ? "Search results" : "All jobs"}
              </h2>
              <div className="text-muted-foreground">
                {jobCount > 0 && (
                  <>
                    {hasActiveFilters
                      ? `${jobs.length} jobs on ${jobCount.toLocaleString()} matching your ${activeFilterCount === 1 ? 'criteria' : 'criterias'}`
                      : `${jobs.length} jobs | ${jobCount.toLocaleString()} jobs available`
                    }
                  </>
                )}
              </div>
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
            onJobClick={(job) => {
              // Handle job click - could navigate to job details
              window.open(job.url, "_blank");
            }}
          />
        </section>

        {/* Call to Action */}
        <section className="mt-16">
          <div
            onClick={handleHireCTAClick}
            className="block border rounded-sm p-8 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleHireCTAClick(e);
              }
            }}
          >
            <div className="flex flex-col items-center justify-center text-center space-y-6">
              <div className="text-muted-foreground">
                <Image
                  src="/placeholder/loading_accounts.webp"
                  alt="Ready to hire"
                  className="w-32 h-24 mx-auto"
                  width={80}
                  height={80}
                />
              </div>
              <div className="space-y-3 max-w-2xl">
                <h3 className="text-2xl font-semibold text-zinc-900 dark:text-white">
                  Ready to hire talents ?
                </h3>
                <p className="text-base text-foreground/90 leading-relaxed">
                  Post your job and reach over 100,000+ monthly active tech
                  professionals across Africa&apos;s and the world.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
