"use client";

import { JobCard } from "./job-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Job } from "@/lib/types/job";

interface JobListProps {
  jobs: Job[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onJobClick?: (job: Job) => void;
  loading?: boolean;
  error?: string | null;
  totalJobs?: number;
}

export function JobList({
  jobs,
  currentPage,
  totalPages,
  onPageChange,
  onJobClick,
  loading = false,
  error = null,
  totalJobs = 0
}: JobListProps) {

  // Loading state - show beautiful skeleton cards
  if (loading && jobs.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="border rounded-sm p-6">
            <div className="space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state with retry functionality
  if (error) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button onClick={() => onPageChange(1)} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (jobs.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <AlertCircle className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium mb-2">
          No jobs found
        </h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or search terms to find more results.
        </p>
      </div>
    );
  }

  // Generate pagination numbers (same logic as before but cleaner)
  const getPaginationNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="space-y-6">
      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {jobs.length} of {totalJobs.toLocaleString()} jobs
      </div>

      {/* Job cards in grid layout (like the original) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} onViewDetails={onJobClick} />
        ))}
      </div>

      {/* Loading indicator for additional pages (like original) */}
      {loading && jobs.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`loading-${index}`} className="border rounded-sm p-6">
              <div className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Previous button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {getPaginationNumbers().map((page, index) => (
              <div key={index}>
                {page === '...' ? (
                  <span className="px-3 py-2 text-muted-foreground">...</span>
                ) : (
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page as number)}
                    disabled={loading}
                    className="min-w-[40px]"
                  >
                    {page}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Next button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="flex items-center gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Page info */}
      <div className="text-center text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
        {loading && (
          <span className="ml-2 inline-flex items-center">
            <RefreshCw className="h-3 w-3 animate-spin mr-1" />
            Loading...
          </span>
        )}
      </div>
    </div>
  );
}