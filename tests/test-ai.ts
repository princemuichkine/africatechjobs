#!/usr/bin/env tsx

// Load environment variables BEFORE any other imports
import { config } from "dotenv";
config();

import { createAIClient } from "@/lib/ai/client";

// AI client - lazy loaded for configurability (same as processing pipeline)
let aiClient: ReturnType<typeof createAIClient> | null = null;

function getAIClient(): ReturnType<typeof createAIClient> {
  if (!aiClient) {
    const configuredModel = (process.env.AI_MODEL || "gemini") as
      | "gemini"
      | "openai"
      | "anthropic";
    aiClient = createAIClient(configuredModel);
  }
  return aiClient;
}

/**
 * Simple test script to verify AI inference works
 * Run with: npx tsx src/lib/jobs/scripts/test-ai.ts
 */

async function testAI() {
  console.log("🧠 Testing AI Inference...\n");

  // Check environment variables
  console.log("🔧 Environment variables loaded:");
  console.log(
    `  GOOGLE_API_KEY: ${process.env.GOOGLE_API_KEY ? "present" : "missing"} (${process.env.GOOGLE_API_KEY?.length || 0} chars)`,
  );
  console.log(
    `  OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? "present" : "missing"} (${process.env.OPENAI_API_KEY?.length || 0} chars)`,
  );
  console.log(
    `  ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? "present" : "missing"} (${process.env.ANTHROPIC_API_KEY?.length || 0} chars)`,
  );
  console.log(`  AI_MODEL: ${process.env.AI_MODEL || "gemini (default)"}\n`);

  try {
    const aiClient = getAIClient();

    // Test tech job validation
    console.log("1. Testing tech job validation...");
    const techValidation = await aiClient.validateTechJob(
      "Senior Software Engineer",
      "Google",
      "Mountain View, CA",
      "We are looking for a Senior Software Engineer with 5+ years of experience in React, Node.js, and cloud technologies.",
    );

    // Test non-tech job validation
    console.log("\n3. Testing non-tech job validation...");
    const nonTechValidation = await aiClient.validateTechJob(
      "Sales Manager",
      "ABC Corporation",
      "New York, NY",
      "We are looking for an experienced Sales Manager to lead our sales team and drive revenue growth through client acquisition and relationship management.",
    );

    console.log("✅ Tech job validation result:", techValidation);
    console.log("✅ Non-tech job validation result:", nonTechValidation);

    // Test visa sponsorship detection
    console.log("\n2. Testing visa sponsorship detection...");
    const visaResult = await aiClient.validateTechJob(
      "Senior Software Engineer",
      "Google",
      "Mountain View, CA",
      "We are looking for a Senior Software Engineer with 5+ years of experience in React, Node.js, and cloud technologies. Visa sponsorship available for qualified candidates.",
    );

    console.log("✅ Visa sponsorship detection result:", visaResult);

    console.log("\n🎉 All AI tests passed!");
  } catch (error) {
    console.error("❌ AI test failed:", error);
    process.exit(1);
  }
}

// Run the test
testAI().catch(console.error);
