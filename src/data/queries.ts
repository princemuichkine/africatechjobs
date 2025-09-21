// Note: This file contains client-safe functions for use in client components only
// Server-side direct database queries are in server-queries.ts
// Functions here use fetch() and are only safe to call from client components after hydration

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
}

export async function getJobs(
  filters: JobFilters = {},
  limit: number = 20,
  offset: number = 0,
) {
  try {
    const params = new URLSearchParams();
    params.set("limit", limit.toString());
    params.set("offset", offset.toString());

    // Add filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, value.toString());
      }
    });

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${baseUrl}/api/jobs?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch jobs");
    }
    const { data, error, count } = await response.json();
    return { data, error, count };
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return { data: null, error, count: 0 };
  }
}

// Search suggestions based on partial input
export async function getSearchSuggestions(query: string, limit: number = 5) {
  try {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${baseUrl}/api/search/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch search suggestions");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching search suggestions:", error);
    return {
      titles: [],
      companies: [],
      locations: [],
    };
  }
}
