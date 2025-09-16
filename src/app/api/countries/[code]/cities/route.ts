import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const resolvedParams = await params;
    const supabase = await createClient();
    const { data: cities, error } = await supabase
      .from("cities")
      .select(`
        *,
        countries (
          code,
          name
        )
      `)
      .eq("countries.code", resolvedParams.code)
      .order("name");

    if (error) {
      console.error("Error fetching cities:", error);
      return NextResponse.json(
        { data: null, error: "Failed to fetch cities" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: cities || [], error: null });
  } catch (error) {
    console.error("Error in cities API:", error);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
