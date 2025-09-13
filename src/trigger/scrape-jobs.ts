import { client } from "@/trigger";
import { eventTrigger } from "@trigger.dev/sdk";
import { z } from "zod";
import { JobScraper } from "@/lib/scraper";
import { supabase } from "@/lib/supabase";
import { redis } from "@africatechjobs/kv/redis";

const scraper = new JobScraper();

// Scheduled scraping - runs every 4 hours
client.defineJob({
  id: "scrape-african-tech-jobs",
  name: "Scrape African Tech Jobs",
  version: "1.0.0",
  trigger: eventTrigger({
    name: "scrape.jobs",
    schema: z.object({
      sources: z.array(z.string()).optional(),
      force: z.boolean().default(false),
    }),
  }),

  run: async (payload, io, ctx) => {
    const { sources, force = false } = payload;

    // Check cache to avoid duplicate runs
    if (!force) {
      const lastRun = await redis.get("scrape:last-run");
      const now = Date.now();
      const fourHours = 4 * 60 * 60 * 1000;

      if (lastRun && (now - parseInt(lastRun as string)) < fourHours) {
        await io.logger.info("Skipping scrape - too soon since last run");
        return { skipped: true, reason: "Too soon since last run" };
      }
    }

    await io.logger.info("Starting job scraping for African tech jobs");

    // Initialize scraper
    await scraper.init();

    try {
      const results = await scraper.scrapeAllSources();
      await redis.set("scrape:last-run", Date.now().toString());

      // Update cache with latest data
      await redis.set("jobs:last-updated", new Date().toISOString());
      await redis.set("jobs:count", results.jobs.length);

      // Log scraping results
      await supabase.from("scrape_logs").insert({
        source: "Scheduled Trigger.dev",
        status: results.stats.totalJobsFound > 0 ? "SUCCESS" : "PARTIAL_SUCCESS",
        jobs_found: results.stats.totalJobsFound,
        jobs_added: results.stats.totalJobsAdded,
        completed_at: new Date().toISOString(),
      });

      await io.logger.info("Scraping completed", {
        jobsFound: results.stats.totalJobsFound,
        jobsAdded: results.stats.totalJobsAdded,
      });

      return {
        success: true,
        jobsFound: results.stats.totalJobsFound,
        jobsAdded: results.stats.totalJobsAdded,
        sources: results.stats,
      };

    } catch (error) {
      await io.logger.error("Scraping failed", { error: error.message });

      await supabase.from("scrape_logs").insert({
        source: "Scheduled Trigger.dev",
        status: "FAILED",
        error: error.message,
        completed_at: new Date().toISOString(),
      });

      throw error;
    } finally {
      await scraper.close();
    }
  },
});

// Manual trigger job
client.defineJob({
  id: "manual-scrape-trigger",
  name: "Manual Scrape Trigger",
  version: "1.0.0",
  trigger: eventTrigger({
    name: "scrape.manual",
    schema: z.object({
      userId: z.string(),
      sources: z.array(z.string()).optional(),
    }),
  }),

  run: async (payload, io, ctx) => {
    await io.logger.info("Manual scraping triggered", { userId: payload.userId });

    // Trigger the main scraping job
    await io.trigger("scrape.jobs", {
      sources: payload.sources,
      force: true,
    });

    return { triggered: true, userId: payload.userId };
  },
});
