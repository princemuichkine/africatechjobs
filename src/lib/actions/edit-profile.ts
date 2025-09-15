"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export const editProfileAction = authActionClient
  .metadata({
    actionName: "edit-profile",
  })
  .schema(
    z.object({
      name: z.string(),
      status: z.string().nullable(),
      bio: z.string().nullable(),
      work: z.string().nullable(),
      website: z.string().url().nullable(),
      social_x_link: z.string().url().nullable(),
      is_public: z.boolean(),
      slug: z.string(),
    }),
  )
  .action(
    async ({
      parsedInput: {
        name,
        status,
        bio,
        work,
        website,
        social_x_link,
        is_public,
        slug,
      },
      ctx: { userId },
    }) => {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("profiles")
        .update({
          name,
          status,
          bio,
          work,
          website,
          social_x_link,
          is_public,
          slug,
        })
        .eq("id", userId)
        .select("id")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      revalidatePath("/profile");
      revalidatePath("/");

      return data;
    },
  );
