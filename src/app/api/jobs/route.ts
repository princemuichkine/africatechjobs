import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Pagination - updated to match queries.ts
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Filters - updated to match queries.ts
    const country = searchParams.get("country");
    const city = searchParams.get("city");
    const type = searchParams.get("type");
    const experienceLevel = searchParams.get("experience_level");
    const remote = searchParams.get("remote");
    const search = searchParams.get("search");
    const job_category = searchParams.get("job_category");
    const company_size = searchParams.get("company_size");
    const is_sponsored = searchParams.get("is_sponsored");
    const date_posted = searchParams.get("date_posted");

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
    if (country) {
      // Handle multiple countries (comma-separated)
      const countries = country.split(",").map((c) => c.trim());
      if (countries.length > 1) {
        query = query.in("country", countries);
      } else {
        query = query.eq("country", country);
      }
    }

    if (city) {
      const cities = city.split(",").map((c) => c.trim());
      if (cities.length > 1) {
        const cityFilters = cities.map((c) => `city.ilike.%${c}%`).join(",");
        query = query.or(cityFilters);
      } else if (cities.length === 1 && cities[0]) {
        query = query.ilike("city", `%${cities[0]}%`);
      }
    }

    if (type) {
      const types = type.split(",").map((t) => t.trim().toUpperCase());
      if (types.length > 1) {
        query = query.in("type", types);
      } else if (types.length === 1 && types[0]) {
        query = query.eq("type", types[0]);
      }
    }

    if (experienceLevel) {
      const experienceLevels = experienceLevel
        .split(",")
        .map((e) => e.trim().toUpperCase());
      if (experienceLevels.length > 1) {
        query = query.in("experience_level", experienceLevels);
      } else if (experienceLevels.length === 1 && experienceLevels[0]) {
        query = query.eq("experience_level", experienceLevels[0]);
      }
    }

    if (remote !== null && remote !== undefined) {
      query = query.eq("remote", remote === "true");
    }

    if (job_category) {
      const jobCategories = job_category
        .split(",")
        .map((c) => c.trim().toUpperCase());
      if (jobCategories.length > 1) {
        query = query.in("job_category", jobCategories);
      } else if (jobCategories.length === 1 && jobCategories[0]) {
        query = query.eq("job_category", jobCategories[0]);
      }
    }

    if (search) {
      query = query.textSearch("search_vector", search, {
        type: "websearch",
        config: "english",
      });
    }

    // Handle company_size filter
    if (company_size) {
      const companySizes = company_size.split(",").map((s) => s.trim());
      if (companySizes.length > 1) {
        // Correct syntax for 'in' filter on a related table
        query = query.filter(
          "companies.size",
          "in",
          `(${companySizes.map((s) => `"${s}"`).join(",")})`,
        );
      } else if (companySizes.length === 1 && companySizes[0]) {
        // Correct syntax for 'eq' filter on a related table
        query = query.filter("companies.size", "eq", companySizes[0]);
      }
    }

    if (is_sponsored === "true") {
      query = query.eq("is_sponsored", true);
    }

    // Handle date_posted filter
    if (date_posted) {
      const now = new Date();
      let dateFrom: Date | undefined;

      switch (date_posted) {
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
          // If invalid value, don't apply filter
          dateFrom = undefined;
          break;
      }

      if (dateFrom) {
        query = query.gte("posted_at", dateFrom.toISOString());
      }
    }

    const { data: jobs, error, count } = await query.range(
      offset,
      offset + limit - 1,
    );

    if (error) {
      console.error("Error fetching jobs:", error);
      return NextResponse.json(
        { error: "Failed to fetch jobs" },
        { status: 500 },
      );
    }

    // Map database fields to camelCase aliases for frontend compatibility
    const mappedJobs = (jobs || []).map((job) => ({
      ...job,
      companyName: job.company_name,
      experienceLevel: job.experience_level,
      postedAt: job.posted_at,
      workplace: job.remote ? "Remote" : "On site",
      link: job.url,
      city: job.city, // Add city field
    }));

    return NextResponse.json({
      data: mappedJobs,
      count: count || 0,
      error: null,
    });
  } catch (error) {
    console.error("Error in jobs API:", error);
    return NextResponse.json(
      { data: null, error: "Internal server error", count: 0 },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from("jobs")
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error("Error creating job:", error);
      return NextResponse.json(
        { error: "Failed to create job" },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error in jobs POST API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
