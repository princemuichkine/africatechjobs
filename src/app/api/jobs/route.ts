import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Pagination - updated to match queries.ts
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Filters - updated to match queries.ts
    const country = searchParams.get("country");
    const location = searchParams.get("location");
    const type = searchParams.get("type");
    const experienceLevel = searchParams.get("experience_level");
    const remote = searchParams.get("remote");
    const search = searchParams.get("search");
    const job_category = searchParams.get("job_category");
    const company_size = searchParams.get("company_size");
    const is_sponsored = searchParams.get("is_sponsored");

    let query = supabase
      .from("jobs")
      .select(`
        *,
        companies (
          id,
          name,
          logo,
          website,
          size,
          industry
        )
      `, { count: "exact" })
      .eq("is_active", true)
      .order("is_sponsored", { ascending: false })
      .order("posted_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (country) {
      // Handle multiple countries (comma-separated)
      const countries = country.split(',').map(c => c.trim());
      if (countries.length > 1) {
        query = query.in("country", countries);
      } else {
        query = query.eq("country", country);
      }
    }

    if (location) {
      query = query.ilike("location", `%${location}%`);
    }

    if (type) {
      query = query.eq("type", type);
    }

    if (experienceLevel) {
      query = query.eq("experience_level", experienceLevel);
    }

    if (remote !== null && remote !== undefined) {
      query = query.eq("remote", remote === "true");
    }

    if (job_category) {
      query = query.eq("job_category", job_category);
    }

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,company_name.ilike.%${search}%,skills.cs.{${search}}`,
      );
    }

    // Handle company_size filter
    if (company_size) {
      query = query.not("company_id", "is", null);
      // We'll filter by company size in the application layer
    }

    if (is_sponsored === "true") {
      query = query.eq("is_sponsored", true);
    }

    const { data: jobs, error, count } = await query;

    if (error) {
      console.error("Error fetching jobs:", error);
      return NextResponse.json(
        { error: "Failed to fetch jobs" },
        { status: 500 },
      );
    }

    // Filter by company size in application layer if needed
    let filteredJobs = jobs;
    if (company_size && jobs) {
      filteredJobs = jobs.filter(job =>
        job.companies && job.companies.size === company_size
      );
    }

    return NextResponse.json({
      data: filteredJobs || [],
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
