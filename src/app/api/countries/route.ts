import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: countries, error } = await supabase
      .from("countries")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching countries:", error);
      return NextResponse.json(
        { data: null, error: "Failed to fetch countries" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: countries || [], error: null });
  } catch (error) {
    console.error("Error in countries API:", error);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
