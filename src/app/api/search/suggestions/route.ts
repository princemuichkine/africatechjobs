import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "5");

    // Get job title suggestions
    const { data: titleSuggestions } = await supabase
      .from("jobs")
      .select("title")
      .ilike("title", `%${query}%`)
      .eq("is_active", true)
      .limit(limit);

    // Get company name suggestions
    const { data: companySuggestions } = await supabase
      .from("companies")
      .select("name")
      .ilike("name", `%${query}%`)
      .limit(limit);

    // Get location suggestions
    const { data: locationSuggestions } = await supabase
      .from("jobs")
      .select("location")
      .ilike("location", `%${query}%`)
      .eq("is_active", true)
      .limit(limit);

    const suggestions = {
      titles: titleSuggestions?.map(t => t.title) || [],
      companies: companySuggestions?.map(c => c.name) || [],
      locations: locationSuggestions?.map(l => l.location) || [],
    };

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Error in search suggestions API:", error);
    return NextResponse.json(
      {
        titles: [],
        companies: [],
        locations: [],
      },
      { status: 500 },
    );
  }
}
