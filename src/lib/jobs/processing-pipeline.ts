import { createClient } from "../supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAIClient } from "../ai/client";

// AI client - lazy loaded for configurability
let aiClient: ReturnType<typeof createAIClient> | null = null;

function getAIClient(): ReturnType<typeof createAIClient> {
  if (!aiClient) {
    const configuredModel = (process.env.AI_MODEL || "gemini") as
      | "gemini"
      | "openai"
      | "anthropic";
    aiClient = createAIClient(configuredModel);
  }
  return aiClient;
}

// DB Enum Types from supabase/migrations/001_tables_triggers.sql
export type JobType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "FREELANCE"
  | "INTERNSHIP"
  | "APPRENTICESHIP";
export type ExperienceLevel =
  | "ENTRY_LEVEL"
  | "JUNIOR"
  | "MID_LEVEL"
  | "SENIOR"
  | "EXECUTIVE";

// Define types to replace 'any'
interface RawJobData {
  position?: string;
  description?: string; // Now extracted by Puppeteer
  company?: string;
  city?: string;
  date?: string; // Expecting a "YYYY-MM-DD" format from the scraper
  salary?: string;
  jobUrl?: string;
  source?: string;
  remote?: boolean; // Whether the job is remote
  // New fields from Puppeteer extraction
  sourceId?: string;
  isSponsored?: boolean; // Visa sponsorship and relocation benefits
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  applyUrl?: string;
  [key: string]: unknown;
}

interface NormalizedJob {
  title: string;
  description: string; // Now extracted by Puppeteer
  company_name: string;
  city: string;
  country: string;
  posted_at: string;
  type: string;
  experience_level: string;
  salary?: string;
  url: string;
  source: string;
  skills?: string[];
  remote?: boolean;
  // New fields from Puppeteer extraction
  sourceId?: string;
  isSponsored?: boolean; // Visa sponsorship and relocation benefits
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  applyUrl?: string;
}

interface ProcessedJob extends NormalizedJob {
  coordinates?: { lat: number; lng: number };
  company?: { id: string; name: string };
  extracted_skills: string[];
  quality_score: number;
  categories: string[];
  job_category?:
    | "ENGINEERING"
    | "SALES"
    | "MARKETING"
    | "DATA"
    | "DEVOPS"
    | "PRODUCT"
    | "DESIGN"
    | "CLOUD"
    | "SUPPORT"
    | "MANAGEMENT"
    | "RESEARCH"
    | "LEGAL"
    | "FINANCE"
    | "OPERATIONS"
    | "PR"
    | "HR"
    | "OTHER";
  is_tech_job: boolean; // Now required
  is_visa_sponsored: boolean; // Visa sponsorship information
}

export class JobProcessingPipeline {
  private supabase?: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  private async getSupabaseClient(): Promise<SupabaseClient> {
    if (this.supabase) {
      return this.supabase;
    }
    try {
      return await createClient();
    } catch (error) {
      console.error("Failed to create Supabase client:", error);
      throw new Error(
        "Database connection not available. Please check your Supabase configuration.",
      );
    }
  }

  async processIncomingJob(
    rawJobData: RawJobData,
    source: string,
    knownCountry?: string,
  ): Promise<{ status: string; jobId?: string }> {
    try {
      // 1. Data Validation & Normalization
      const normalizedJob = this.normalizeJobData(
        rawJobData,
        source,
        knownCountry,
      );

      // 2. Duplicate Detection (using fuzzy matching)
      const isDuplicate = await this.detectDuplicate(normalizedJob);
      if (isDuplicate) return { status: "duplicate", jobId: isDuplicate.id };

      // 3. AI Enrichment & Tech Job Validation
      const enrichedJob = await this.enrichJobData(normalizedJob);

      // 4. Filter out non-tech jobs identified by AI
      if (enrichedJob.is_tech_job === false) {
        return { status: "not_tech_job" };
      }

      // 5. Category Classification (from scraper parameters, not AI)
      const classifiedJob = await this.classifyJob(enrichedJob);

      // 6. Quality Scoring with AI input
      const qualityScore = await this.calculateQualityScore(classifiedJob);
      if (qualityScore < 0.3) return { status: "low_quality" }; // Lower threshold since AI helps

      // 7. Save to Database
      const savedJob = await this.saveJob(classifiedJob);

      // 8. Real-time Notifications - Placeholder
      await this.triggerNotifications();

      return { status: "success", jobId: savedJob.id };
    } catch (error) {
      console.error("Error processing job:", error);
      return { status: "error" };
    }
  }

