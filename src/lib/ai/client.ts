import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";

// Using Vercel AI SDK - no need for custom config interfaces

export interface AIResponse {
  is_tech_job: 1 | 0;
  quality_score: number;
  is_visa_sponsored: 1 | 0;
  job_category:
    | "ENGINEERING"
    | "SALES"
    | "MARKETING"
    | "DATA"
    | "DEVOPS"
    | "PRODUCT"
    | "DESIGN"
    | "CLOUD"
    | "SUPPORT"
    | "MANAGEMENT"
    | "RESEARCH"
    | "LEGAL"
    | "FINANCE"
    | "OPERATIONS"
    | "PR"
    | "HR"
    | "OTHER";
  job_type:
    | "FULL_TIME"
    | "PART_TIME"
    | "CONTRACT"
    | "FREELANCE"
    | "INTERNSHIP"
    | "APPRENTICESHIP";
  experience_level:
    | "ENTRY_LEVEL"
    | "JUNIOR"
    | "MID_LEVEL"
    | "SENIOR"
    | "EXECUTIVE";
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  standardized_city: string;
  extracted_apply_url: string; // AI-extracted external application URL
  company_website: string; // AI-extracted company website for logo
  summarized_description: string; // AI-reformatted description in one sentence
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
    salaryText?: string,
  ): Promise<AIResponse> {
    // Enhanced prompt with description and salary analysis - OPTIMIZED FOR COST
    const descSnippet = description
      ? `Description: ${description.substring(0, 500)}${description.length > 500 ? "..." : ""}` // Reduced from 800 to 500 chars
      : "";
    const salarySnippet = salaryText ? `Salary Info: ${salaryText}` : "";

    const prompt = `Analyze this job posting and respond with EXACTLY this format, each on a new line:

TECH_JOB: [1 or 0]
QUALITY: [0.0 to 1.0]
VISA: [1 or 0]
CATEGORY: [one word from list]
TYPE: [one word from list]
LEVEL: [one word from list]
SALARY_MIN: [number or NULL]
SALARY_MAX: [number or NULL]
CURRENCY: [3-letter code]
CITY: [clean city name]
APPLY_URL: [best application URL]
WEBSITE: [company main website]
DESCRIPTION: [reformatted into ONE sentence, first 270 chars only]

Job Title: "${jobTitle}"
Company: ${companyName}
Location: ${location}
${salarySnippet}
${descSnippet}

TECH_JOB: 1 if REAL tech/software job OR tech company role, 0 if not. Include: developers, engineers, data roles, product, design, DevOps, AND sales/marketing/support/operations at tech companies (Google, Meta, Shopify, etc.). Reject: non-tech companies, pure consulting, generic business roles.
QUALITY: 0.0-1.0 based on detail, specificity, company reputation
VISA: 1 if mentions visa sponsorship/work permits/relocation assistance, 0 if not
CATEGORY: ENGINEERING|SALES|MARKETING|DATA|DEVOPS|PRODUCT|DESIGN|CLOUD|SUPPORT|MANAGEMENT|RESEARCH|LEGAL|FINANCE|OPERATIONS|PR|HR|OTHER
TYPE: FULL_TIME|PART_TIME|CONTRACT|FREELANCE|INTERNSHIP|APPRENTICESHIP
LEVEL: ENTRY_LEVEL|JUNIOR|MID_LEVEL|SENIOR|EXECUTIVE
SALARY_MIN: Extract minimum salary as number (in local currency) or NULL
SALARY_MAX: Extract maximum salary as number (in local currency) or NULL  
CURRENCY: USD|EUR|GBP|ZAR|NGN|KES|EGP|MAD|TND|etc (local currency)
CITY: Clean, standardized city name (e.g. "Lagos" not "Greater Lagos Area")
APPLY_URL: If description mentions external application URL, extract it. Otherwise return "LINKEDIN"
WEBSITE: Company main website (e.g. "google.com", "shopify.com") for logo fetching
DESCRIPTION: Take first 270 characters only, remove LinkedIn boilerplate ("About the Role", "About us:", etc.), reformat into ONE coherent sentence describing the job role and requirements

Example:
TECH_JOB: 1
QUALITY: 0.85
VISA: 0
CATEGORY: ENGINEERING
TYPE: FULL_TIME
LEVEL: SENIOR
SALARY_MIN: 80000
SALARY_MAX: 120000
CURRENCY: USD
CITY: Lagos
APPLY_URL: https://careers.google.com/apply/123
WEBSITE: google.com
DESCRIPTION: We are seeking a Senior React Developer to join our team, requiring 5+ years of experience with React, Node.js, and cloud technologies to build scalable web applications and lead development teams.`;

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
        job_category: "OTHER",
        job_type: "FULL_TIME",
        experience_level: "MID_LEVEL",
        salary_min: null,
        salary_max: null,
        currency: "USD",
        standardized_city: location || "Remote",
        extracted_apply_url: "LINKEDIN",
        company_website: "unknown.com",
        summarized_description: "Job description not available.",
      };
    }
  }

  private parseResponse(text: string): AIResponse {
    console.log(`🤖 AI Response: "${text.trim()}"`);

    // Default fallback values
    const fallback: AIResponse = {
      is_tech_job: 1,
      quality_score: 0.5,
      is_visa_sponsored: 0,
      job_category: "OTHER",
      job_type: "FULL_TIME",
      experience_level: "MID_LEVEL",
      salary_min: null,
      salary_max: null,
      currency: "USD",
      standardized_city: "Remote",
      extracted_apply_url: "LINKEDIN",
      company_website: "unknown.com",
      summarized_description: "Job description not available.",
    };

    try {
      // Parse the structured format
      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      const parsed: Partial<AIResponse> = {};

      for (const line of lines) {
        const [key, value] = line.split(":").map((s) => s.trim());

        switch (key) {
          case "TECH_JOB":
            parsed.is_tech_job = parseInt(value) as 0 | 1;
            break;
          case "QUALITY":
            parsed.quality_score = Math.max(0, Math.min(1, parseFloat(value)));
            break;
          case "VISA":
            parsed.is_visa_sponsored = parseInt(value) as 0 | 1;
            break;
          case "CATEGORY":
            if (
              [
                "ENGINEERING",
                "SALES",
                "MARKETING",
                "DATA",
                "DEVOPS",
                "PRODUCT",
                "DESIGN",
                "CLOUD",
                "SUPPORT",
                "MANAGEMENT",
                "RESEARCH",
                "LEGAL",
                "FINANCE",
                "OPERATIONS",
                "PR",
                "HR",
                "OTHER",
              ].includes(value)
            ) {
              parsed.job_category = value as AIResponse["job_category"];
            }
            break;
          case "TYPE":
            if (
              [
                "FULL_TIME",
                "PART_TIME",
                "CONTRACT",
                "FREELANCE",
                "INTERNSHIP",
                "APPRENTICESHIP",
              ].includes(value)
            ) {
              parsed.job_type = value as AIResponse["job_type"];
            }
            break;
          case "LEVEL":
            if (
              [
                "ENTRY_LEVEL",
                "JUNIOR",
                "MID_LEVEL",
                "SENIOR",
                "EXECUTIVE",
              ].includes(value)
            ) {
              parsed.experience_level = value as AIResponse["experience_level"];
            }
            break;
          case "SALARY_MIN":
            parsed.salary_min = value === "NULL" ? null : parseInt(value);
            break;
          case "SALARY_MAX":
            parsed.salary_max = value === "NULL" ? null : parseInt(value);
            break;
          case "CURRENCY":
            parsed.currency = value;
            break;
          case "CITY":
            parsed.standardized_city = value;
            break;
          case "APPLY_URL":
            parsed.extracted_apply_url = value;
            break;
          case "WEBSITE":
            parsed.company_website = value;
            break;
          case "DESCRIPTION":
            parsed.summarized_description = value;
            break;
        }
      }

      // Merge parsed values with fallback
      return {
        ...fallback,
        ...parsed,
      };
    } catch (error) {
      console.warn(
        `⚠️ AI response parsing failed, using fallback. Response: "${text}"`,
        error,
      );
      return fallback;
    }
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
  salary?: string,
) {
  const models = getAIModels();
  const modelKeys = Object.keys(models) as (keyof typeof models)[];

  console.log(`🧪 Testing AI models for: "${jobTitle}" at ${companyName}`);
  if (description)
    console.log(`Description: ${description.substring(0, 100)}...`);
  if (salary) console.log(`Salary: ${salary}`);
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
        salary,
      );
      const duration = Date.now() - startTime;

      console.log(
        `${model.toUpperCase()}: ✅ Connected - ${result.is_tech_job ? "TECH" : "NOT TECH"} | ${result.job_category} | ${result.job_type} | ${result.experience_level} | ${result.standardized_city} | (${result.quality_score.toFixed(2)}) - ${duration}ms`,
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
      salary,
    );
    console.log(
      `FALLBACK: ✅ Working - ${result.is_tech_job ? "TECH" : "NOT TECH"} | ${result.job_category} | ${result.job_type} | ${result.experience_level} | ${result.standardized_city} | (${result.quality_score.toFixed(2)})`,
    );
  } catch (error) {
    console.log(
      `FALLBACK: ❌ Failed - ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
