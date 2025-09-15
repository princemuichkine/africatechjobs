import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const supabase = await createClient();
    const { data: job, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", resolvedParams.id)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }
      console.error("Error fetching job:", error);
      return NextResponse.json(
        { error: "Failed to fetch job" },
        { status: 500 },
      );
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error in job API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from("jobs")
      .update(body)
      .eq("id", resolvedParams.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating job:", error);
      return NextResponse.json(
        { error: "Failed to update job" },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in job PUT API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const supabase = await createClient();
    const { error } = await supabase
      .from("jobs")
      .update({ is_active: false })
      .eq("id", resolvedParams.id);

    if (error) {
      console.error("Error deleting job:", error);
      return NextResponse.json(
        { error: "Failed to delete job" },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error in job DELETE API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
