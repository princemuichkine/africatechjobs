import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const supabase = await createClient();
    const { data: company, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", resolvedParams.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { data: null, error: "Company not found" },
          { status: 404 },
        );
      }
      console.error("Error fetching company:", error);
      return NextResponse.json(
        { data: null, error: "Failed to fetch company" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: company, error: null });
  } catch (error) {
    console.error("Error in company API:", error);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
