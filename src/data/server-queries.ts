// Server-side data queries that directly use Supabase client
// These are safe to use in server components and during SSR

import { createClient } from "@/lib/supabase/server";

export interface JobFilters {
  search?: string;
  country?: string;
  city?: string;
  job_category?: string;
  type?: string;
  experience_level?: string;
  remote?: boolean;
  company_size?: string;
  is_sponsored?: boolean;
  date_posted?: string;
}

export async function getFeaturedJobsServer(limit: number = 10) {
  try {
    const supabase = await createClient();

    const { data: jobs, error } = await supabase
      .from("jobs")
      .select(
        `
        *,
        companies (
          id,
          name,
          logo,
          website,
          size,
          industry
        )
      `,
      )
      .eq("is_active", true)
      .eq("is_sponsored", true)
      .order("posted_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching featured jobs:", error);
      return { data: null, error };
    }

    return { data: jobs || [], error: null };
  } catch (error) {
    console.error("Error fetching featured jobs:", error);
    return { data: null, error };
  }
}

export async function getJobsServer(
  filters: JobFilters = {},
  limit: number = 100,
  offset: number = 0,
) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("jobs")
      .select(
        `
        *,
        companies (
          id,
          name,
          logo,
          website,
          size,
          industry
        )
      `,
        { count: "exact" },
      )
      .eq("is_active", true);

    // Apply filters
    if (filters.search) {
      query = query.ilike("title", `%${filters.search}%`);
    }

    if (filters.country) {
      query = query.eq("country", filters.country);
    }

    if (filters.city) {
      query = query.ilike("location", `%${filters.city}%`);
    }

    if (filters.job_category) {
      query = query.eq("job_category", filters.job_category);
    }

    if (filters.type) {
      query = query.eq("type", filters.type);
    }

    if (filters.experience_level) {
      query = query.eq("experience_level", filters.experience_level);
    }

    if (filters.remote !== undefined) {
      query = query.eq("remote", filters.remote);
    }

    if (filters.company_size) {
      query = query.eq("companies.size", filters.company_size);
    }

    if (filters.is_sponsored !== undefined) {
      query = query.eq("is_sponsored", filters.is_sponsored);
    }

    const {
      data: jobs,
      error,
      count,
    } = await query
      .order("posted_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching jobs:", error);
      return { data: null, error, count: 0 };
    }

    return { data: jobs || [], error: null, count: count || 0 };
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return { data: null, error, count: 0 };
  }
}

export async function getJobByIdServer(id: string) {
  try {
    const supabase = await createClient();

    const { data: job, error } = await supabase
      .from("jobs")
      .select(
        `
        *,
        companies (
          id,
          name,
          logo,
          website,
          size,
          industry
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching job:", error);
      return { data: null, error };
    }

    return { data: job, error: null };
  } catch (error) {
    console.error("Error fetching job:", error);
    return { data: null, error };
  }
}

export async function getUserProfileServer(slug: string) {
  try {
    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return { data: null, error };
    }

    return { data: profile, error: null };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { data: null, error };
  }
}
