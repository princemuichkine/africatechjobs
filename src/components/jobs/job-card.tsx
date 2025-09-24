"use client";

import { Job, JOB_CATEGORIES } from "@/lib/types/job";
import {
  formatDate,
  formatSalary,
  getJobTypeLabel,
  getExperienceLabel,
} from "@/lib/actions/utils";
import { useAnalytics } from "@/lib/hooks/use-analytics";
import { LottieIcon } from "@/components/design/lottie-icon";
import { animations } from "@/lib/utils/lottie-animations";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";

interface JobCardProps {
  job: Job;
  onViewDetails?: (job: Job) => void;
}

export function JobCard({ job }: JobCardProps) {
  const { trackJobView, trackUserAction } = useAnalytics();

  const handleCardClick = () => {
    // Track job view
    trackJobView(job.id);

    // Track external link click
    trackUserAction("job_external_link_click", {
      job_id: job.id,
      job_title: job.title,
      company_name: job.companyName,
      job_source: job.source,
    });

    // Increment click count - fire and forget
    fetch(`/api/jobs/${job.id}/click`, {
      method: "POST",
    }).catch((error) => console.error("Failed to track click:", error));

    // Open job URL in new window/tab
    window.open(job.url, "_blank");
  };

  return (
    <Card
      className="h-full flex flex-col hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer rounded-sm"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-white mb-1 line-clamp-2">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-foreground/90">
              <LottieIcon
                animationData={animations.store}
                size={16}
                loop={false}
                autoplay={false}
                initialFrame={0}
              />
              <span className="font-medium">
                {job.companyName ||
                  (job as { company_name?: string }).company_name ||
                  "Unknown Company"}
              </span>
            </div>
          </div>
          <div className="flex-shrink-0 ml-4">
            {(() => {
              // Extract main company domain from URL for logo fetching
              const getDomainFromUrl = (url: string) => {
                try {
                  const urlObj = new URL(url);
                  let hostname = urlObj.hostname.replace("www.", "");

                  // Remove common subdomains like careers, jobs, apply, etc.
                  const subdomainsToRemove = [
                    "careers",
                    "jobs",
                    "apply",
                    "recruiting",
                    "talent",
                    "workday",
                    "greenhouse",
                    "lever",
                    "jobvite",
                  ];
                  for (const subdomain of subdomainsToRemove) {
                    if (hostname.startsWith(subdomain + ".")) {
                      hostname = hostname.replace(subdomain + ".", "");
                      break;
                    }
                  }

                  // Take the main domain (everything before the first dot after removing subdomains)
                  return hostname.split(".")[0];
                } catch {
                  return null;
                }
              };

              const domain = job.url ? getDomainFromUrl(job.url) : null;
              const companyName =
                job.companyName ||
                (job as { company_name?: string }).company_name;

              // Check if this is a LinkedIn URL (internal application)
              const isLinkedInUrl =
                job.url &&
                (job.url.includes("linkedin.com") ||
                  job.url.includes("lnkd.in"));

              if (isLinkedInUrl) {
                // Use LinkedIn logo for LinkedIn URLs
                return (
                  <Image
                    src="https://twenty-icons.com/linkedin.com"
                    alt="LinkedIn logo"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-sm object-cover"
                    onError={(e) => {
                      // Fallback to generic icon if logo fails to load
                      e.currentTarget.style.display = "none";
                    }}
                  />
                );
              }

              // Try domain from URL first, then fallback to cleaned company name
              const logoDomain =
                domain ||
                (companyName
                  ? companyName.toLowerCase().replace(/[^a-z0-9]/g, "")
                  : null);

              return logoDomain ? (
                <Image
                  src={`https://twenty-icons.com/${logoDomain}.com`}
                  alt={`${companyName || "Company"} logo`}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-sm object-cover border"
                  onError={(e) => {
                    // Fallback to generic icon if logo fails to load
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center">
                  <LottieIcon
                    animationData={animations.store}
                    size={20}
                    loop={false}
                    autoplay={false}
                    initialFrame={0}
                  />
                </div>
              );
            })()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3 flex-1">
        <div className="space-y-3">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-foreground/90">
            <LottieIcon
              animationData={animations.globe}
              size={16}
              loop={false}
              autoplay={false}
              initialFrame={0}
            />
            <span>
              {job.city && job.country && job.city !== job.country
                ? `${job.city}, ${job.country}`
                : job.city || job.country || "Remote"}
            </span>
          </div>

          {/* Job Type, Experience, Remote, and Sponsored badges */}
          <div className="flex flex-wrap gap-2">
            {/* Special badges first */}
            {job.clicks > 10 && (
              <Badge className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/40 hover:text-red-900 dark:hover:text-red-200">
                Hot
              </Badge>
            )}
            {job.remote && (
              <Badge className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/40 hover:text-emerald-900 dark:hover:text-emerald-200">
                Remote
              </Badge>
            )}
            {(job as { is_sponsored?: boolean }).is_sponsored && (
              <Badge className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/40 hover:text-amber-900 dark:hover:text-amber-200">
                Sponsored
              </Badge>
            )}

            {/* Separator */}
            {(job.remote ||
              (job as { is_sponsored?: boolean }).is_sponsored ||
              job.clicks > 10) && (
              <span className="text-muted-foreground text-xs self-center">
                |
              </span>
            )}

            {/* Category badge */}
            {(job as { job_category?: string }).job_category && (
              <Badge className="text-xs bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40 hover:text-orange-800 dark:hover:text-orange-200">
                {JOB_CATEGORIES.find(
                  (c) =>
                    c.value === (job as { job_category?: string }).job_category,
                )?.label || (job as { job_category?: string }).job_category}
              </Badge>
            )}

            {/* Regular job badges */}
            <Badge className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:text-purple-800 dark:hover:text-purple-200">
              {getJobTypeLabel(job.type || "FULL_TIME")}
            </Badge>
            <Badge className="text-xs bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 hover:text-cyan-800 dark:hover:text-cyan-200">
              {getExperienceLabel(
                job.experienceLevel ||
                  (job as { experience_level?: string }).experience_level ||
                  "ENTRY_LEVEL",
              )}
            </Badge>
          </div>

          {/* Salary and Posted Date on same line */}
          {(job.salary || job.salaryMin || job.salaryMax || job.postedAt) && (
            <div className="flex items-center justify-between text-sm">
              {/* Left side - Salary */}
              {(job.salary || job.salaryMin || job.salaryMax) && (
                <div className="flex items-center gap-2 text-foreground/90">
                  <LottieIcon
                    animationData={animations.coin}
                    size={16}
                    loop={false}
                    autoplay={false}
                    initialFrame={0}
                  />
                  <span>
                    {formatSalary(
                      job.salaryMin ?? undefined,
                      job.salaryMax ?? undefined,
                      job.currency ?? undefined,
                    )}
                  </span>
                </div>
              )}

              {/* Right side - Posted Date */}
              {job.postedAt && (
                <div className="text-muted-foreground">
                  <span>Posted {formatDate(job.postedAt)}</span>
                </div>
              )}
            </div>
          )}

          {/* Description Preview */}
          <p className="text-sm text-foreground/90 line-clamp-3">
            {(() => {
              const firstSentence = job.description?.split(".")[0];
              return firstSentence ? `${firstSentence}.` : "";
            })()}
          </p>

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {job.skills.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{job.skills.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