  private normalizeJobData(
    rawJobData: RawJobData,
    source: string,
    knownCountry?: string,
  ): NormalizedJob {
    const posted_at = this.parsePostedAt(rawJobData.date);

    return {
      title: rawJobData.position || "Untitled Position",
      description: rawJobData.description || "", // Now extracted by Puppeteer
      company_name: rawJobData.company || "Unknown Company",
      city: rawJobData.city || "Remote",
      country: knownCountry || "Unknown",
      posted_at: posted_at,
      type: this.normalizeJobType(undefined),
      experience_level: this.normalizeExperienceLevel(undefined),
      salary: rawJobData.salary,
      url: rawJobData.applyUrl || rawJobData.jobUrl || "", // Use apply URL if available
      source,
      skills: [],
      remote: rawJobData.remote || false,
      // New fields from Puppeteer
      sourceId: rawJobData.sourceId,
      isSponsored: rawJobData.isSponsored,
      salaryMin: rawJobData.salaryMin,
      salaryMax: rawJobData.salaryMax,
      currency: rawJobData.currency,
      applyUrl: rawJobData.applyUrl,
    };
  }

  private parseCountryFromLocation(location: string): string {
    if (!location || location.toLowerCase() === "remote") {
      return "Remote";
    }
    // A simple approach: assume the country is the last part of a comma-separated string
    const parts = location.split(",").map((part) => part.trim());
    return parts[parts.length - 1];
  }

  private parsePostedAt(dateStr?: string): string {
    // The scraper provides a date string in "YYYY-MM-DD" format.
    if (dateStr && !isNaN(new Date(dateStr).getTime())) {
      return new Date(dateStr).toISOString();
    }
    // Fallback to now if the date is invalid or not provided
    return new Date().toISOString();
  }

  private normalizeJobType(
    type?: string,
  ):
    | "FULL_TIME"
    | "PART_TIME"
    | "CONTRACT"
    | "FREELANCE"
    | "INTERNSHIP"
    | "APPRENTICESHIP" {
    const normalized = type?.toUpperCase().replace("-", "_") || "FULL_TIME";
    switch (normalized) {
      case "FULL_TIME":
      case "PART_TIME":
      case "CONTRACT":
      case "FREELANCE":
      case "INTERNSHIP":
      case "APPRENTICESHIP":
        return normalized;
      default:
        return "FULL_TIME";
    }
  }

  private normalizeExperienceLevel(
    level?: string,
  ): "ENTRY_LEVEL" | "JUNIOR" | "MID_LEVEL" | "SENIOR" | "EXECUTIVE" {
    const normalized = level?.toUpperCase().replace("-", "_") || "MID_LEVEL";
    switch (normalized) {
      case "ENTRY_LEVEL":
      case "JUNIOR":
      case "MID_LEVEL":
      case "SENIOR":
      case "EXECUTIVE":
        return normalized;
      default:
        return "MID_LEVEL";
    }
  }

  private async detectDuplicate(
    job: NormalizedJob,
  ): Promise<{ id: string } | null> {
    const supabase = await this.getSupabaseClient();
    const { data, error } = await supabase
      .from("jobs")
      .select("id")
      .eq("url", job.url)
      .single();

    if (error && error.code !== "PGRST116") {
      // Ignore 'not found' error
      console.error("Error detecting duplicate:", error);
      return null;
    }
    return data;
  }

  private async calculateSimilarity(): Promise<{
    match: { id: string } | null;
    score: number;
  }> {
    // Placeholder for similarity calculation
    // In a real implementation, this would use fuzzy string matching
    return { match: null, score: 0 };
  }

  private async enrichJobData(job: NormalizedJob): Promise<ProcessedJob> {
    // Use AI for ultra-fast tech validation and sponsored detection
    const enrichedData = await this.enrichJobWithAI(job);

    return {
      ...job,
      coordinates: { lat: 0, lng: 0 },
      company: { id: "placeholder", name: job.company_name },
      extracted_skills: [],
      quality_score: enrichedData.quality_score,
      categories: [], // Category comes from scraper parameters
      is_tech_job: enrichedData.is_tech_job === 1,
      is_visa_sponsored: enrichedData.is_visa_sponsored,
    };
  }

