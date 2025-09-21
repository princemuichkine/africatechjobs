import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";

// Using Vercel AI SDK - no need for custom config interfaces

export interface AIResponse {
  is_tech_job: 1 | 0;
  quality_score: number;
  is_visa_sponsored: 1 | 0;
}

// Function to get model configurations with current environment variables
function getAIModels() {
  return {
    gemini: google("gemini-2.0-flash"),
    openai: openai("gpt-4o-mini"),
    anthropic: anthropic("claude-3-5-sonnet-20241022"),
  } as const;
}

// Helper function to check if a model has valid API keys
function hasValidApiKey(modelName: string): boolean {
  switch (modelName) {
    case "gemini":
      return !!(
        process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
      );
    case "openai":
      return !!process.env.OPENAI_API_KEY;
    case "anthropic":
      return !!process.env.ANTHROPIC_API_KEY;
    default:
      return false;
  }
}

type AIModel = ReturnType<typeof google | typeof openai | typeof anthropic>;

export class AIClient {
  private model: AIModel;

  constructor(model: AIModel) {
    this.model = model;
    console.log(`🔧 Initializing AI client with Vercel AI SDK`);
  }

  async testConnection(): Promise<void> {
    // Test connection with a minimal prompt
    const testPrompt = "Say 'OK' if you can read this.";

    try {
      await generateText({
        model: this.model,
        prompt: testPrompt,
      });
    } catch (error) {
      throw new Error(
        `Connection test failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async validateTechJob(
    jobTitle: string,
    companyName: string,
    location: string,
    description?: string,
  ): Promise<AIResponse> {
    // Enhanced prompt with description analysis for better accuracy
    const descSnippet = description
      ? `Description: ${description.substring(0, 500)}${description.length > 500 ? "..." : ""}`
      : "";
    const prompt = `Analyze this job posting and respond with ONLY three numbers separated by spaces:

Job Title: "${jobTitle}"
Company: ${companyName}
Location: ${location}
${descSnippet}

First number: 1 if this is a REAL tech/software development job, 0 if not (be strict - reject consulting, sales, non-technical roles)
Second number: Quality score from 0.0 to 1.0 (based on detail, specificity, company reputation)
Third number: 1 if job offers visa sponsorship/work permits/immigration support/relocation assistance, 0 if not. Look for explicit indicators like:
- "visa sponsorship", "work visa", "H1B", "employment visa", "sponsor visa"
- "work permit", "immigration support", "visa support"
- "relocation assistance", "relocation bonus", "moving expenses", "relocation package"
- "settling allowance", "relocation support", "immigration assistance"
- Company mentions supporting international candidates or work authorization

Example responses:
"1 0.8 1" (good tech job with visa sponsorship mentioned)
"0 0.2 0" (not a tech job, no visa sponsorship)
"1 0.95 0" (excellent tech job, no visa/relocation mentions)

Respond with ONLY the three numbers:`;

    try {
      const { text } = await generateText({
        model: this.model,
        prompt: prompt,
        temperature: 0,
      });

      return this.parseResponse(text.trim());
    } catch (error) {
      console.warn(`❌ AI failed for job "${jobTitle}" at ${companyName}:`, {
        error: error instanceof Error ? error.message : String(error),
        descriptionLength: description?.length || 0,
      });
      return {
        is_tech_job: 1, // Default to tech for our board
        quality_score: 0.5,
        is_visa_sponsored: 0, // Default to no visa sponsorship
      };
    }
  }

  private parseResponse(text: string): AIResponse {
    console.log(`🤖 AI Response: "${text.trim()}"`);

    // Try multiple parsing strategies for robustness

    // Strategy 1: Look for the expected format "X Y Z" where X,Z are 0 or 1, Y is 0.0-1.0
    const tripleFormatMatch = text.match(
      /^\s*([01])\s+([0-1]?(?:\.\d+)?)\s+([01])\s*$/,
    );
    if (tripleFormatMatch) {
      const isTech = parseInt(tripleFormatMatch[1]) as 0 | 1;
      const quality = parseFloat(tripleFormatMatch[2]);
      const isSponsored = parseInt(tripleFormatMatch[3]) as 0 | 1;
      return {
        is_tech_job: isTech,
        quality_score: Math.max(0, Math.min(1, quality)),
        is_visa_sponsored: isSponsored,
      };
    }

    // Strategy 2: Extract first three valid numbers from anywhere in the response
    const numberMatches = text.match(/(\d+(?:\.\d+)?)/g);
    if (numberMatches && numberMatches.length >= 3) {
      const numbers = numberMatches
        .map((n) => parseFloat(n))
        .filter((n) => !isNaN(n));
      if (numbers.length >= 3) {
        const isTech = (numbers[0] >= 1 ? 1 : 0) as 0 | 1;
        const quality = Math.max(0, Math.min(1, numbers[1]));
        const isSponsored = (numbers[2] >= 1 ? 1 : 0) as 0 | 1;
        return {
          is_tech_job: isTech,
          quality_score: quality,
          is_visa_sponsored: isSponsored,
        };
      }
    }

    // Strategy 3: Extract two numbers and check for visa keywords
    if (numberMatches && numberMatches.length >= 2) {
      const numbers = numberMatches
        .map((n) => parseFloat(n))
        .filter((n) => !isNaN(n));
      if (numbers.length >= 2) {
        const isTech = (numbers[0] >= 1 ? 1 : 0) as 0 | 1;
        const quality = Math.max(0, Math.min(1, numbers[1]));
        // Enhanced keyword detection for visa sponsorship
        const lowerText = text.toLowerCase();
        const visaKeywords =
          /\b(visa.?sponsorship|work.?visa|h1b|employment.?visa|sponsor.?visa|work.?permit|immigration.?support|visa.?support|relocation.?assistance|relocation.?bonus|moving.?expenses|relocation.?package|settling.?allowance|relocation.?support|immigration.?assistance|international.?candidates|work.?authorization|green.?card)\b/;
        const isSponsored = visaKeywords.test(lowerText) ? 1 : 0;
        return {
          is_tech_job: isTech,
          quality_score: quality,
          is_visa_sponsored: isSponsored as 0 | 1,
        };
      }
    }

    // Strategy 4: Fallback - check for keywords
    const lowerText = text.toLowerCase();
    const isNonTech =
      /\b(consulting|sales|marketing|hr|recruiter|business|management)\b/.test(
        lowerText,
      );
    const visaKeywords =
      /\b(visa.?sponsorship|work.?visa|h1b|employment.?visa|sponsor.?visa|work.?permit|immigration.?support|visa.?support|relocation.?assistance|relocation.?bonus|moving.?expenses|relocation.?package|settling.?allowance|relocation.?support|immigration.?assistance|international.?candidates|work.?authorization|green.?card)\b/;
    const isSponsored = visaKeywords.test(lowerText);
    const quality = isNonTech ? 0.2 : 0.7;

    console.warn(
      `⚠️ AI response parsing failed, using fallback. Response: "${text}"`,
    );

    return {
      is_tech_job: (isNonTech ? 0 : 1) as 0 | 1,
      quality_score: quality,
      is_visa_sponsored: (isSponsored ? 1 : 0) as 0 | 1,
    };
  }
}

// Factory function to create AI client with fallback chain: specified model -> others
export function createAIClient(model: string = "gemini"): AIClient {
  const models = getAIModels();

  // Start with the specified model, then try the others in order
  const fallbackOrder: (keyof typeof models)[] = [
    model as keyof typeof models,
    ...((["gemini", "openai", "anthropic"] as const).filter(
      (m) => m !== model,
    ) as (keyof typeof models)[]),
  ];

  for (const modelName of fallbackOrder) {
    if (!hasValidApiKey(modelName)) {
      console.warn(`No API key found for ${modelName}, trying next...`);
      continue;
    }

    try {
      const modelInstance = models[modelName];
      const client = new AIClient(modelInstance);
      console.log(`✅ Using ${modelName} with Vercel AI SDK`);
      return client;
    } catch (error) {
      console.warn(
        `❌ ${modelName} client initialization failed:`,
        error instanceof Error ? error.message : String(error),
      );
      continue;
    }
  }

  // If all models fail, create a fallback client (shouldn't happen with Vercel AI SDK)
  console.warn(
    "❌ All AI models failed to initialize, using basic validation without AI",
  );
  return new AIClient(models.gemini); // Fallback to Gemini
}

// Test different models
export async function testAIModels(
  jobTitle: string,
  companyName: string,
  location: string,
  description?: string,
) {
  const models = getAIModels();
  const modelKeys = Object.keys(models) as (keyof typeof models)[];

  console.log(`🧪 Testing AI models for: "${jobTitle}" at ${companyName}`);
  if (description)
    console.log(`Description: ${description.substring(0, 100)}...`);
  console.log("");

  for (const model of modelKeys) {
    try {
      // Test connection first
      const testClient = new AIClient(models[model]);
      await testClient.testConnection();

      // Then test actual validation
      const startTime = Date.now();
      const result = await testClient.validateTechJob(
        jobTitle,
        companyName,
        location,
        description,
      );
      const duration = Date.now() - startTime;

      console.log(
        `${model.toUpperCase()}: ✅ Connected - ${result.is_tech_job ? "TECH" : "NOT TECH"} (${result.quality_score.toFixed(2)}) - ${duration}ms`,
      );
    } catch (error) {
      console.log(
        `${model.toUpperCase()}: ❌ Failed - ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // Test fallback chain
  console.log("\n🔄 Testing fallback chain...");
  try {
    const fallbackClient = createAIClient();
    const result = await fallbackClient.validateTechJob(
      jobTitle,
      companyName,
      location,
      description,
    );
    console.log(
      `FALLBACK: ✅ Working - ${result.is_tech_job ? "TECH" : "NOT TECH"} (${result.quality_score.toFixed(2)})`,
    );
  } catch (error) {
    console.log(
      `FALLBACK: ❌ Failed - ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
