"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export const toggleFollowAction = authActionClient
  .metadata({
    actionName: "toggle-follow",
  })
  .schema(
    z.object({
      userId: z.string(),
      action: z.enum(["follow", "unfollow"]),
      slug: z.string(),
    }),
  )
  .action(
    async ({
      parsedInput: { userId, action, slug },
      ctx: { userId: currentUserId },
    }) => {
      const supabase = await createClient();

      if (action === "follow") {
        // Add follow relationship
        const { error } = await supabase
          .from("follows")
          .insert({
            follower_id: currentUserId,
            following_id: userId,
          });

        if (error) {
          throw new Error(error.message);
        }
      } else {
        // Remove follow relationship
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", userId);

        if (error) {
          throw new Error(error.message);
        }
      }

      revalidatePath(`/profile/${slug}`);
      revalidatePath("/");

      return { success: true };
    },
  );
