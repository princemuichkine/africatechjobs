"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export const upsertCompanyAction = authActionClient
  .metadata({
    actionName: "upsert-company",
  })
  .schema(
    z.object({
      id: z.string(),
      name: z.string(),
      location: z.string().nullable(),
      bio: z.string().nullable(),
      website: z.string().nullable(),
      image: z.string().nullable(),
      shouldRedirect: z.boolean().optional(),
    }),
  )
  .action(
    async ({
      parsedInput: { id, name, location, bio, website, image, shouldRedirect },
    }) => {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("companies")
        .upsert({
          id,
          name,
          location,
          description: bio,
          logo: image,
          website,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to upsert company: ${error.message}`);
      }

      if (shouldRedirect) {
        redirect(`/c/${data.id}`);
      }

      return data;
    },
  );
