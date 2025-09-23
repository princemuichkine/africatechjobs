import { schemaTask, logger, tasks } from "@trigger.dev/sdk";
import { z } from "zod";
import { query as scrapeLinkedIn } from "@/lib/jobs/scraper/linkedin";

export const linkedinScraper = schemaTask({
  id: "linkedin-scraper",
  schema: z.object({
    location: z.string(),
    category: z.string(),
    keywords: z.array(z.string()),
    limit: z.number().default(25),
    dateSincePosted: z.enum(["past month", "past week", "24hr"]).default("past week"),
  }),
  run: async (payload) => {
    logger.info(
      `🚀 Starting LinkedIn scraper job for ${payload.category} in ${payload.location}`,
      { payload },
    );

    try {
      const { location, category, keywords, limit, dateSincePosted } = payload;

      // Use category-specific keywords, but limit to avoid URL length issues<<
      const keywordSubset = keywords.slice(0, 8); // LinkedIn has URL length limits
      const keyword = keywordSubset.join(" OR ");

      logger.info(`🔎 Searching with keywords for ${category}: ${keyword}`);

      const rawJobs = await scrapeLinkedIn({
        keyword,
        location,
        limit,
        sortBy: "recent",
        dateSincePosted,
      });

      logger.info(
        `✅ Found ${rawJobs.length} jobs from LinkedIn for "${category}" in "${location}".`,
      );

      if (rawJobs.length === 0) {
        return {
          status: "success",
          count: 0,
          category,
          location,
          keywords: keyword,
          message: "No new jobs found.",
        };
      }

      const events = rawJobs.map((job) => ({
        payload: {
          source: `LinkedIn-${category}`,
          country: location, // Pass the country for better location processing
          job,
        },
      }));

      const batchHandle = await tasks.batchTrigger("process-job", events);

      logger.info(
        `✅ Batch triggered for ${events.length} jobs in category ${category}.`,
        {
          batchId: batchHandle.batchId,
          category,
          location,
        },
      );

      return {
        status: "success",
        count: events.length,
        category,
        location,
        keywords: keyword,
        batchId: batchHandle.batchId,
      };
    } catch (error) {
      logger.error(
        `❌ LinkedIn scraper job failed for ${payload.category} in ${payload.location}`,
        { error },
      );
      throw error;
    }
  },
});
