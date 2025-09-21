"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export const createJobListingAction = authActionClient
  .metadata({
    actionName: "create-job-listing",
  })
  .schema(
    z.object({
      title: z.string(),
      company_id: z.string(),
      location: z.string().nullable(),
      description: z.string(),
      url: z.string().url(),
      workplace: z.enum(["On site", "Remote", "Hybrid"]),
      plan: z.enum(["standard", "featured", "premium"]),
      experience: z.string().nullable(),
    }),
  )
  .action(
    async ({
      parsedInput: {
        title,
        company_id,
        location,
        description,
        url,
        workplace,
        experience,
        plan,
      },
      ctx: { email, name },
    }) => {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("jobs")
        .insert({
          title,
          company_id,
          location,
          description,
          url,
          workplace,
          experience,
          plan,
        })
        .select("id")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const session = await createJobListingCheckoutSession({
        plan,
        jobListingId: data.id,
        companyId: company_id,
        email: email ?? "",
        customerName: name ?? "",
      });

      redirect(session.url);
    },
  );

// TODO: Implement Stripe integration
async function createJobListingCheckoutSession({
  //   plan,
  jobListingId,
}: //   companyId,
//   email,
//   customerName,
{
  plan: string;
  jobListingId: string;
  companyId: string;
  email: string;
  customerName: string;
}) {
  // Placeholder implementation - replace with actual Stripe integration

  // Return a placeholder session object
  return {
    url: `/checkout/success?job=${jobListingId}`,
    id: `cs_test_${Date.now()}`,
  };
}
