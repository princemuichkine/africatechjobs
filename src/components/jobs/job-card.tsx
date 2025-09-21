"use client";

import { Job } from "@/lib/types/job";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Image from "next/image";

interface JobCardProps {
  job: Job;
  onViewDetails?: (job: Job) => void;
}

export function JobCard({ job, onViewDetails }: JobCardProps) {
  const { trackJobView, trackUserAction } = useAnalytics();

  const handleViewDetails = () => {
    // Track job view
    trackJobView(job.id);

    if (onViewDetails) {
      onViewDetails(job);
    } else {
      // Track external link click
      trackUserAction("job_external_link_click", {
        job_id: job.id,
        job_title: job.title,
        company_name: job.companyName,
        job_source: job.source,
      });
      window.open(job.url, "_blank");
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
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
                    className="w-10 h-10 rounded-sm object-contain bg-white border"
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
                  className="w-10 h-10 rounded-sm object-contain bg-white border"
                  onError={(e) => {
                    // Fallback to generic icon if logo fails to load
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-sm bg-gray-100 flex items-center justify-center">
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

      <CardContent className="pb-3">
        <div className="space-y-3">
          {/* Location and Remote */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
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
            {job.remote && (
              <Badge variant="secondary" className="text-xs">
                Remote
              </Badge>
            )}
          </div>

          {/* Job Type and Experience */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              {getJobTypeLabel(job.type || "FULL_TIME")}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {getExperienceLabel(
                job.experienceLevel ||
                  (job as { experience_level?: string }).experience_level ||
                  "ENTRY_LEVEL",
              )}
            </Badge>
          </div>

          {/* Salary */}
          {(job.salary || job.salaryMin || job.salaryMax) && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
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

          {/* Posted Date */}
          {job.postedAt && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <LottieIcon
                animationData={animations.hourglass}
                size={16}
                loop={false}
                autoplay={false}
                initialFrame={0}
              />
              <span>Posted {formatDate(job.postedAt)}</span>
            </div>
          )}

          {/* Description Preview */}
          <p className="text-sm text-gray-600 line-clamp-3">
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

      <CardFooter className="pt-0">
        <Button
          onClick={handleViewDetails}
          className="w-full"
          variant="default"
        >
          <LottieIcon
            animationData={animations.link}
            size={16}
            loop={false}
            autoplay={false}
            initialFrame={0}
            className="mr-2"
          />
          View Job
        </Button>
      </CardFooter>
    </Card>
  );
}
