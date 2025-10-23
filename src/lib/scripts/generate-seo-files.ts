#!/usr/bin/env tsx

import { writeFileSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

interface JobData {
  id: string;
  created_at: string;
  updated_at?: string;
  clicks: number;
  is_sponsored: boolean;
}

async function generateSEOFiles() {
  const baseUrl = "https://africatechjobs.xyz";
  const publicDir = join(process.cwd(), "public");

  console.log("🔍 Generating SEO files...");

  // Load environment variables from .env file
  config({ path: ".env" });

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://gmqfnzwsqlvsodrpvbfb.supabase.co";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let jobs: JobData[] = [];

  if (supabaseServiceKey) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      const { data, error } = await supabase
        .from("jobs")
        .select("id, created_at, updated_at, clicks, is_sponsored")
        .eq("is_active", true)
        .order("is_sponsored", { ascending: false })
        .order("clicks", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(10000);

      if (!error && data) {
        jobs = data;
        console.log(`📊 Found ${jobs.length} jobs to include in sitemap`);
      }
    } catch (err) {
      console.warn(
        "⚠️ Could not fetch jobs data, generating basic sitemap:",
        err,
      );
    }
  } else {
    console.log(
      "ℹ️ No SUPABASE_SERVICE_ROLE_KEY found, generating basic sitemap",
    );
  }

  // Generate robots.txt
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /auth/
Disallow: /admin/

Sitemap: ${baseUrl}/sitemap.xml
`;

  // Generate sitemap.xml
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/jobs</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/advertise</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  ${jobs
    .map((job) => {
      const lastModified = job.updated_at
        ? new Date(job.updated_at).toISOString()
        : new Date(job.created_at).toISOString();
      const priority =
        job.clicks > 50 ? "0.9" : job.is_sponsored ? "0.8" : "0.7";
      const changeFreq = job.clicks > 10 ? "weekly" : "monthly";

      return `<url>
    <loc>${baseUrl}/jobs/${job.id}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>${changeFreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join("\n")}
</urlset>`;

  // Write files
  writeFileSync(join(publicDir, "robots.txt"), robotsTxt);
  writeFileSync(join(publicDir, "sitemap.xml"), sitemapXml);

  console.log("✅ SEO files generated successfully!");
  console.log(`📄 robots.txt: ${robotsTxt.length} characters`);
  console.log(`🗺️  sitemap.xml: ${sitemapXml.length} characters`);
  console.log(`📍 Files saved to: ${publicDir}`);
}

// Run the script
generateSEOFiles().catch(console.error);
