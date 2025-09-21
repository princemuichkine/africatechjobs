#!/usr/bin/env tsx

// Load environment variables
import { config } from "dotenv";
config();

import { JobProcessingPipeline } from "../src/lib/jobs/processing-pipeline";
import { createClient } from "@supabase/supabase-js";

async function testJobProcessingPipeline() {
  console.log("🚀 Testing Complete Job Processing Pipeline");
  console.log("==========================================\n");

  // Debug: Show loaded environment variables
  console.log("🔧 Environment Variables Status:");
  console.log(
    `   NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing"}`,
  );
  console.log(
    `   SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Missing"}`,
  );
  console.log(
    `   GOOGLE_API_KEY: ${process.env.GOOGLE_API_KEY ? "✅ Set" : "❌ Missing"}`,
  );
  console.log(`   AI_MODEL: ${process.env.AI_MODEL || "gemini (default)"}`);
  console.log("");

  try {
    // Initialize Supabase client for testing
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Missing Supabase environment variables!");
      console.log("");
      console.log("💡 To fix this:");
      console.log("   1. Run: ./setup-env.sh");
      console.log("   2. Or create .env file manually:");
      console.log('      echo "NEXT_PUBLIC_SUPABASE_URL=your_url" > .env');
      console.log('      echo "SUPABASE_SERVICE_ROLE_KEY=your_key" >> .env');
      console.log("");
      throw new Error(
        "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize pipeline with Supabase client
    const pipeline = new JobProcessingPipeline(supabase);

    // Test data with all new fields populated
    const testJobs = [
      {
        position: "Senior Software Engineer",
        company: "TechCorp Inc.",
        location: "San Francisco, CA",
        date: "2024-01-15",
        salary: "$120,000 - $160,000",
        jobUrl: "https://linkedin.com/jobs/view/123456789",
        description: `We are looking for a Senior Software Engineer to join our team. This role offers visa sponsorship and relocation assistance.

Requirements:
- 5+ years experience with React, Node.js, and TypeScript
- Experience with cloud platforms (AWS, GCP)
- Strong problem-solving skills

Benefits:
- Competitive salary: $120k - $160k
- Full visa sponsorship for international candidates
- Relocation assistance up to $10,000
- Health insurance and 401k`,
        sourceId: "123456789",
        isSponsored: true,
        salaryMin: 120000,
        salaryMax: 160000,
        currency: "USD",
        applyUrl: "https://techcorp.com/careers/apply/123",
      },
      {
        position: "Frontend Developer",
        company: "StartupXYZ",
        location: "New York, NY",
        date: "2024-01-14",
        salary: "€50,000 - €70,000",
        jobUrl: "https://linkedin.com/jobs/view/987654321",
        description: `Join our fast-growing startup as a Frontend Developer!

We're looking for someone with:
- 3+ years React experience
- Knowledge of modern JavaScript (ES6+)
- Experience with CSS frameworks

No visa sponsorship available at this time.`,
        sourceId: "987654321",
        isSponsored: false,
        salaryMin: 50000,
        salaryMax: 70000,
        currency: "EUR",
        applyUrl: "https://startupxyz.com/jobs/frontend-dev",
      },
      {
        position: "DevOps Engineer",
        company: "CloudTech Solutions",
        location: "London, UK",
        date: "2024-01-13",
        salary: "£60,000 - £80,000",
        jobUrl: "https://linkedin.com/jobs/view/555666777",
        description: `Senior DevOps Engineer position available.

Key responsibilities:
- Manage CI/CD pipelines
- Infrastructure as Code with Terraform
- Container orchestration with Kubernetes
- Monitoring and logging solutions

Benefits include:
- Competitive salary
- Work from home flexibility
- Professional development budget
- Pension scheme`,
        sourceId: "555666777",
        isSponsored: false,
        salaryMin: 60000,
        salaryMax: 80000,
        currency: "GBP",
        applyUrl: "https://cloudtech.com/careers/devops",
      },
    ];

    // Process each test job
    for (let i = 0; i < testJobs.length; i++) {
      const job = testJobs[i];
      console.log(`📋 Testing Job ${i + 1}: ${job.position} at ${job.company}`);
      console.log("─".repeat(50));

      console.log("Input Data:");
      console.log(`  Title: ${job.position}`);
      console.log(`  Company: ${job.company}`);
      console.log(`  Location: ${job.location}`);
      console.log(`  Salary: ${job.salary}`);
      console.log(`  Description: ${job.description.substring(0, 100)}...`);
      console.log(
        `  Visa Sponsorship: ${job.isSponsored ? "✅ Yes" : "❌ No (normal - most jobs don't sponsor)"}`,
      );
      console.log(
        `  Salary Range: ${job.salaryMin ? `${job.currency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax?.toLocaleString()}` : "Not specified (normal)"}`,
      );
      console.log(`  Apply URL: ${job.applyUrl}`);
      console.log("");

      try {
        const result = await pipeline.processIncomingJob(job, `Test-${i + 1}`);

        console.log("Processing Result:");
        console.log(`  Status: ${result.status}`);

        if (result.status === "success") {
          console.log(`  Job ID: ${result.jobId}`);
          console.log("✅ Job successfully processed and saved to database!");
        } else if (result.status === "duplicate") {
          console.log("⚠️ Job was detected as duplicate (already exists)");
        } else if (result.status === "not_tech_job") {
          console.log("🚫 Job was filtered out as non-tech");
        } else {
          console.log(`❌ Processing failed with status: ${result.status}`);
        }
      } catch (error) {
        console.error("💥 Error processing job:", error);
      }

      console.log("\n" + "=".repeat(60) + "\n");
    }

    // Verify database contents
    console.log("🔍 Verifying Database Contents...");
    console.log("─".repeat(30));
    const { data: jobs, error } = await supabase
      .from("jobs")
      .select(
        "id, title, company_name, salary_min, salary_max, currency, is_sponsored, source_id, description",
      )
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("❌ Database query failed:", error);
    } else {
      console.log(`Found ${jobs?.length || 0} recent jobs in database:`);
      jobs?.forEach((job, index) => {
        console.log(`${index + 1}. ${job.title} at ${job.company_name}`);
        console.log(
          `   Salary: ${job.salary_min ? `${job.currency} ${job.salary_min.toLocaleString()} - ${job.salary_max?.toLocaleString()}` : "Not specified (normal)"}`,
        );
        console.log(
          `   Visa Sponsorship: ${job.is_sponsored ? "✅ Yes" : "❌ No (normal - most jobs don't sponsor)"}`,
        );
        console.log(`   Source ID: ${job.source_id}`);
        console.log(
          `   Description Length: ${job.description?.length || 0} characters`,
        );
        console.log("");
      });
    }

    console.log("🎉 Pipeline testing completed!");
  } catch (error) {
    console.error("💥 Test failed with error:", error);
    process.exit(1);
  }
}

// Run the test
testJobProcessingPipeline()
  .then(() => {
    console.log("✅ All tests completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Test suite failed:", error);
    process.exit(1);
  });
