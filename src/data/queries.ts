// Note: This file is now client-safe and uses browser client for client components
// Server-side queries have been moved to API routes

export interface JobFilters {
  search?: string;
  country?: string;
  location?: string;
  job_category?: string;
  type?: string;
  experience_level?: string;
  remote?: boolean;
  company_size?: string;
}

export async function getJobById(id: string) {
  try {
    const response = await fetch(`/api/jobs/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch job');
    }
    const { data, error } = await response.json();
    return { data, error };
  } catch (error) {
    console.error("Error fetching job:", error);
    return { data: null, error };
  }
}

export async function getJobs(
  filters: JobFilters = {},
  limit: number = 20,
  offset: number = 0
) {
  try {
    const params = new URLSearchParams();
    params.set('limit', limit.toString());
    params.set('offset', offset.toString());

    // Add filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString());
      }
    });

    const response = await fetch(`/api/jobs?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }
    const { data, error, count } = await response.json();
    return { data, error, count };
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return { data: null, error, count: 0 };
  }
}

export async function getFeaturedJobs(limit: number = 10) {
  try {
    const response = await fetch(`/api/jobs/featured?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch featured jobs');
    }
    const { data, error } = await response.json();
    return { data, error };
  } catch (error) {
    console.error("Error fetching featured jobs:", error);
    return { data: null, error };
  }
}

export async function getJobsByCompany(companyId: string) {
  try {
    const response = await fetch(`/api/jobs/company/${companyId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch jobs by company');
    }
    const { data, error } = await response.json();
    return { data, error };
  } catch (error) {
    console.error("Error fetching jobs by company:", error);
    return { data: null, error };
  }
}

export async function getCompanyProfile(id: string) {
  try {
    const response = await fetch(`/api/companies/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch company profile');
    }
    const { data, error } = await response.json();
    return { data, error };
  } catch (error) {
    console.error("Error fetching company profile:", error);
    return { data: null, error };
  }
}

export async function getUserProfile(slug: string, currentUserId?: string) {
  try {
    const url = currentUserId
      ? `/api/profiles/${slug}?currentUserId=${currentUserId}`
      : `/api/profiles/${slug}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    const { data, error } = await response.json();
    return { data, error };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { data: null, error };
  }
}

// Get all countries for filters
export async function getCountries() {
  try {
    const response = await fetch('/api/countries');
    if (!response.ok) {
      throw new Error('Failed to fetch countries');
    }
    const { data, error } = await response.json();
    return { data, error };
  } catch (error) {
    console.error("Error fetching countries:", error);
    return { data: null, error };
  }
}

// Get cities for a specific country
export async function getCitiesByCountry(countryCode: string) {
  try {
    const response = await fetch(`/api/countries/${countryCode}/cities`);
    if (!response.ok) {
      throw new Error('Failed to fetch cities');
    }
    const { data, error } = await response.json();
    return { data, error };
  } catch (error) {
    console.error("Error fetching cities:", error);
    return { data: null, error };
  }
}

// Get job statistics for dashboard
export async function getJobStats() {
  try {
    const response = await fetch('/api/stats');
    if (!response.ok) {
      throw new Error('Failed to fetch job stats');
    }
    const { data, error } = await response.json();
    return { data, error };
  } catch (error) {
    console.error("Error fetching job stats:", error);
    return { data: null, error };
  }
}

// Search suggestions based on partial input
export async function getSearchSuggestions(query: string, limit: number = 5) {
  try {
    const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch search suggestions');
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
