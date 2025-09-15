"use server";

import { redis } from "@/lib/redis/client";
import { headers } from "next/headers";
import { z } from "zod";
import { actionClient } from "./safe-action";

export const voteAction = actionClient
  .metadata({
    actionName: "vote",
  })
  .schema(
    z.object({
      slug: z.string(),
    }),
  )
  .action(async ({ parsedInput }: { parsedInput: { slug: string } }) => {
    const { slug } = parsedInput;
    const clientIP = (await headers()).get("x-forwarded-for");

    if (!clientIP) {
      throw new Error("Unable to get client IP");
    }

    const hasVoted = await redis.sadd(`rules:${slug}:ip:${clientIP}`, "voted");

    if (hasVoted === 0) {
      throw new Error("You have already voted");
    }

    await redis.incr(`rules:${slug}`);

    return { success: true };
  });
