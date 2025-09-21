#!/usr/bin/env tsx

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { JobProcessingPipeline } from "../processing-pipeline";
import { query as scrapeLinkedInJobs } from "../scraper/linkedin";
import type { LinkedInJob } from "../scraper/linkedin";

// Load environment variables
config();

// Job category keywords mapping
const JOB_CATEGORY_KEYWORDS = {
  ENGINEERING: [
    "Software Engineer",
    "Backend Developer",
    "Frontend Developer",
    "Full Stack Developer",
    "Mobile Developer",
    "iOS Developer",
    "Android Developer",
    "React Developer",
    "Node.js Developer",
    "Python Developer",
    "Java Developer",
    "C# Developer",
    "Go Developer",
    "Rust Developer",
    "TypeScript Developer",
    "JavaScript Developer",
    "Web Developer",
    "API Developer",
    "System Engineer",
    "Application Developer",
  ],
  SALES: [
    "Sales Representative",
    "Account Executive",
    "Business Development",
    "Sales Manager",
    "Sales Director",
    "Sales Consultant",
    "Sales Specialist",
    "Sales Engineer",
    "Technical Sales",
    "Inside Sales",
    "Outside Sales",
  ],
  MARKETING: [
    "Marketing Manager",
    "Marketing Coordinator",
    "Digital Marketing",
    "Content Marketing",
    "Social Media Marketing",
    "SEO Specialist",
    "Marketing Analyst",
    "Brand Manager",
    "Product Marketing",
    "Growth Marketing",
  ],
  DATA: [
    "Data Scientist",
    "Data Engineer",
    "Data Analyst",
    "Machine Learning Engineer",
    "AI Engineer",
    "Data Architect",
    "Business Intelligence Analyst",
    "Data Specialist",
    "Analytics Engineer",
    "ML Engineer",
    "AI Specialist",
  ],
  DEVOPS: [
    "DevOps Engineer",
    "Site Reliability Engineer",
    "Platform Engineer",
    "Infrastructure Engineer",
    "CI/CD Engineer",
    "DevOps Specialist",
    "Release Engineer",
    "Build Engineer",
    "Automation Engineer",
  ],
  PRODUCT: [
    "Product Manager",
    "Product Owner",
    "Technical Product Manager",
    "Product Analyst",
    "Associate Product Manager",
    "Senior Product Manager",
    "Product Director",
    "VP Product",
    "Head of Product",
  ],
  DESIGN: [
    "UI/UX Designer",
    "Product Designer",
    "UX Researcher",
    "Interaction Designer",
    "Visual Designer",
    "Graphic Designer",
    "UX Designer",
    "UI Designer",
    "Design System",
    "User Experience",
    "User Interface",
  ],
  CLOUD: [
    "Cloud Engineer",
    "AWS Engineer",
    "Azure Engineer",
    "GCP Engineer",
    "Cloud Architect",
    "Cloud Consultant",
    "Cloud Solutions Architect",
    "Kubernetes Engineer",
    "Docker Engineer",
    "Cloud Security Engineer",
  ],
  SUPPORT: [
    "Technical Support Engineer",
    "Customer Success Engineer",
    "Support Specialist",
    "Customer Support",
    "Technical Support",
    "Help Desk",
    "IT Support",
    "Customer Success Manager",
    "Client Success",
    "Support Engineer",
  ],
  MANAGEMENT: [
    "Engineering Manager",
    "Technical Lead",
    "VP Engineering",
    "CTO",
    "Director of Engineering",
    "Head of Engineering",
    "Team Lead",
    "Project Manager",
    "Program Manager",
    "Delivery Manager",
  ],
  RESEARCH: [
    "Research Scientist",
    "Applied Scientist",
    "Research Engineer",
    "Research Analyst",
    "R&D Engineer",
    "Research Associate",
    "Principal Scientist",
    "Senior Research Scientist",
  ],
  LEGAL: [
    "Legal Counsel",
    "Corporate Lawyer",
    "Legal Advisor",
    "Compliance Officer",
    "Legal Specialist",
    "Contract Manager",
    "Legal Manager",
    "General Counsel",
  ],
  FINANCE: [
    "Financial Analyst",
    "Finance Manager",
    "Financial Controller",
    "FP&A Analyst",
    "Financial Planning",
    "Budget Analyst",
    "Finance Director",
    "Chief Financial Officer",
    "Financial Operations",
  ],
  OPERATIONS: [
    "Operations Manager",
    "Operations Analyst",
    "Business Operations",
    "Operations Director",
    "Chief Operating Officer",
    "Operations Specialist",
    "Process Manager",
    "Operations Coordinator",
  ],
  PR: [
    "Public Relations",
    "PR Manager",
    "Communications Manager",
    "PR Specialist",
    "Media Relations",
    "Corporate Communications",
    "PR Coordinator",
    "Communications Director",
  ],
  HR: [
    "Human Resources",
    "HR Manager",
    "Talent Acquisition",
    "Recruiter",
    "HR Business Partner",
    "People Operations",
    "HR Director",
    "Chief Human Resources Officer",
    "Talent Manager",
  ],
  OTHER: [
    "Consultant",
    "Advisor",
    "Strategist",
    "Coordinator",
    "Administrator",
    "Specialist",
    "Associate",
    "Director",
    "VP",
    "Chief Officer",
  ],
} as const;

