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
      .eq("is_active", true)
      .order("is_sponsored", { ascending: false })
      .order("clicks", { ascending: false })
      .order("posted_at", { ascending: false });

    // Apply filters
    if (filters.country) {
      const countries = filters.country.split(",").map((c) => c.trim());
      if (countries.length > 1) {
        query = query.in("country", countries);
      } else {
        query = query.eq("country", filters.country);
      }
    }

    if (filters.city) {
      const cities = filters.city.split(",").map((c) => c.trim());
      if (cities.length > 1) {
        const cityFilters = cities.map((c) => `city.ilike.%${c}%`).join(",");
        query = query.or(cityFilters);
      } else if (cities.length === 1 && cities[0]) {
        query = query.ilike("city", `%${cities[0]}%`);
      }
    }

    if (filters.type) {
      const types = filters.type.split(",").map((t) => t.trim().toUpperCase());
      if (types.length > 1) {
        query = query.in("type", types);
      } else if (types.length === 1 && types[0]) {
        query = query.eq("type", types[0]);
      }
    }

    if (filters.experience_level) {
      const experienceLevels = filters.experience_level
        .split(",")
        .map((e) => e.trim().toUpperCase());
      if (experienceLevels.length > 1) {
        query = query.in("experience_level", experienceLevels);
      } else if (experienceLevels.length === 1 && experienceLevels[0]) {
        query = query.eq("experience_level", experienceLevels[0]);
      }
    }

    if (filters.remote !== undefined && filters.remote !== null) {
      query = query.eq("remote", filters.remote);
    }

    if (filters.job_category) {
      const jobCategories = filters.job_category
        .split(",")
        .map((c) => c.trim().toUpperCase());
      if (jobCategories.length > 1) {
        query = query.in("job_category", jobCategories);
      } else if (jobCategories.length === 1 && jobCategories[0]) {
        query = query.eq("job_category", jobCategories[0]);
      }
    }

    if (filters.search) {
      query = query.textSearch("search_vector", filters.search, {
        type: "websearch",
        config: "english",
      });
    }

    if (filters.company_size) {
      const companySizes = filters.company_size.split(",").map((s) => s.trim());
      if (companySizes.length > 1) {
        query = query.filter(
          "companies.size",
          "in",
          `(${companySizes.map((s) => `"${s}"`).join(",")})`,
        );
      } else if (companySizes.length === 1 && companySizes[0]) {
        query = query.filter("companies.size", "eq", companySizes[0]);
      }
    }

    if (filters.is_sponsored) {
      query = query.eq("is_sponsored", true);
    }

    if (filters.date_posted) {
      const now = new Date();
      let dateFrom: Date | undefined;
      switch (filters.date_posted) {
        case "past_24h":
          dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "past_week":
          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "past_month":
          dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFrom = undefined;
          break;
      }
      if (dateFrom) {
        query = query.gte("posted_at", dateFrom.toISOString());
      }
    }

    const {
      data: jobs,
      error,
      count,
    } = await query.range(offset, offset + limit - 1);

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
