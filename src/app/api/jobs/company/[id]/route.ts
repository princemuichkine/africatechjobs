import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const supabase = await createClient();
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
      .eq("company_id", resolvedParams.id)
      .eq("is_active", true)
      .order("posted_at", { ascending: false });

    if (error) {
      console.error("Error fetching jobs by company:", error);
      return NextResponse.json(
        { data: null, error: "Failed to fetch jobs by company" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: jobs || [], error: null });
  } catch (error) {
    console.error("Error in jobs by company API:", error);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
