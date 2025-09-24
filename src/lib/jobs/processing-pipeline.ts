import { createTriggerClient } from "../supabase/trigger";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAIClient } from "../ai/client";
import type {
  JobTypeValue,
  ExperienceLevelValue,
  JobCategoryValue,
} from "../types/job";

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
  job_category?: JobCategoryValue;
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
  job_category?: JobCategoryValue;
}

interface ProcessedJob extends NormalizedJob {
  coordinates?: { lat: number; lng: number };
  company?: { id: string; name: string };
  extracted_skills: string[];
  quality_score: number;
  categories: string[];
  job_category?: JobCategoryValue;
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
      return createTriggerClient();
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
    category?: string,
  ): Promise<{ status: string; jobId?: string }> {
    try {
      // 1. Data Validation & Normalization
      const normalizedJob = this.normalizeJobData(
        rawJobData,
        source,
        knownCountry,
        category,
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
      if (qualityScore < 0.5) {
        console.log(
          `🚫 REJECTED: Low quality score (${qualityScore.toFixed(2)}) for "${classifiedJob.title}" at ${classifiedJob.company_name}`,
        );
        return { status: "low_quality" };
      }

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
    category?: string,
  ): NormalizedJob {
    const posted_at = this.parsePostedAt(rawJobData.date);

    const title = rawJobData.position || "Untitled Position";
    let jobType: JobTypeValue = "FULL_TIME";
    let experienceLevel: ExperienceLevelValue = "MID_LEVEL";

    // Heuristic pre-classification for internships. AI will still override this if it runs successfully.
    // This provides a better fallback if AI fails for jobs that are clearly internships.
    if (
      /\b(intern|internship|stagiaire|stage|pasantía|prácticas|becario)\b/i.test(
        title,
      )
    ) {
      jobType = "INTERNSHIP";
      experienceLevel = "ENTRY_LEVEL";
    }

    return {
      title: title,
      description: rawJobData.description || "", // Now extracted by Puppeteer
      company_name: rawJobData.company || "Unknown Company",
      city: rawJobData.city || "", // Default to empty string instead of "Remote"
      country: knownCountry || "Unknown",
      posted_at: posted_at,
      type: jobType, // AI will override this
      experience_level: experienceLevel, // AI will override this
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
      job_category: category
        ? (category.toUpperCase() as JobCategoryValue)
        : undefined,
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

  // Removed normalization functions - AI now handles job type and experience level classification

  private async detectDuplicate(
    job: NormalizedJob,
  ): Promise<{ id: string } | null> {
    const supabase = await this.getSupabaseClient();

    // Strategy 1: Check by source ID (most reliable)
    if (job.sourceId) {
      const { data: jobBySourceId, error: sourceIdError } = await supabase
        .from("jobs")
        .select("id")
        .eq("source_id", job.sourceId)
        .eq("source", job.source)
        .maybeSingle();

      if (sourceIdError && sourceIdError.code !== "PGRST116") {
        console.error("Error checking duplicate by source ID:", sourceIdError);
      }
      if (jobBySourceId) {
        console.log(`- DUPLICATE found by source_id: ${jobBySourceId.id}`);
        return jobBySourceId;
      }
    }

    // Strategy 2: Check by exact URL (fallback)
    const { data: jobByUrl, error: urlError } = await supabase
      .from("jobs")
      .select("id")
      .eq("url", job.url)
      .maybeSingle();

    if (urlError && urlError.code !== "PGRST116") {
      console.error("Error checking duplicate by URL:", urlError);
    }
    if (jobByUrl) {
      console.log(`- DUPLICATE found by url: ${jobByUrl.id}`);
      return jobByUrl;
    }

    // Strategy 3: Fuzzy match on title and company within a 7-day window
    try {
      const sevenDaysAgo = new Date(
        new Date(job.posted_at).getTime() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const sevenDaysFromNow = new Date(
        new Date(job.posted_at).getTime() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString();

      const { data: fuzzyMatch, error: fuzzyError } = await supabase.rpc(
        "find_similar_jobs",
        {
          comp_name: job.company_name,
          job_title: job.title,
          start_date: sevenDaysAgo,
          end_date: sevenDaysFromNow,
        },
      );

      if (fuzzyError) {
        console.error("Error during fuzzy match RPC:", fuzzyError);
      }

      if (fuzzyMatch && fuzzyMatch.length > 0) {
        console.log(`- DUPLICATE found by fuzzy match: ${fuzzyMatch[0].id}`);
        return fuzzyMatch[0];
      }
    } catch (e) {
      console.error("Error with fuzzy matching:", e);
    }

    return null;
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
    // Use AI for comprehensive job analysis - all fields now AI-powered!
    const enrichedData = await this.enrichJobWithAI(job);

    // Prevent AI from overwriting a valid city with "Remote" if scraper says it's not remote
    const finalCity =
      enrichedData.standardized_city.toLowerCase() === "remote" &&
      !enrichedData.is_remote
        ? job.city // Trust the scraper's city if it's not a remote job
        : enrichedData.standardized_city;

    const hasAiSalary =
      enrichedData.salary_min != null || enrichedData.salary_max != null;

    return {
      ...job,
      remote: enrichedData.is_remote, // Use AI's remote decision
      // Override with AI-determined values
      title: enrichedData.cleaned_title, // Use AI-cleaned title
      city: finalCity && finalCity.toLowerCase() !== "null" ? finalCity : "",
      type: enrichedData.job_type,
      experience_level: enrichedData.experience_level,
      salaryMin: hasAiSalary ? enrichedData.salary_min : job.salaryMin,
      salaryMax: hasAiSalary ? enrichedData.salary_max : job.salaryMax,
      currency: hasAiSalary ? enrichedData.currency : job.currency,
      description: enrichedData.summarized_description, // Use AI-summarized description
      url:
        enrichedData.extracted_apply_url !== "LINKEDIN"
          ? enrichedData.extracted_apply_url
          : job.url,
      // Processed job fields
      coordinates: { lat: 0, lng: 0 },
      company: { id: "placeholder", name: job.company_name },
      extracted_skills: [],
      quality_score: enrichedData.quality_score,
      categories: [job.job_category || "OTHER"], // Use scraper category, fallback to OTHER
      job_category: (job.job_category || "OTHER") as JobCategoryValue,
      is_tech_job: enrichedData.is_tech_job === 1,
      is_visa_sponsored: enrichedData.is_visa_sponsored,
    };
  }

  private async enrichJobWithAI(job: NormalizedJob): Promise<{
    is_tech_job: 1 | 0;
    quality_score: number;
    is_visa_sponsored: boolean;
    is_remote: boolean;
    job_type: string;
    experience_level: string;
    salary_min?: number;
    salary_max?: number;
    currency: string;
    standardized_city: string;
    extracted_apply_url: string;
    company_website: string;
    summarized_description: string;
    cleaned_title: string;
  }> {
    try {
      // Use the configurable AI client for comprehensive job analysis
      const result = await getAIClient().validateTechJob(
        job.title,
        job.company_name,
        job.city,
        job.description,
        job.salary, // Pass salary text for AI to parse
      );

      return {
        is_tech_job: result.is_tech_job,
        quality_score: result.quality_score,
        is_visa_sponsored: result.is_visa_sponsored === 1,
        is_remote: result.is_remote === 1,
        job_type: result.job_type,
        experience_level: result.experience_level,
        salary_min: result.salary_min ?? undefined,
        salary_max: result.salary_max ?? undefined,
        currency: result.currency,
        standardized_city: result.standardized_city,
        extracted_apply_url: result.extracted_apply_url,
        company_website: result.company_website,
        summarized_description: result.summarized_description,
        cleaned_title: result.cleaned_title,
      };
    } catch (error) {
      console.warn("AI validation failed, using defaults:", error);
      return {
        is_tech_job: 1, // Default to tech for our board
        quality_score: 0.5,
        is_visa_sponsored: false,
        is_remote: job.remote || false, // Fallback to scraper's value
        job_type: "FULL_TIME",
        experience_level: "MID_LEVEL",
        currency: "USD",
        standardized_city: job.city || "Remote",
        extracted_apply_url: "LINKEDIN",
        company_website: "unknown.com",
        summarized_description:
          job.description?.substring(0, 270) ||
          "Job description not available.",
        cleaned_title: job.title, // Default to original title if AI fails
      };
    }
  }

  private async classifyJob(job: ProcessedJob): Promise<ProcessedJob> {
    // AI now handles all job classification - this method is simplified
    // The job category is already set by AI in enrichJobData
    return job;
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
        type: job.type as JobTypeValue,
        experience_level: job.experience_level as ExperienceLevelValue,
        salary: job.salary,
        salary_min: job.salaryMin,
        salary_max: job.salaryMax,
        currency: job.currency || "USD",
        remote: job.remote || false,
        url: job.url,
        source: job.source,
        source_id: job.sourceId,
        posted_at: job.posted_at,
        job_category: job.categories[0] as JobCategoryValue,
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
