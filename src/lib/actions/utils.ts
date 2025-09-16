import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Database } from "@/lib/types/database";

// Use generated database types as source of truth
type JobType = Database["public"]["Enums"]["job_type"];
type ExperienceLevel = Database["public"]["Enums"]["experience_level"];
type JobCategory = Database["public"]["Enums"]["job_category"];
type CompanyIndustry = Database["public"]["Enums"]["company_industry"];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return "today";
  } else if (diffDays <= 7) {
    return `${diffDays} days ago`;
  } else if (diffDays <= 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}

export function formatSalary(
  min?: number,
  max?: number,
  currency?: string,
): string {
  const curr = currency || "USD";

  if (min && max) {
    return `${curr} ${min.toLocaleString()} - ${curr} ${max.toLocaleString()}`;
  } else if (min) {
    return `From ${curr} ${min.toLocaleString()}`;
  } else if (max) {
    return `Up to ${curr} ${max.toLocaleString()}`;
  } else {
    return "Salary not specified";
  }
}

// Job type labels using database enum values
const JOB_TYPE_LABELS: Record<JobType, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  FREELANCE: "Freelance",
  INTERNSHIP: "Internship",
  APPRENTICESHIP: "Apprenticeship",
} as const;

// Experience level labels using database enum values
const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  ENTRY_LEVEL: "Entry Level",
  JUNIOR: "Junior",
  MID_LEVEL: "Mid Level",
  SENIOR: "Senior",
  EXECUTIVE: "Executive",
} as const;

// Job category labels using database enum values
const JOB_CATEGORY_LABELS: Record<JobCategory, string> = {
  ENGINEERING: "Engineering",
  SALES: "Sales",
  MARKETING: "Marketing",
  DATA: "Data",
  DEVOPS: "DevOps",
  PRODUCT: "Product",
  DESIGN: "Design",
  CLOUD: "Cloud",
  SUPPORT: "Support",
  MANAGEMENT: "Management",
  RESEARCH: "Research",
  LEGAL: "Legal",
  FINANCE: "Finance",
  OPERATIONS: "Operations",
  PR: "PR",
  HR: "HR",
  OTHER: "Other",
} as const;

// Company industry labels using database enum values
const COMPANY_INDUSTRY_LABELS: Record<CompanyIndustry, string> = {
  FINANCE: "Finance",
  HEALTHCARE: "Healthcare",
  EDUCATION: "Education",
  AGRITECH: "Agritech",
  E_COMMERCE: "E-Commerce",
  LOGISTICS: "Logistics",
  REAL_ESTATE: "Real Estate",
  INSURANCE: "Insurance",
  BANKING: "Banking",
  PAYMENTS: "Payments",
  INVESTMENT: "Investment",
  BLOCKCHAIN: "Blockchain",
  AI: "AI",
  DATA: "Data",
  CYBERSECURITY: "Cybersecurity",
  CLOUD: "Cloud",
  SOFTWARE: "Software",
  CONSUMER: "Consumer",
  AGENCY: "Agency",
  MARKETPLACE: "Marketplace",
  MEDIA: "Media",
  TELECOM: "Telecom",
  ENERGY: "Energy",
  TRANSPORTATION: "Transportation",
  OTHER: "Other",
} as const;

export function getJobTypeLabel(type: JobType | string): string {
  return JOB_TYPE_LABELS[type as JobType] || type;
}

export function getExperienceLabel(experienceLevel: ExperienceLevel | string): string {
  return EXPERIENCE_LEVEL_LABELS[experienceLevel as ExperienceLevel] || experienceLevel;
}

export function getJobCategoryLabel(category: JobCategory | string): string {
  return JOB_CATEGORY_LABELS[category as JobCategory] || category;
}

export function getCompanyIndustryLabel(industry: CompanyIndustry | string): string {
  return COMPANY_INDUSTRY_LABELS[industry as CompanyIndustry] || industry;
}

// Utility functions to get all enum values (useful for dropdowns, etc.)
export function getAllJobTypes(): JobType[] {
  return Object.keys(JOB_TYPE_LABELS) as JobType[];
}

export function getAllExperienceLevels(): ExperienceLevel[] {
  return Object.keys(EXPERIENCE_LEVEL_LABELS) as ExperienceLevel[];
}

export function getAllJobCategories(): JobCategory[] {
  return Object.keys(JOB_CATEGORY_LABELS) as JobCategory[];
}

export function getAllCompanyIndustries(): CompanyIndustry[] {
  return Object.keys(COMPANY_INDUSTRY_LABELS) as CompanyIndustry[];
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - 3) + "...";
}

export function getInitials(text: string): string {
  if (!text) return "";

  const words = text.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  const firstInitial = words[0][0];
  const lastInitial = words[words.length - 1][0];

  return (firstInitial + lastInitial).toUpperCase();
}

export function generateNameAbbr(text: string): string {
  return getInitials(text);
}

export function isImageUrl(url: string): boolean {
  if (!url) return false;

  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname.toLowerCase();

    // Check for common image extensions
    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".webp",
      ".svg",
      ".ico",
    ];
    return imageExtensions.some((ext) => pathname.endsWith(ext));
  } catch {
    return false;
  }
}
