import { schedules, tasks, logger } from "@trigger.dev/sdk";
import { createClient } from "@/lib/supabase/server";

// Job category keywords mapping based on the database enum
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

export const dailyScraper = schedules.task({
  id: "daily-job-scraper",
  cron: "0 10 * * 2", // Runs every Tuesday at 10 AM
  run: async () => {
    logger.info("🚀 Kicking off the comprehensive daily job scraping process.");
    const supabase = await createClient();

    // 1. Fetch all active countries from the database
    const { data: countries, error: countriesError } = await supabase
      .from("countries")
      .select("name")
      .eq("is_active", true);

    if (countriesError) {
      logger.error("❌ Failed to fetch countries from the database.", {
        error: countriesError,
      });
      throw countriesError;
    }

    if (!countries || countries.length === 0) {
      logger.warn("No active countries found to scrape. Skipping run.");
      return { status: "skipped", reason: "No active countries" };
    }

    logger.info(`🌍 Found ${countries.length} active countries to scrape.`);

    // 2. Get all job categories
    const categories: JobCategory[] = Object.keys(
      JOB_CATEGORY_KEYWORDS,
    ) as JobCategory[];
    logger.info(`🏷️  Found ${categories.length} job categories to scrape.`);

    // 3. Create combinations of country + category
    const scrapingEvents: Array<{
      payload: {
        location: string;
        category: JobCategory;
        keywords: string[];
        limit: number;
        dateSincePosted: string; // "past week"
      };
    }> = [];

    for (const country of countries) {
      for (const category of categories) {
        // Limit to avoid overwhelming LinkedIn
        // Aim for ~6 jobs per country-category combination (54 countries * 17 categories * 6 = ~5500 jobs)
        // But cap at reasonable limits to avoid rate limiting
        const jobsPerCombination = Math.max(
          3,
          Math.min(
            10,
            Math.floor(1000 / (countries.length * categories.length)),
          ),
        );

        scrapingEvents.push({
          payload: {
            location: country.name,
            category,
            keywords: [...JOB_CATEGORY_KEYWORDS[category]],
            limit: jobsPerCombination,
            dateSincePosted: "past week",
          },
        });
      }
    }

    logger.info(
      `📊 Created ${scrapingEvents.length} scraping tasks (${countries.length} countries × ${categories.length} categories).`,
    );
    logger.info(
      `🎯 Targeting approximately ${scrapingEvents.length * 6} total jobs.`,
    );

    // 4. Split into batches to avoid overwhelming Trigger.dev
    const BATCH_SIZE = 25; // Process 25 country-category combinations at a time
    const batches = [];
    for (let i = 0; i < scrapingEvents.length; i += BATCH_SIZE) {
      batches.push(scrapingEvents.slice(i, i + BATCH_SIZE));
    }

    logger.info(
      `📦 Split into ${batches.length} batches of max ${BATCH_SIZE} tasks each.`,
    );

    // 5. Trigger batches with delays
    const batchHandles = [];
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      logger.info(
        `🚀 Triggering batch ${i + 1}/${batches.length} with ${batch.length} tasks...`,
      );

      try {
        const batchHandle = await tasks.batchTrigger("linkedin-scraper", batch);

        batchHandles.push({
          batchIndex: i + 1,
          batchId: batchHandle.batchId,
          taskCount: batch.length,
        });

        logger.info(`✅ Batch ${i + 1} triggered successfully.`, {
          batchId: batchHandle.batchId,
          tasksInBatch: batch.length,
        });

        // Add delay between batches (except for the last one)
        if (i < batches.length - 1) {
          logger.info(`⏱️  Waiting 30 seconds before next batch...`);
          await new Promise((resolve) => setTimeout(resolve, 30000));
        }
      } catch (error) {
        logger.error(`❌ Failed to trigger batch ${i + 1}:`, { error });
        // Continue with other batches even if one fails
      }
    }

    logger.info(`🎉 All batches triggered successfully!`, {
      totalBatches: batchHandles.length,
      totalTasks: batchHandles.reduce((sum, b) => sum + b.taskCount, 0),
      estimatedJobs: batchHandles.reduce((sum, b) => sum + b.taskCount * 6, 0),
    });

    return {
      message:
        "Comprehensive daily scraper completed for all countries and job categories.",
      countries: countries.length,
      categories: categories.length,
      totalTasks: scrapingEvents.length,
      batches: batchHandles.length,
      batchDetails: batchHandles,
      estimatedTotalJobs: scrapingEvents.length * 6,
    };
  },
});
