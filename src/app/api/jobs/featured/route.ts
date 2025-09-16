import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const limit = parseInt(searchParams.get("limit") || "10");

    const { data: jobs, error } = await supabase
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
      `)
      .eq("is_active", true)
      .eq("is_sponsored", true)
      .order("posted_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching featured jobs:", error);
      return NextResponse.json(
        { data: null, error: "Failed to fetch featured jobs" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: jobs || [], error: null });
  } catch (error) {
    console.error("Error in featured jobs API:", error);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
