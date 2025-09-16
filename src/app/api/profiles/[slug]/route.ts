import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const resolvedParams = await params;
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get("currentUserId");

    const supabase = await createClient();
    const query = supabase
      .from("profiles")
      .select("*")
      .eq("slug", resolvedParams.slug)
      .single();

    const { data: profile, error } = await query;

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { data: null, error: "Profile not found" },
          { status: 404 }
        );
      }
      console.error("Error fetching profile:", error);
      return NextResponse.json(
        { data: null, error: "Failed to fetch profile" },
        { status: 500 },
      );
    }

    // Check if current user is following this profile
    let isFollowing = false;
    if (currentUserId && profile) {
      const { data: followData } = await supabase
        .from("company_follows")
        .select("id")
        .eq("follower_id", currentUserId)
        .eq("company_id", profile.id)
        .single();

      isFollowing = !!followData;
    }

    const profileWithFollowing = {
      ...profile,
      isFollowing,
    };

    return NextResponse.json({ data: profileWithFollowing, error: null });
  } catch (error) {
    console.error("Error in profile API:", error);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