type JobCategory = keyof typeof JOB_CATEGORY_KEYWORDS;

// Utility functions
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function scrapeAfricaJobs() {
  const targetCountry = process.env.SCRAPE_COUNTRY; // Optional: filter to specific country for testing
  const testMode = process.env.SCRAPE_TEST === "true"; // Optional: limit categories for testing
  const startTime = new Date();

  console.log("🚀 Starting Africa Tech Jobs Production Scraper");
  console.log("==================================================");
  console.log(`🌍 Target: ${targetCountry || "All African Countries"}`);
  console.log(
    `🧪 Mode: ${testMode ? "Test (limited categories)" : "Production"}`,
  );
  console.log(`⏰ Started at: ${startTime.toISOString()}`);
  console.log(
    `🔧 AI Model: ${process.env.AI_MODEL || "gemini (with fallbacks)"}`,
  );
  console.log(
    `💾 Database: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? "Connected" : "Demo Mode"}`,
  );
  console.log("==================================================");

  try {
    // Check for Supabase access
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const hasDatabaseAccess = supabaseUrl && supabaseServiceKey;

    if (!hasDatabaseAccess) {
      console.log("⚠️  No Supabase credentials - running in demo mode");
    }

    const supabase = hasDatabaseAccess
      ? createClient(supabaseUrl!, supabaseServiceKey!)
      : undefined;

    // Get African countries from database or use fallback
    let africanCountries: string[] = [];
    if (hasDatabaseAccess && supabase) {
      const { data: countries, error } = await supabase
        .from("countries")
        .select("name")
        .eq("is_active", true);

      if (!error && countries) {
        africanCountries = countries.map((c) => c.name);
      }
    }

    // Fallback to hardcoded list if database not available
    if (africanCountries.length === 0) {
      africanCountries = [
        "Nigeria",
        "Kenya",
        "South Africa",
        "Ghana",
        "Egypt",
        "Morocco",
        "Ethiopia",
        "Tanzania",
        "Uganda",
        "Rwanda",
        "Senegal",
        "Ivory Coast",
        "Zimbabwe",
        "Zambia",
        "Botswana",
        "Namibia",
        "Mozambique",
        "Angola",
        "Algeria",
        "Tunisia",
        "Libya",
        "Sudan",
        "Cameroon",
        "Mali",
        "Burkina Faso",
        "Niger",
        "Chad",
        "Central African Republic",
        "Democratic Republic of Congo",
        "Republic of Congo",
        "Gabon",
        "Equatorial Guinea",
        "Sao Tome and Principe",
        "Benin",
        "Togo",
        "Sierra Leone",
        "Liberia",
        "Guinea",
        "Guinea-Bissau",
        "Cape Verde",
        "Mauritania",
        "Western Sahara",
        "Djibouti",
        "Eritrea",
        "Somalia",
        "Comoros",
        "Madagascar",
        "Mauritius",
        "Seychelles",
        "Malawi",
        "Lesotho",
        "Eswatini",
        "Mayotte",
        "Reunion",
      ];
    }

    // Filter to target country if specified
    if (targetCountry) {
      africanCountries = africanCountries.filter((country) =>
        country.toLowerCase().includes(targetCountry.toLowerCase()),
      );
      if (africanCountries.length === 0) {
        africanCountries = [targetCountry]; // Use as-is if not found
      }
    }

    console.log(`🌍 Found ${africanCountries.length} countries to scrape`);

    // Get categories to process
    const categories: JobCategory[] = Object.keys(
      JOB_CATEGORY_KEYWORDS,
    ) as JobCategory[];
    const categoriesToProcess = testMode ? categories.slice(0, 3) : categories; // Limit for testing

    console.log(`🏷️  Processing ${categoriesToProcess.length} job categories`);

    // Safety check: Don't overwhelm LinkedIn
    const totalRequests =
      africanCountries.length * categoriesToProcess.length * (testMode ? 2 : 8);
    if (totalRequests > 1000 && !testMode) {
      console.log(
        `⚠️  Warning: This will make approximately ${totalRequests} LinkedIn requests. Consider using SCRAPE_TEST=true for smaller runs.`,
      );
      console.log(
        `💡 Tip: Use SCRAPE_COUNTRY=Nigeria to test with one country first.`,
      );
    }

    let totalJobsFound = 0;
    let totalProcessed = 0;
    let totalDuplicates = 0;
    let totalErrors = 0;
    let totalCategoriesProcessed = 0;

    // Process each country
    for (const country of africanCountries) {
      console.log(`\n🇿🇦 Processing ${country}...`);

      // Process each category
      for (const category of categoriesToProcess) {
        console.log(`  🎯 Category: ${category}`);

        try {
          const keywords = JOB_CATEGORY_KEYWORDS[category].slice(0, 8); // Use more keywords for better coverage
          const keywordQuery = keywords.join(" OR ");

          console.log(`    🔎 Keywords: ${keywordQuery}`);

          // Phase 1: Scrape job listings using improved LinkedIn scraper
          const scrapedJobs: LinkedInJob[] = await scrapeLinkedInJobs({
            keyword: keywordQuery,
            location: country,
            limit: testMode ? 2 : 8, // Get more jobs per category
            sortBy: "recent",
            dateSincePosted: "past week",
          });

          console.log(
            `    ✅ Found ${scrapedJobs.length} job listings with enhanced data`,
          );

          if (scrapedJobs.length === 0) {
            console.log(`    ⏭️ No jobs found, skipping...`);
            continue;
          }

          totalJobsFound += scrapedJobs.length;

          // Phase 2: Process through AI pipeline (Puppeteer extraction already happened in scraper)
          let categoryProcessed = 0;
          let categoryDuplicates = 0;
          let categoryErrors = 0;

          for (const job of scrapedJobs) {
            try {
              console.log(
                `      📋 Processing: ${job.position} at ${job.company}`,
              );

              // Transform LinkedIn job data to pipeline format
              const jobData = {
                position: job.position,
                description: job.description || "",
                company: job.company,
                city: job.city,
                date: job.date,
                salary: job.salary || "Not specified",
                jobUrl: job.applyUrl || job.jobUrl,
                sourceId: job.sourceId,
                isSponsored: job.isSponsored,
                salaryMin: job.salaryMin,
                salaryMax: job.salaryMax,
                currency: job.currency,
                applyUrl: job.applyUrl,
                remote: job.remote,
              };

              if (hasDatabaseAccess && supabase) {
                const pipeline = new JobProcessingPipeline(supabase);
                const result = await pipeline.processIncomingJob(
                  jobData,
                  `LinkedIn-${category}`,
                  country,
                );

                if (result.status === "success") {
                  console.log(`        ✅ Saved job: ${result.jobId}`);
                  categoryProcessed++;
                  totalProcessed++;
                } else if (result.status === "duplicate") {
                  console.log(`        ⏭️ Duplicate job`);
                  categoryDuplicates++;
                  totalDuplicates++;
                } else if (result.status === "not_tech_job") {
                  console.log(`        🚫 Not a tech job`);
                } else {
                  console.log(`        ⚠️ ${result.status}`);
                }
              } else {
                // Demo mode
                console.log(
                  `        📝 Demo: Would process job (${job.description?.length || 0} chars)`,
                );
                console.log(
                  `           Apply URL: ${job.applyUrl ? "✅ Found" : "📝 Using job URL"}`,
                );
                console.log(
                  `           Salary: ${job.salaryMin ? `💰 ${job.currency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax?.toLocaleString()}` : "💰 Not specified"}`,
                );
                console.log(
                  `           Visa Sponsorship: ${job.isSponsored ? "✅ Yes" : "❌ No"}`,
                );

                categoryProcessed++;
                totalProcessed++;
              }

              // Rate limiting delay between jobs
              await delay(testMode ? 100 : 500);
            } catch (error) {
              console.error(
                `      ❌ Error processing job "${job.position}" at ${job.company}:`,
                error instanceof Error ? error.message : String(error),
              );
              categoryErrors++;
              totalErrors++;

              // Continue processing other jobs even if one fails
              console.log(`      ⏭️ Continuing with next job...`);
            }
          }

          console.log(
            `    📊 ${category} summary: ${categoryProcessed} processed, ${categoryDuplicates} duplicates, ${categoryErrors} errors`,
          );
          totalCategoriesProcessed++;

          // Periodic progress update
          if (totalCategoriesProcessed % 10 === 0) {
            const progressPercent = Math.round(
              (totalCategoriesProcessed /
                (africanCountries.length * categoriesToProcess.length)) *
                100,
            );
            console.log(
              `📈 Progress: ${totalCategoriesProcessed}/${africanCountries.length * categoriesToProcess.length} categories (${progressPercent}%) - ${totalJobsFound} jobs found`,
            );
          }

          // Longer delay between categories
          await delay(testMode ? 500 : 2000);
        } catch (error) {
          console.error(
            `  ❌ Error processing ${category} in ${country}:`,
            error instanceof Error ? error.message : String(error),
          );
          totalErrors++;

          // Continue with next category even if one fails
          console.log(`  ⏭️ Continuing with next category...`);
        }
      }

      // Delay between countries (except for testing)
      if (
        !testMode &&
        africanCountries.indexOf(country) < africanCountries.length - 1
      ) {
        console.log(`  ⏱️ Waiting before next country...`);
        await delay(5000);
      }
    }

    // Final summary
    const endTime = new Date();
    const duration =
      Math.round(
        ((endTime.getTime() - startTime.getTime()) / 1000 / 60) * 100,
      ) / 100; // minutes
    const avgJobsPerMinute =
      totalJobsFound > 0
        ? Math.round((totalJobsFound / duration) * 100) / 100
        : 0;

    console.log("\n🎉 Africa Tech Jobs Scraping Complete!");
    console.log("=========================================");
    console.log("📊 Final Summary:");
    console.log(`⏰ Duration: ${duration} minutes`);
    console.log(`🌍 Countries processed: ${africanCountries.length}`);
    console.log(`🏷️  Categories processed: ${categoriesToProcess.length}`);
    console.log(`💼 Total jobs scraped: ${totalJobsFound}`);
    console.log(`✅ Successfully processed: ${totalProcessed}`);
    console.log(`⏭️  Duplicates skipped: ${totalDuplicates}`);
    console.log(`❌ Errors: ${totalErrors}`);
    console.log(`📈 Average performance: ${avgJobsPerMinute} jobs/minute`);

    if (totalProcessed > 0) {
      const successRate = Math.round(
        (totalProcessed / (totalProcessed + totalDuplicates + totalErrors)) *
          100,
      );
      console.log(`🎯 Success rate: ${successRate}%`);
    }

    console.log("=========================================");
    console.log(`🏁 Completed at: ${endTime.toISOString()}`);
  } catch (error) {
    console.error(
      "❌ Scraping failed:",
      error instanceof Error ? error.message : String(error),
    );
    console.error(
      "Stack trace:",
      error instanceof Error ? error.stack : "No stack trace",
    );
    process.exit(1);
  }
}

// Run the scraper
scrapeAfricaJobs()
  .then(() => {
    console.log("🎉 Africa job scraping completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error(
      "💥 Fatal error:",
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  });
