import { schedules, tasks, logger } from "@trigger.dev/sdk";
import { createTriggerClient } from "@/lib/supabase/trigger";
import { JOB_CATEGORY_KEYWORDS, JobCategoryKeywords } from "@/lib/types/job";

type JobCategory = JobCategoryKeywords;

export const weeklyScraper = schedules.task({
  id: "weekly-job-scraper",
  cron: "0 10 * * 2", // Runs every Tuesday at 10 AM
  run: async () => {
    logger.info("🚀 Kicking off the comprehensive weekly job scraping process.");
    const supabase = createTriggerClient();

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
        "Comprehensive weekly scraper completed for all countries and job categories.",
      countries: countries.length,
      categories: categories.length,
      totalTasks: scrapingEvents.length,
      batches: batchHandles.length,
      batchDetails: batchHandles,
      estimatedTotalJobs: scrapingEvents.length * 6,
    };
  },
});