  private async enrichJobWithAI(job: NormalizedJob): Promise<{
    is_tech_job: 1 | 0;
    quality_score: number;
    is_visa_sponsored: boolean;
  }> {
    try {
      // Use the configurable AI client for tech job validation with description
      const result = await getAIClient().validateTechJob(
        job.title,
        job.company_name,
        job.city,
        job.description,
      );

      return {
        is_tech_job: result.is_tech_job,
        quality_score: result.quality_score,
        is_visa_sponsored: result.is_visa_sponsored === 1,
      };
    } catch (error) {
      console.warn("AI validation failed, defaulting to tech job:", error);
      return {
        is_tech_job: 1, // Default to tech for our board
        quality_score: 0.5,
        is_visa_sponsored: false,
      };
    }
  }

  private async classifyJob(job: ProcessedJob): Promise<ProcessedJob> {
    // AI already provided categories in enrichJobData, use those as primary
    // Fall back to keyword mapping if AI didn't provide categories
    if (
      job.categories &&
      job.categories.length > 0 &&
      job.categories[0] !== "OTHER"
    ) {
      return {
        ...job,
        job_category: job.categories[0] as
          | "ENGINEERING"
          | "SALES"
          | "MARKETING"
          | "DATA"
          | "DEVOPS"
          | "PRODUCT"
          | "DESIGN"
          | "CLOUD"
          | "SUPPORT"
          | "MANAGEMENT"
          | "RESEARCH"
          | "LEGAL"
          | "FINANCE"
          | "OPERATIONS"
          | "PR"
          | "HR"
          | "OTHER",
      };
    }

    // Fallback to keyword mapping if AI didn't categorize properly
    const supabase = await this.getSupabaseClient();
    const { data: mappings, error } = await supabase
      .from("role_category_mappings")
      .select("keyword, category");

    if (error) {
      console.error("Error fetching role mappings:", error);
      return { ...job, categories: ["OTHER"], job_category: "OTHER" };
    }

    const title = job.title.toLowerCase();
    let assignedCategory: string | null = null;

    // Find the first matching keyword in the job title
    for (const mapping of mappings) {
      if (title.includes(mapping.keyword.toLowerCase())) {
        assignedCategory = mapping.category;
        break;
      }
    }

    return {
      ...job,
      categories: [assignedCategory || "OTHER"],
      job_category: (assignedCategory || "OTHER") as
        | "ENGINEERING"
        | "SALES"
        | "MARKETING"
        | "DATA"
        | "DEVOPS"
        | "PRODUCT"
        | "DESIGN"
        | "CLOUD"
        | "SUPPORT"
        | "MANAGEMENT"
        | "RESEARCH"
        | "LEGAL"
        | "FINANCE"
        | "OPERATIONS"
        | "PR"
        | "HR"
        | "OTHER",
    };
  }

  private async calculateQualityScore(job: ProcessedJob): Promise<number> {
    // AI already provided quality score during enrichment
    // Add additional validation checks
    let score = job.quality_score;

    // Additional quality checks
    if (job.title && job.title.length >= 5) score += 0.1;
    if (job.company_name && job.company_name !== "Unknown Company")
      score += 0.1;
    if (job.city && job.city !== "Remote") score += 0.1;
    if (job.url && job.url.includes("linkedin.com")) score += 0.1; // Valid LinkedIn URL
    if (job.remote !== undefined) score += 0.05; // Remote field is set

    // Cap at 1.0
    return Math.min(score, 1.0);
  }

  private async saveJob(job: ProcessedJob): Promise<{ id: string }> {
    const supabase = await this.getSupabaseClient();

    const { data, error } = await supabase
      .from("jobs")
      .insert({
        title: job.title,
        description: job.description,
        company_name: job.company_name,
        city: job.city,
        country: job.country,
        type: job.type as JobType,
        experience_level: job.experience_level as ExperienceLevel,
        salary: job.salary,
        salary_min: job.salaryMin,
        salary_max: job.salaryMax,
        currency: job.currency || "USD",
        remote: job.remote || false,
        url: job.url,
        source: job.source,
        source_id: job.sourceId,
        posted_at: job.posted_at,
        job_category: job.categories[0] as
          | "ENGINEERING"
          | "SALES"
          | "MARKETING"
          | "DATA"
          | "DEVOPS"
          | "PRODUCT"
          | "DESIGN"
          | "CLOUD"
          | "SUPPORT"
          | "MANAGEMENT"
          | "RESEARCH"
          | "LEGAL"
          | "FINANCE"
          | "OPERATIONS"
          | "PR"
          | "HR"
          | "OTHER",
        is_sponsored: job.is_visa_sponsored || false,
        is_active: true,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error saving job:", error);
      throw error;
    }

    return data;
  }

  private async triggerNotifications(): Promise<void> {
    // Placeholder for triggering notifications
    // In a real implementation, this would send notifications to relevant users
  }
}
