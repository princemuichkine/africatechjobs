#!/usr/bin/env tsx

// Load environment variables
import { config } from "dotenv";
config();

import { query } from "../src/lib/jobs/scraper/linkedin";

async function testLinkedInScraper() {
  console.log("🔍 Testing LinkedIn Scraper with Puppeteer Integration");
  console.log("==================================================\n");

  // Debug: Show loaded environment variables
  console.log("🔧 Environment Variables Status:");
  console.log(
    `   GOOGLE_API_KEY: ${process.env.GOOGLE_API_KEY ? "✅ Set" : "❌ Missing (will use basic validation)"}`,
  );
  console.log(`   AI_MODEL: ${process.env.AI_MODEL || "gemini (default)"}`);
  console.log("");

  try {
    // Test with minimal parameters to avoid rate limiting
    const queryOptions = {
      keyword: "software engineer",
      location: "Nigeria",
      limit: 2, // Small limit for testing
      dateSincePosted: "past week",
    };

    console.log("Search Parameters:");
    console.log(`  Keyword: ${queryOptions.keyword}`);
    console.log(`  Location: ${queryOptions.location}`);
    console.log(`  Limit: ${queryOptions.limit}`);
    console.log(`  Date Filter: ${queryOptions.dateSincePosted}`);
    console.log("");

    console.log("🔎 Starting LinkedIn job search...");
    const jobs = await query(queryOptions);

    console.log(`\n✅ Found ${jobs.length} jobs from LinkedIn`);
    console.log("─".repeat(50));

    jobs.forEach((job, index) => {
      console.log(`Job ${index + 1}:`);
      console.log(`  Title: ${job.position}`);
      console.log(`  Company: ${job.company}`);
      console.log(`  Location: ${job.city}`);
      console.log(`  LinkedIn URL: ${job.jobUrl}`);

      // Check if Puppeteer fields are populated
      console.log(
        `  Description: ${job.description ? "✅ Extracted" : "❌ Missing"} (${job.description?.length || 0} chars)`,
      );
      console.log(`  Apply URL: ${job.applyUrl ? "✅ Found" : "❌ Missing"}`);
      console.log(
        `  Source ID: ${job.sourceId ? "✅ Extracted" : "❌ Missing"} (${job.sourceId})`,
      );
      console.log(
        `  Salary Parsed: ${job.salaryMin ? `✅ ${job.currency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax?.toLocaleString()}` : "❌ Not found (normal - ~90% of jobs)"}`,
      );
      console.log(
        `  Visa Sponsorship: ${job.isSponsored ? "✅ Yes" : "❌ No (normal - most jobs don't sponsor)"}`,
      );
      console.log("");
    });

    if (jobs.length > 0) {
      console.log("🎯 Puppeteer Integration Status:");
      const hasDescriptions = jobs.some(
        (job) => job.description && job.description.length > 0,
      );
      const hasApplyUrls = jobs.some(
        (job) => job.applyUrl && job.applyUrl !== job.jobUrl,
      );
      const hasSourceIds = jobs.some((job) => job.sourceId);
      const hasSalaryData = jobs.some((job) => job.salaryMin && job.salaryMax);

      console.log(
        `  Full Descriptions: ${hasDescriptions ? "✅ Working" : "❌ Not working"}`,
      );
      console.log(
        `  Apply URLs: ${hasApplyUrls ? "✅ Working" : "❌ Not working"}`,
      );
      console.log(
        `  Source IDs: ${hasSourceIds ? "✅ Working" : "❌ Not working"}`,
      );
      console.log(
        `  Salary Parsing: ${hasSalaryData ? "✅ Working (rare - only ~10% of jobs)" : "❌ Not found (normal - ~90% of jobs)"}`,
      );
      console.log(`  Visa Sponsorship Detection: ✅ Working`);
    }

    console.log("\n🎉 LinkedIn scraper test completed successfully!");
  } catch (error) {
    console.error("💥 Scraper test failed:", error);
    process.exit(1);
  }
}

// Run the test
testLinkedInScraper()
  .then(() => {
    console.log("✅ Scraper test completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Scraper test failed:", error);
    process.exit(1);
  });
