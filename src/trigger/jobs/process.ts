import { schemaTask, logger } from "@trigger.dev/sdk";
import { z } from "zod";
import { JobProcessingPipeline } from "@/lib/jobs/processing-pipeline";

export const processJob = schemaTask({
  id: "process-job",
  schema: z.object({
    source: z.string(),
    country: z.string().optional(),
    job: z.object({
      position: z.string(),
      company: z.string(),
      location: z.string(),
      date: z.string(),
      salary: z.string(),
      jobUrl: z.string().url(),
      companyLogo: z.string().optional(),
      agoTime: z.string().optional(),
      // Enhanced fields from Puppeteer extraction
      description: z.string().optional(),
      sourceId: z.string().optional(),
      isSponsored: z.boolean().optional(),
      salaryMin: z.number().optional(),
      salaryMax: z.number().optional(),
      currency: z.string().optional(),
      applyUrl: z.string().optional(),
      remote: z.boolean().optional(),
    }),
  }),
  run: async (payload) => {
    logger.info(
      `Processing job: ${payload.job.position} at ${payload.job.company}`,
    );

    try {
      const pipeline = new JobProcessingPipeline();
      const result = await pipeline.processIncomingJob(
        payload.job,
        payload.source,
        payload.country,
      );

      logger.info(`Job processing result: ${result.status}`, { result });

      return result;
    } catch (error) {
      logger.error("Error processing job in pipeline", {
        error,
        job: payload.job,
      });
      throw error;
    }
  },
});
