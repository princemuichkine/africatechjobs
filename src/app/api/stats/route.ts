import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

export async function GET() {
  try {
    const supabase = await createClient();
    // Get total jobs count
    const { count: totalJobs, error: totalError } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    if (totalError) {
      console.error("Error fetching total jobs:", totalError);
    }

    // Get jobs by country
    const { data: countryStats, error: countryError } = await supabase
      .from("jobs")
      .select("country")
      .eq("is_active", true);

    if (countryError) {
      console.error("Error fetching country stats:", countryError);
    }

    // Get jobs by type
    const { data: typeStats, error: typeError } = await supabase
      .from("jobs")
      .select("type")
      .eq("is_active", true);

    if (typeError) {
      console.error("Error fetching type stats:", typeError);
    }

    // Get jobs by source
    const { data: sourceStats, error: sourceError } = await supabase
      .from("jobs")
      .select("source")
      .eq("is_active", true);

    if (sourceError) {
      console.error("Error fetching source stats:", sourceError);
    }

    // Get recent jobs (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentJobs, error: recentError } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .gte("posted_at", sevenDaysAgo.toISOString());

    if (recentError) {
      console.error("Error fetching recent jobs:", recentError);
    }

    // Process country stats
    const countryCount: Record<string, number> = {};
    countryStats?.forEach(
      (job: Pick<Database["public"]["Tables"]["jobs"]["Row"], "country">) => {
        countryCount[job.country] = (countryCount[job.country] || 0) + 1;
      },
    );

    // Process type stats
    const typeCount: Record<string, number> = {};
    typeStats?.forEach(
      (job: Pick<Database["public"]["Tables"]["jobs"]["Row"], "type">) => {
        typeCount[job.type || "UNKNOWN"] =
          (typeCount[job.type || "UNKNOWN"] || 0) + 1;
      },
    );

    // Process source stats
    const sourceCount: Record<string, number> = {};
    sourceStats?.forEach(
      (job: Pick<Database["public"]["Tables"]["jobs"]["Row"], "source">) => {
        sourceCount[job.source] = (sourceCount[job.source] || 0) + 1;
      },
    );

    const stats = {
      total: totalJobs || 0,
      recent: recentJobs || 0,
      byCountry: countryCount,
      byType: typeCount,
      bySource: sourceCount,
      topCountries: Object.entries(countryCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10),
      topSources: Object.entries(sourceCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error in stats API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
