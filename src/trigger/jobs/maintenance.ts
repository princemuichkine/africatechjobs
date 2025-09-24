import { schedules, logger } from "@trigger.dev/sdk";
import { createTriggerClient } from "@/lib/supabase/trigger";

export const dailyMaintenance = schedules.task({
  id: "daily-maintenance",
  // Runs every day at midnight UTC
  cron: "0 0 * * *",
  run: async (payload) => {
    logger.info("🚀 Starting daily maintenance tasks.", { payload });
    const supabase = createTriggerClient();

    // 1. Deactivate jobs older than 3 weeks (21 days)
    try {
      const { data, error } = await supabase.rpc("deactivate_old_jobs", {
        days_old: 21,
      });

      if (error) {
        throw error;
      }

      logger.info(`✅ Deactivated ${data} old jobs.`);
    } catch (error) {
      logger.error("❌ Failed to deactivate old jobs.", { error });
    }

    // You can add other maintenance tasks here in the future.

    logger.info("✅ Daily maintenance tasks completed.");
    return { success: true };
  },
});
