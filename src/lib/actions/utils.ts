import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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

export function getJobTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    FULL_TIME: "Full Time",
    PART_TIME: "Part Time",
    CONTRACT: "Contract",
    FREELANCE: "Freelance",
    INTERNSHIP: "Internship",
    APPRENTICESHIP: "Apprenticeship",
  };

  return labels[type] || type;
}

export function getExperienceLabel(experienceLevel: string): string {
  const labels: Record<string, string> = {
    ENTRY_LEVEL: "Entry Level",
    JUNIOR: "Junior",
    MID_LEVEL: "Mid Level",
    SENIOR: "Senior",
    LEAD: "Lead",
    EXECUTIVE: "Executive",
  };

  return labels[experienceLevel] || experienceLevel;
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
