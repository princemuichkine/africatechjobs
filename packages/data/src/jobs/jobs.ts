import { supabase } from "../../supabase-client";
import { redis } from "@africatechjobs/kv/redis";
import type { Job, JobFilters } from "./types";

const CACHE_TTL = 300; // 5 minutes
const JOBS_CACHE_KEY = "jobs:list";
const STATS_CACHE_KEY = "jobs:stats";

export class JobDataService {
  /**
   * Get jobs with caching and advanced filtering
   */
  async getJobs(filters: JobFilters = {}, useCache = true): Promise<{
    jobs: Job[];
    total: number;
    hasMore: boolean;
  }> {
    const cacheKey = `${JOBS_CACHE_KEY}:${JSON.stringify(filters)}`;

    // Try cache first
    if (useCache) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached as string);
      }
    }

    let query = supabase
      .from("jobs")
      .select("*", { count: "exact" })
      .eq("is_active", true)
      .order("posted_at", { ascending: false });

    // Apply filters
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`);
    }

    if (filters.country) {
      query = query.ilike("country", `%${filters.country}%`);
    }

    if (filters.location) {
      query = query.ilike("location", `%${filters.location}%`);
    }

    if (filters.type) {
      query = query.eq("type", filters.type);
    }

    if (filters.experienceLevel) {
      query = query.eq("experience_level", filters.experienceLevel);
    }

    if (filters.remote !== undefined) {
      query = query.eq("remote", filters.remote);
    }

    if (filters.category) {
      query = query.ilike("category", `%${filters.category}%`);
    }

    // Pagination
    const limit = filters.limit || 20;
    const offset = ((filters.page || 1) - 1) * limit;

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching jobs:", error);
      throw new Error("Failed to fetch jobs");
    }

    const result = {
      jobs: data || [],
      total: count || 0,
      hasMore: (count || 0) > offset + limit,
    };

    // Cache the result
    if (useCache) {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
    }

    return result;
  }

  /**
   * Get job statistics with caching
   */
  async getJobStats(useCache = true): Promise<{
    total: number;
    recent: number;
    byCountry: Record<string, number>;
    byType: Record<string, number>;
    bySource: Record<string, number>;
    lastUpdated: string;
  }> {
    // Try cache first
    if (useCache) {
      const cached = await redis.get(STATS_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached as string);
      }
    }

    // Get total jobs
    const { count: total } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    // Get recent jobs (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recent } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .gte("posted_at", sevenDaysAgo.toISOString());

    // Get country distribution
    const { data: countryData } = await supabase
      .from("jobs")
      .select("country")
      .eq("is_active", true);

    const byCountry: Record<string, number> = {};
    countryData?.forEach(job => {
      byCountry[job.country] = (byCountry[job.country] || 0) + 1;
    });

    // Get type distribution
    const { data: typeData } = await supabase
      .from("jobs")
      .select("type")
      .eq("is_active", true);

    const byType: Record<string, number> = {};
    typeData?.forEach(job => {
      byType[job.type] = (byType[job.type] || 0) + 1;
    });

    // Get source distribution
    const { data: sourceData } = await supabase
      .from("jobs")
      .select("source")
      .eq("is_active", true);

    const bySource: Record<string, number> = {};
    sourceData?.forEach(job => {
      bySource[job.source] = (bySource[job.source] || 0) + 1;
    });

    const result = {
      total: total || 0,
      recent: recent || 0,
      byCountry,
      byType,
      bySource,
      lastUpdated: new Date().toISOString(),
    };

    // Cache for 10 minutes
    if (useCache) {
      await redis.setex(STATS_CACHE_KEY, 600, JSON.stringify(result));
    }

    return result;
  }

  /**
   * Get featured jobs for homepage
   */
  async getFeaturedJobs(limit = 6): Promise<Job[]> {
    const cacheKey = `jobs:featured:${limit}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached as string);
    }

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("is_active", true)
      .order("posted_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching featured jobs:", error);
      return [];
    }

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(data || []));
    return data || [];
  }

  /**
   * Search jobs with fuzzy matching
   */
  async searchJobs(query: string, limit = 20): Promise<Job[]> {
    const cacheKey = `jobs:search:${query}:${limit}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached as string);
    }

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("is_active", true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,company_name.ilike.%${query}%,skills.cs.{${query}}`)
      .order("posted_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error searching jobs:", error);
      return [];
    }

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(data || []));
    return data || [];
  }

  /**
   * Clear all job-related caches
   */
  async clearCache(): Promise<void> {
    const keys = await redis.keys("jobs:*");
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

export const jobDataService = new JobDataService();
