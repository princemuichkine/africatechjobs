"use client";

import { Job, JOB_CATEGORIES } from "@/lib/types/job";
import {
  formatDate,
  formatSalary,
  getJobTypeLabel,
  getExperienceLabel,
} from "@/lib/actions/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LottieIcon } from "@/components/design/lottie-icon";
import { animations } from "@/lib/utils/lottie-animations";
import { motion } from "framer-motion";
import Image from "next/image";

interface JobDetailsClientProps {
  job: Job;
}

export default function JobDetailsClient({ job }: JobDetailsClientProps) {
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
    job.companyName || (job as { company_name?: string }).company_name;

  // Check if this is a LinkedIn URL (internal application)
  const isLinkedInUrl =
    job.url &&
    (job.url.includes("linkedin.com") || job.url.includes("lnkd.in"));

  return (
    <>
      <div className="flex flex-col items-center justify-center max-w-screen-md mx-auto px-6 py-12 pb-32">
        {/* Hero Section */}
        <div className="relative pt-8 sm:pt-20 md:pt-20 pb-2 sm:pb-4 mb-0 text-center">
          <motion.h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl tracking-tighter font-regular text-zinc-800 dark:text-white mb-2 sm:mb-4 leading-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {job.title}
          </motion.h1>
        </div>

        {/* Content Sections */}
        <motion.div
          className="space-y-8 sm:space-y-12 mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Company Section */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-zinc-900 dark:text-white">
              Company
            </h2>
            <div className="flex items-center gap-4">
              {(() => {
                if (isLinkedInUrl) {
                  // Use LinkedIn logo for LinkedIn URLs
                  return (
                    <Image
                      src="https://twenty-icons.com/linkedin.com"
                      alt="LinkedIn logo"
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-sm object-cover"
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
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-sm object-cover border"
                    onError={(e) => {
                      // Fallback to generic icon if logo fails to load
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-sm bg-muted flex items-center justify-center">
                    <LottieIcon
                      animationData={animations.store}
                      size={24}
                      loop={false}
                      autoplay={false}
                      initialFrame={0}
                    />
                  </div>
                );
              })()}
              <div className="flex items-center gap-2">
                <LottieIcon
                  animationData={animations.store}
                  size={20}
                  loop={false}
                  autoplay={false}
                  initialFrame={0}
                />
                <span className="font-medium text-lg">
                  {companyName || "Unknown Company"}
                </span>
              </div>
            </div>
          </section>

          {/* Location Section */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-zinc-900 dark:text-white">
              Location
            </h2>
            <div className="flex items-center gap-2">
              <LottieIcon
                animationData={animations.globe}
                size={20}
                loop={false}
                autoplay={false}
                initialFrame={0}
              />
              <span className="text-foreground/90">
                {job.city && job.country && job.city !== job.country
                  ? `${job.city}, ${job.country}`
                  : job.city || job.country || "Remote"}
              </span>
            </div>
          </section>

          {/* Job Details Section */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-zinc-900 dark:text-white">
              Job Details
            </h2>
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
                      c.value ===
                      (job as { job_category?: string }).job_category,
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
          </section>

          {/* Salary and Posted Date Section */}
          {(job.salary || job.salaryMin || job.salaryMax || job.postedAt) && (
            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-zinc-900 dark:text-white">
                Compensation & Timeline
              </h2>
              <div className="space-y-2">
                {/* Salary */}
                {(job.salary || job.salaryMin || job.salaryMax) && (
                  <div className="flex items-center gap-2">
                    <LottieIcon
                      animationData={animations.coin}
                      size={20}
                      loop={false}
                      autoplay={false}
                      initialFrame={0}
                    />
                    <span className="text-foreground/90">
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
                  <div className="text-muted-foreground">
                    <span>Posted {formatDate(job.postedAt)}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Description Section */}
          {job.description && (
            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-zinc-900 dark:text-white">
                Job Description
              </h2>
              <p className="text-foreground/90 text-sm sm:text-base leading-relaxed tracking-tight whitespace-pre-wrap">
                {job.description}
              </p>
            </section>
          )}

          {/* Skills Section */}
          {job.skills && job.skills.length > 0 && (
            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-zinc-900 dark:text-white">
                Required Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {(job.skills as string[]).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Apply Button */}
          <section>
            <div className="pt-4">
              <Button
                asChild
                className="w-full h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/40 hover:text-blue-900 dark:hover:text-blue-200 border border-blue-300 dark:border-blue-800"
              >
                <a href={job.url} target="_blank" rel="noopener noreferrer">
                  Apply for this position
                </a>
              </Button>
            </div>
          </section>
        </motion.div>
      </div>
    </>
  );
}
