import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer, { Browser, Page } from "puppeteer";

export interface LinkedInJob {
  position: string;
  company: string;
  city: string;
  date: string;
  jobUrl: string;
  agoTime: string;
  // salary and companyLogo are not consistently available, so we make them optional
  salary?: string;
  companyLogo?: string;
  remote?: boolean;
  // Enhanced fields for complete database mapping
  description?: string; // Extract from job detail page
  sourceId?: string; // LinkedIn job ID from URL
  isSponsored?: boolean; // Visa sponsorship and relocation benefits
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  applyUrl?: string; // Actual apply URL (not LinkedIn redirect)
}

export interface QueryOptions {
  keyword?: string;
  location?: string;
  sortBy?: "recent" | "relevant";
  limit?: number;
  dateSincePosted?: string;
  // Additional filters from reference implementation
  jobType?:
    | "full time"
    | "part time"
    | "contract"
    | "temporary"
    | "volunteer"
    | "internship";
  remoteFilter?: "on-site" | "on site" | "remote" | "hybrid";
  salary?: "40000" | "60000" | "80000" | "100000" | "120000";
  experienceLevel?:
    | "internship"
    | "entry level"
    | "associate"
    | "senior"
    | "director"
    | "executive";
  has_verification?: boolean;
  under_10_applicants?: boolean;
  page?: number;
}

// Rate limiter configuration
interface RateLimiterConfig {
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RATE_CONFIG: RateLimiterConfig = {
  maxRequestsPerMinute: 30, // Conservative limit for LinkedIn
  maxRequestsPerHour: 200,
  baseDelay: 2000,
  maxDelay: 30000,
  backoffMultiplier: 2,
};

// Rate limiter state
class RateLimiter {
  private requestTimes: number[] = [];
  private consecutiveErrors = 0;

  constructor(private config: RateLimiterConfig = DEFAULT_RATE_CONFIG) {}

  async waitForNextRequest(): Promise<void> {
    const now = Date.now();

    // Clean old requests (keep only last hour)
    this.requestTimes = this.requestTimes.filter(
      (time) => now - time < 3600000,
    );

    // Check per-minute limit
    const requestsInLastMinute = this.requestTimes.filter(
      (time) => now - time < 60000,
    ).length;
    if (requestsInLastMinute >= this.config.maxRequestsPerMinute) {
      const oldestRecentRequest = Math.min(
        ...this.requestTimes.filter((time) => now - time < 60000),
      );
      const waitTime = 60000 - (now - oldestRecentRequest);
      console.log(
        `⏱️ Rate limit: Waiting ${Math.ceil(waitTime / 1000)}s for per-minute limit`,
      );
      await this.delay(waitTime);
      return this.waitForNextRequest(); // Recheck after waiting
    }

    // Check per-hour limit
    if (this.requestTimes.length >= this.config.maxRequestsPerHour) {
      const oldestRequest = Math.min(...this.requestTimes);
      const waitTime = 3600000 - (now - oldestRequest);
      console.log(
        `⏱️ Rate limit: Waiting ${Math.ceil(waitTime / 1000)}s for per-hour limit`,
      );
      await this.delay(waitTime);
      return this.waitForNextRequest(); // Recheck after waiting
    }

    // Calculate delay with exponential backoff for consecutive errors
    const baseDelay = this.config.baseDelay + Math.random() * 1000;
    const backoffDelay =
      this.consecutiveErrors > 0
        ? Math.min(
            this.config.baseDelay *
              Math.pow(this.config.backoffMultiplier, this.consecutiveErrors),
            this.config.maxDelay,
          )
        : 0;

    const totalDelay = baseDelay + backoffDelay;
    if (totalDelay > 0) {
      console.log(
        `⏱️ Waiting ${Math.ceil(totalDelay / 1000)}s before next request${backoffDelay > 0 ? ` (backoff for ${this.consecutiveErrors} errors)` : ""}`,
      );
      await this.delay(totalDelay);
    }
  }

  recordRequest(): void {
    this.requestTimes.push(Date.now());
  }

  recordSuccess(): void {
    this.consecutiveErrors = 0;
  }

  recordError(): void {
    this.consecutiveErrors++;
  }

  getConsecutiveErrors(): number {
    return this.consecutiveErrors;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

// Puppeteer browser instance for job detail extraction
let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
      ],
    });
  }
  return browser;
}

async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

// Utility functions

// Generate random user agent (matching the reference implementation)
function getRandomUserAgent(): string {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
    // Additional user agents from reference implementation
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// URL building functions from reference implementation
function getDateSincePosted(dateSincePosted?: string): string {
  const dateRange: Record<string, string> = {
    "past month": "r2592000",
    "past week": "r604800",
    "24hr": "r86400",
  };
  return dateRange[dateSincePosted?.toLowerCase() || ""] || "";
}

function getExperienceLevel(experienceLevel?: string): string {
  const experienceRange: Record<string, string> = {
    internship: "1",
    "entry level": "2",
    associate: "3",
    senior: "4",
    director: "5",
    executive: "6",
  };
  return experienceRange[experienceLevel?.toLowerCase() || ""] || "";
}

function getJobType(jobType?: string): string {
  const jobTypeRange: Record<string, string> = {
    "full time": "F",
    "full-time": "F",
    "part time": "P",
    "part-time": "P",
    contract: "C",
    temporary: "T",
    volunteer: "V",
    internship: "I",
  };
  return jobTypeRange[jobType?.toLowerCase() || ""] || "";
}

function getRemoteFilter(remoteFilter?: string): string {
  const remoteFilterRange: Record<string, string> = {
    "on-site": "1",
    "on site": "1",
    remote: "2",
    hybrid: "3",
  };
  return remoteFilterRange[remoteFilter?.toLowerCase() || ""] || "";
}

function getSalary(salary?: string): string {
  const salaryRange: Record<string, string> = {
    40000: "1",
    60000: "2",
    80000: "3",
    100000: "4",
    120000: "5",
  };
  return salaryRange[salary || ""] || "";
}

function getPage(page?: number): number {
  return (page || 0) * 25;
}

// Build LinkedIn search URL with all filters (matching reference implementation)
function buildLinkedInUrl(queryObject: QueryOptions, start: number): string {
  const host = "www.linkedin.com";
  const query = `https://${host}/jobs-guest/jobs/api/seeMoreJobPostings/search?`;

  const params = new URLSearchParams();

  if (queryObject.keyword) params.append("keywords", queryObject.keyword);
  if (queryObject.location) params.append("location", queryObject.location);
  if (getDateSincePosted(queryObject.dateSincePosted)) {
    params.append("f_TPR", getDateSincePosted(queryObject.dateSincePosted));
  }
  if (getSalary(queryObject.salary))
    params.append("f_SB2", getSalary(queryObject.salary));
  if (getExperienceLevel(queryObject.experienceLevel)) {
    params.append("f_E", getExperienceLevel(queryObject.experienceLevel));
  }
  if (getRemoteFilter(queryObject.remoteFilter))
    params.append("f_WT", getRemoteFilter(queryObject.remoteFilter));
  if (getJobType(queryObject.jobType))
    params.append("f_JT", getJobType(queryObject.jobType));
  if (queryObject.has_verification !== undefined) {
    params.append("f_VJ", queryObject.has_verification ? "true" : "false");
  }
  if (queryObject.under_10_applicants !== undefined) {
    params.append("f_EA", queryObject.under_10_applicants ? "true" : "false");
  }

  params.append("start", (start + getPage(queryObject.page)).toString());

  if (queryObject.sortBy === "recent") params.append("sortBy", "DD");
  else if (queryObject.sortBy === "relevant") params.append("sortBy", "R");

  return query + params.toString();
}

// Extract LinkedIn Job ID from URL (supports different LinkedIn domains)
function extractJobId(url: string): string | undefined {
  // Try different patterns for LinkedIn job URLs
  const patterns = [
    /\/jobs\/view\/[^-]+-(\d+)/, // /jobs/view/job-title-123456789
    /\/jobs\/view\/(\d+)/, // /jobs/view/123456789
    /jobId=(\d+)/, // jobId=123456789
    /trackingId=[^&]+&[^&]*(\d+)/, // trackingId=...&...123456789
    /-(\d+)\?/, // -4301902551?
    /\/(\d+)\?/, // /4301902551?
    /(\d{10,})/, // Any 10+ digit number (LinkedIn job IDs are usually 10 digits)
  ];

  console.log(`🔍 Extracting job ID from URL: ${url}`);

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      const jobId = match[1];
      console.log(`✅ Found job ID: ${jobId} using pattern: ${pattern}`);
      return jobId;
    }
  }

  console.log(`❌ No job ID found in URL`);
  return undefined;
}

// Parse salary information from text
function parseSalaryInfo(salaryText: string): {
  min?: number;
  max?: number;
  currency?: string;
} {
  if (!salaryText || salaryText === "Not specified") return {};

  // console.log(`💰 Parsing salary text: "${salaryText}"`);

  // Common patterns: "$50,000 - $70,000", "€40k - €60k", "£30000 - £50000"
  const patterns = [
    // USD/Other currencies with commas and decimals
    /[\$€£]([\d,]+(?:\.\d+)?)(?:\s*(?:-|to|–|and)\s*[\$€£]?([\d,]+(?:\.\d+)?))?/i,
    // K notation: $50k - $70k, $50K - $70K
    /[\$€£](\d+(?:\.\d+)?)(?:k|K)\s*(?:-|to|–|and)\s*[\$€£]?(\d+(?:\.\d+)?)(?:k|K)?/i,
    // Plain numbers with currency: USD 50000 - 70000
    /(?:USD|EUR|GBP|CAD|AUD)\s*(\d{4,7})(?:\s*(?:-|to|–|and)\s*(\d{4,7}))?/i,
    // Numbers only: 50000 - 70000
    /(\d{4,7})\s*(?:-|to|–|and)\s*(\d{4,7})/,
    // Single amounts: $60000, €50k, £45000
    /[\$€£](\d+(?:\.\d+)?)(k|K)?/i,
  ];

  for (const pattern of patterns) {
    const match = salaryText.match(pattern);
    if (match) {
      console.log(`✅ Salary pattern matched: ${pattern}`);

      // Determine currency
      let currency = "USD"; // default
      if (salaryText.includes("€")) currency = "EUR";
      else if (salaryText.includes("£")) currency = "GBP";
      else if (salaryText.includes("USD")) currency = "USD";
      else if (salaryText.includes("EUR")) currency = "EUR";
      else if (salaryText.includes("GBP")) currency = "GBP";
      else if (salaryText.includes("$")) currency = "USD";

      let min: number | undefined;
      let max: number | undefined;

      if (match[2]) {
        // Range format: min - max
        min = parseFloat(match[1].replace(/,/g, ""));
        max = parseFloat(match[2].replace(/,/g, ""));

        // Handle K notation
        if (
          match[0].toLowerCase().includes("k") ||
          salaryText.toLowerCase().includes("k")
        ) {
          min *= 1000;
          max *= 1000;
        }
      } else {
        // Single amount
        min = parseFloat(match[1].replace(/,/g, ""));

        // Handle K notation
        if (
          match[2] &&
          (match[2].toLowerCase() === "k" ||
            salaryText.toLowerCase().includes("k"))
        ) {
          min *= 1000;
        }

        // For single amounts, we might want to estimate a range
        // But for now, just set min = max
        max = min;
      }

      console.log(
        `💰 Parsed salary: ${currency} ${min?.toLocaleString()} - ${max?.toLocaleString()}`,
      );
      return { min, max, currency };
    }
  }

  // console.log(`❌ No salary pattern matched for: "${salaryText}"`);
  return {};
}

// Extract comprehensive job details using Puppeteer
async function extractJobDetails(
  jobUrl: string,
  job: LinkedInJob,
): Promise<LinkedInJob> {
  let page: Page | null = null;

  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    // Set user agent and headers to mimic real browser
    await page.setUserAgent(getRandomUserAgent());
    await page.setExtraHTTPHeaders({
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    });

    console.log(`🌐 Visiting job page: ${jobUrl}`);

    // Navigate to job page with timeout
    await page.goto(jobUrl, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Wait for content to load
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Extract job description with multiple selector attempts
    let description = "";
    try {
      const descriptionSelectors = [
        ".jobs-description",
        ".job-details-jobs-unified-description",
        ".jobs-description__content",
        ".job-details-description",
        '[data-test-id="job-details-description"]',
        ".job-detail-description",
        ".description__text",
        ".job-description",
      ];

      for (const selector of descriptionSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            description = await page.evaluate(
              (el) => el.textContent?.trim() || "",
              element,
            );
            if (description && description.length > 50) {
              // Minimum viable description
              break;
            }
          }
        } catch {
          // Continue to next selector
        }
      }

      // Clean up description
      description = description.replace(/\s+/g, " ").trim();
      if (description.length > 10000) {
        description = description.substring(0, 10000) + "...";
      }

      if (!description) {
        // Debug: Try to see what's actually on the page
        try {
          const pageContent = await page.evaluate(() => {
            const elements = document.querySelectorAll("*");
            const textElements = Array.from(elements)
              .filter((el) => el.textContent && el.textContent.length > 100)
              .slice(0, 3)
              .map((el) => ({
                tag: el.tagName,
                class: el.className,
                text: el.textContent?.substring(0, 200) + "...",
              }));
            return textElements;
          });
          console.warn(
            `Could not extract description from ${jobUrl}. Page content:`,
            pageContent,
          );
        } catch {
          console.warn(
            `Could not extract description from ${jobUrl} and failed to debug page content`,
          );
        }
      }
    } catch (error) {
      console.warn(`Error extracting description from ${jobUrl}:`, error);
    }

    // Extract city from job detail page (more accurate than search results)
    let detailedCity = job.city; // Start with search result city
    try {
      const locationSelectors = [
        ".job-details-jobs-unified-top-card__primary-description-container .job-details-jobs-unified-top-card__bullet",
        ".job-details-location",
        '[data-test-id="job-location"]',
        ".job-location",
        ".location",
      ];

      for (const selector of locationSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            const locationText = await page.evaluate(
              (el) => el.textContent?.trim() || "",
              element,
            );
            if (
              locationText &&
              locationText.length > 0 &&
              locationText !== "Not specified"
            ) {
              detailedCity = locationText;
              console.log(`✅ Found detailed city: ${detailedCity}`);
              break;
            }
          }
        } catch {
          // Continue to next selector
        }
      }
    } catch (error) {
      console.warn(`Could not extract detailed city from ${jobUrl}:`, error);
    }

    // Extract actual apply URL - ENHANCED VERSION
    // Priority: 1) Direct external URL, 2) LinkedIn externalApply encoded URL, 3) Click and navigate, 4) LinkedIn URL for internal applications
    let applyUrl = jobUrl; // Default to LinkedIn URL for internal applications
    try {
      // LinkedIn 2024/2025 apply button selectors (more comprehensive)
      const applySelectors = [
        // External apply links (highest priority)
        'a[href*="externalApply"]',
        'a[data-tracking-control-name="public_jobs_apply-link-offsite"]',
        'a[href*="/jobs/apply/"]',

        // LinkedIn apply buttons (various layouts)
        'button[data-tracking-control-name*="apply"]',
        'a[data-tracking-control-name*="apply"]',
        'button[data-control-name*="apply"]',
        'a[data-control-name*="apply"]',

        // Specific LinkedIn 2024/2025 selectors (from actual DOM)
        'button[id="jobs-apply-button-id"]', // The main apply button ID
        'button[data-control-name="jobdetails_topcard_primary_apply"]',
        ".jobs-apply-button", // Main apply button class
        ".jobs-apply-button--primary",
        ".jobs-apply-form__button",
        ".artdeco-button--primary", // Primary button style

        // Text-based matching
        'button[aria-label*="Apply"]',
        'a[aria-label*="Apply"]',
        'button:has-text("Apply")',
        'a:has-text("Apply")',

        // Broader button matching
        'button[type="submit"]',
        'input[type="submit"][value*="pply"]',

        // Fallback patterns
        "button.apply",
        "a.apply",
        ".apply-button",
        ".apply-btn",
      ];

      let applyElement = null;
      for (const selector of applySelectors) {
        try {
          applyElement = await page.$(selector);
          if (applyElement) {
            // Check if element is visible
            const isVisible = await page.evaluate((el) => {
              const rect = el.getBoundingClientRect();
              return (
                rect.width > 0 &&
                rect.height > 0 &&
                window.getComputedStyle(el).visibility !== "hidden" &&
                window.getComputedStyle(el).display !== "none"
              );
            }, applyElement);

            if (isVisible) break;
          }
        } catch {
          // Continue to next selector
        }
      }

      // DEBUG: If no apply element found, let's see what's on the page
      if (!applyElement) {
        console.log(
          `🔍 No apply element found with standard selectors. Checking page content...`,
        );
        const pageButtons = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll("button, a"));
          return buttons.slice(0, 10).map((btn) => ({
            tag: btn.tagName,
            text: btn.textContent?.trim().substring(0, 50),
            className: btn.className,
            href: btn.getAttribute("href"),
          }));
        });
        console.log("Available buttons/links:", pageButtons);
      }

      if (applyElement) {
        console.log(
          `🎯 Found apply element! Tag: ${await page.evaluate((el) => el.tagName, applyElement)}`,
        );
        try {
          // First try to extract href directly (for links)
          const href = await page.evaluate((el) => {
            console.log("Apply element details:", {
              tagName: el.tagName,
              href: el.getAttribute("href"),
              dataJobUrl: el.getAttribute("data-job-url"),
              dataApplyUrl: el.getAttribute("data-apply-url"),
              textContent: el.textContent?.trim(),
              className: el.className,
            });
            if (el.tagName === "A") {
              return el.getAttribute("href");
            }
            return (
              el.getAttribute("data-job-url") ||
              el.getAttribute("data-apply-url") ||
              el.getAttribute("href")
            );
          }, applyElement);

          console.log(`🔍 Extracted href: ${href}`);

          if (href) {
            if (href.includes("externalApply") && href.includes("url=")) {
              const urlMatch = href.match(/url=([^&]+)/);
              if (urlMatch) {
                applyUrl = decodeURIComponent(urlMatch[1]);
              }
            } else if (
              href.includes("linkedin.com") === false &&
              href.startsWith("http")
            ) {
              applyUrl = href;
            } else {
              // If href is still LinkedIn or relative, try clicking - ENHANCED APPROACH
              try {
                const currentUrl = page.url();
                console.log(
                  `🔍 Attempting to click apply button to find external URL...`,
                );

                // First, try to scroll the element into view
                await page.evaluate((el) => {
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                }, applyElement);

                // Wait a moment for scroll
                await new Promise((resolve) => setTimeout(resolve, 1000));

                // Try multiple click strategies
                let navigationSucceeded = false;

                // Strategy 1: Regular click
                try {
                  await applyElement.click();
                  await page.waitForNavigation({
                    waitUntil: "networkidle2",
                    timeout: 10000,
                  });
                  navigationSucceeded = true;
                } catch {
                  console.log(
                    `📌 Strategy 1 (regular click) failed, trying strategy 2...`,
                  );
                }

                // Strategy 2: Force click if regular click failed
                if (!navigationSucceeded) {
                  try {
                    await page.evaluate((el: unknown) => {
                      const element = el as HTMLElement;
                      if (element && typeof element.click === "function") {
                        element.click();
                      }
                    }, applyElement);
                    await page.waitForNavigation({
                      waitUntil: "networkidle2",
                      timeout: 10000,
                    });
                    navigationSucceeded = true;
                  } catch {
                    console.log(
                      `📌 Strategy 2 (force click) failed, trying strategy 3...`,
                    );
                  }
                }

                // Strategy 3: Wait for any URL change
                if (!navigationSucceeded) {
                  await page.evaluate((el: unknown) => {
                    const element = el as HTMLElement;
                    if (element && typeof element.click === "function") {
                      element.click();
                    }
                  }, applyElement);
                  // Wait longer and check for URL changes
                  await new Promise((resolve) => setTimeout(resolve, 5000));
                }

                const newUrl = page.url();
                console.log(`🔍 URL after click: ${newUrl}`);

                // Check if we navigated to an external site
                if (newUrl !== currentUrl && !newUrl.includes("linkedin.com")) {
                  applyUrl = newUrl;
                  console.log(
                    `🎉 Successfully extracted external apply URL: ${applyUrl}`,
                  );
                } else if (newUrl !== currentUrl) {
                  console.log(
                    `📌 URL changed but still on LinkedIn: ${newUrl}`,
                  );
                } else {
                  console.log(
                    `📌 No URL change detected - may be LinkedIn internal application`,
                  );
                }
              } catch (clickError) {
                // Clicking failed, keep the extracted href if it's external
                console.warn(`🔍 All click strategies failed:`, clickError);
                if (href.startsWith("http") && !href.includes("linkedin.com")) {
                  applyUrl = href;
                  console.log(`🔄 Fallback: Using extracted href: ${applyUrl}`);
                }
              }
            }
          } else {
            // No href found, try clicking the button
            try {
              const currentUrl = page.url();

              // Click the apply button
              await applyElement.click();

              // Wait for potential navigation (don't assign to unused variable)
              await page
                .waitForNavigation({
                  waitUntil: "networkidle2",
                  timeout: 8000,
                })
                .catch(() => {}); // Ignore timeout

              // Wait a bit for potential navigation
              await new Promise((resolve) => setTimeout(resolve, 2000));

              const newUrl = page.url();

              // If URL changed and we're not on LinkedIn anymore, use it
              if (newUrl !== currentUrl && !newUrl.includes("linkedin.com")) {
                applyUrl = newUrl;
              }
            } catch (clickError) {
              // Clicking failed completely
              console.warn(
                `Clicking apply button (no href) failed:`,
                clickError,
              );
            }
          }
        } catch (elementError) {
          console.warn(`Error interacting with apply element:`, elementError);
        }
      }
    } catch (error) {
      console.warn(`Could not extract apply URL from ${jobUrl}:`, error);
    }

    // Debug apply URL
    if (applyUrl !== jobUrl) {
      console.log(`✅ Found external apply URL: ${applyUrl}`);
    } else {
      console.log(
        `📌 Using LinkedIn apply URL (internal application): ${applyUrl}`,
      );
    }

    // Extract LinkedIn job ID
    const sourceId = extractJobId(jobUrl);
    console.log(`Source ID for ${jobUrl}: ${sourceId || "NOT FOUND"}`);

    // Parse salary information - most jobs don't have salary info publicly (only ~10% do)
    let salaryInfo = parseSalaryInfo(job.salary || "");

    // If no salary found in basic data, try description (but don't expect to find it)
    if (!salaryInfo.min && description) {
      console.log(
        `🔍 Checking description for salary info (rarely available)...`,
      );

      // Look for salary patterns in the full description
      const descSalaryInfo = parseSalaryInfo(description);
      if (descSalaryInfo.min) {
        salaryInfo = descSalaryInfo;
        console.log(
          `✅ Rare find! Salary in description: ${JSON.stringify(salaryInfo)}`,
        );
      } else {
        // Look for specific salary-related patterns in description
        const salaryPatterns = [
          /(\d{1,3}(?:,\d{3})*(?:\.\d+)?(?:k|K)?)\s*(?:-|to|–|and)\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?(?:k|K)?)\s*(?:per year|per annum|p\.?a\.?|salary|pay|compensation)/gi,
          /(?:salary|pay|compensation)[\s\S]*?(\d{1,3}(?:,\d{3})*(?:\.\d+)?(?:k|K)?)\s*(?:-|to|–|and)\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?(?:k|K)?)/gi,
          /[\$€£](\d{1,3}(?:,\d{3})*(?:\.\d+)?(?:k|K)?)\s*(?:-|to|–|and)\s*[\$€£]?(\d{1,3}(?:,\d{3})*(?:\.\d+)?(?:k|K)?)/gi,
        ];

        for (const pattern of salaryPatterns) {
          const match = description.match(pattern);
          if (match) {
            console.log(
              `💰 Found potential salary pattern in description: ${match[0]}`,
            );
            const patternSalaryInfo = parseSalaryInfo(match[0]);
            if (patternSalaryInfo.min) {
              salaryInfo = patternSalaryInfo;
              break;
            }
          }
        }
      }
    }

    // Log final salary status - this is expected to be empty most of the time
    if (salaryInfo.min) {
      console.log(
        `💰 Salary found: ${salaryInfo.currency} ${salaryInfo.min.toLocaleString()} - ${salaryInfo.max?.toLocaleString()}`,
      );
    } else {
      console.log(
        `💰 No salary info available (normal - only ~10% of jobs include salary)`,
      );
    }

    // Check for visa sponsorship and relocation indicators
    const visaSponsorshipIndicators = [
      "visa sponsorship",
      "work visa",
      "h1b",
      "employment visa",
      "sponsor visa",
      "visa support",
      "immigration support",
      "relocation assistance",
      "relocation bonus",
      "moving expenses",
      "relocation package",
      "settling allowance",
      "visa sponsored",
      "visa available",
    ];

    const isSponsored = visaSponsorshipIndicators.some(
      (indicator) =>
        description.toLowerCase().includes(indicator) ||
        job.position.toLowerCase().includes(indicator),
    );

    return {
      ...job,
      city: detailedCity, // Use more detailed city from job page
      description,
      applyUrl,
      sourceId,
      isSponsored,
      salaryMin: salaryInfo.min,
      salaryMax: salaryInfo.max,
      currency: salaryInfo.currency,
    };
  } catch (error) {
    console.error(`❌ Error extracting details from ${jobUrl}:`, error);
    return {
      ...job,
      description: "",
      applyUrl: jobUrl,
      isSponsored: false,
    };
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (error) {
        console.warn("Error closing page:", error);
      }
    }
  }
}

// Process jobs with Puppeteer detail extraction
async function processJobsWithDetails(
  jobs: LinkedInJob[],
): Promise<LinkedInJob[]> {
  const results: LinkedInJob[] = [];
  const maxConcurrent = 2; // Conservative concurrent requests

  console.log(
    `🔍 Extracting details for ${jobs.length} jobs using Puppeteer...`,
  );

  for (let i = 0; i < jobs.length; i += maxConcurrent) {
    const batch = jobs.slice(i, i + maxConcurrent);
    const batchPromises = batch.map((job) =>
      extractJobDetails(job.jobUrl, job),
    );

    try {
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      console.log(`📄 Processed ${results.length}/${jobs.length} jobs`);

      // Delay between batches
      if (i + maxConcurrent < jobs.length) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.error("Error processing batch:", error);
    }
  }

  // Close browser when done
  try {
    await closeBrowser();
  } catch (error) {
    console.warn("Error closing browser:", error);
  }

  return results;
}

export async function query(queryObject: QueryOptions): Promise<LinkedInJob[]> {
  const allJobs: LinkedInJob[] = [];
  let start = 0;
  const BATCH_SIZE = 25;
  const limit = queryObject.limit || 25;

  console.log("🔍 Scraping LinkedIn jobs...", { queryObject });

  while (allJobs.length < limit) {
    try {
      // Wait for rate limiter before making request
      await rateLimiter.waitForNextRequest();

      // Use LinkedIn's guest API with advanced URL building (matching reference implementation)
      const url = buildLinkedInUrl(queryObject, start);

      console.log(`Fetching batch ${start / BATCH_SIZE + 1}...`);

      const response = await axios.get(url, {
        headers: {
          "User-Agent": getRandomUserAgent(),
          Accept: "application/json, text/javascript, */*; q=0.01",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          Referer: "https://www.linkedin.com/jobs",
          "X-Requested-With": "XMLHttpRequest",
          Connection: "keep-alive",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        timeout: 15000, // Increased timeout for rate limiting
        validateStatus: function (status) {
          return status === 200;
        },
      });

      // Record successful request
      rateLimiter.recordRequest();
      rateLimiter.recordSuccess();

      const $ = cheerio.load(response.data);
      const jobElements = $("li");

      if (jobElements.length === 0) {
        console.log("No more jobs found");
        break;
      }

      jobElements.each((index, element) => {
        if (allJobs.length >= limit) return false; // Break out of each loop

        try {
          const job = $(element);
          const position = job.find(".base-search-card__title").text().trim();
          const company = job.find(".base-search-card__subtitle").text().trim();
          const city = job.find(".job-search-card__location").text().trim();
          const dateElement = job.find("time");
          const date = dateElement.attr("datetime") || "";
          const salary = job
            .find(".job-search-card__salary-info")
            .text()
            .trim()
            .replace(/\s+/g, " ");
          const jobUrl = job.find(".base-card__full-link").attr("href") || "";
          const companyLogo =
            job.find(".artdeco-entity-image").attr("data-delayed-url") || "";
          const agoTime = job.find(".job-search-card__listdate").text().trim();

          // Clean and validate the data
          if (position && company) {
            // Check if job is remote by looking for remote indicators in title and city
            const isRemote =
              /\b(remote|work from home|wfh|telecommute)\b/i.test(position) ||
              /\b(remote|work from home|wfh|telecommute)\b/i.test(city) ||
              city.toLowerCase() === "remote";

            // Clean the position title - remove "at company name" and extra info
            const cleanPosition = position
              .replace(/\s+at\s+.*$/i, "") // Remove "at Company Name"
              .replace(/\s*\([^)]*\)\s*$/, "") // Remove trailing parentheses like "(Remote)" or "(2 Openings)"
              .replace(/\s*\([^)]*at[^)]*\)\s*$/i, "") // Remove "at company" in parentheses
              .trim();

            // Parse city to extract just the city name
            let cleanCity = city;
            if (city && city !== "Remote") {
              // Split by comma and take first part (usually the city)
              const cityParts = city.split(",");
              cleanCity = cityParts[0]?.trim() || city;

              // Handle common cases
              if (
                cleanCity.toLowerCase().includes("remote") ||
                cleanCity.toLowerCase().includes("hybrid")
              ) {
                cleanCity = city; // Keep full city for remote/hybrid
              }
            }

            // Removed keyword pre-filtering - let AI handle tech job validation
            // All jobs now go through AI analysis in processing-pipeline.ts
            allJobs.push({
              position: cleanPosition,
              company,
              city: cleanCity,
              date,
              salary: salary || "Not specified",
              jobUrl,
              companyLogo,
              agoTime,
              remote: isRemote,
            });
          }
        } catch (error) {
          // Skip malformed job entries
          console.warn("Skipping malformed job entry:", error);
        }
      });

      console.log(
        `Found ${jobElements.length} jobs in this batch, total so far: ${allJobs.length}`,
      );

      start += BATCH_SIZE;

      // No need for manual delay - rate limiter handles this
    } catch (error) {
      // Record the error for rate limiting backoff
      rateLimiter.recordError();

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Error fetching batch:", errorMessage);

      // Handle specific HTTP status codes (matching reference implementation)
      if (axios.isAxiosError(error) && error.response?.status) {
        if (error.response.status === 429) {
          console.log("🚫 Rate limit reached");
          throw new Error("Rate limit reached");
        } else if (error.response.status === 403) {
          console.log(
            "🚫 Access forbidden (403). LinkedIn may have blocked this IP.",
          );
          break; // Stop scraping
        } else if (error.response.status >= 500) {
          console.log("🔄 Server error. Will retry with backoff...");
          continue; // Try again after backoff
        }
      }

      // For network errors or other issues, try once more with backoff
      if (rateLimiter.getConsecutiveErrors() <= 2) {
        console.log("🔄 Network error. Retrying with backoff...");
        continue;
      }

      console.log("❌ Too many consecutive errors. Stopping scrape.");
      break; // Stop on persistent errors
    }
  }

  console.log(`✅ Found ${allJobs.length} basic jobs from LinkedIn.`);

  // Extract detailed information using Puppeteer
  const detailedJobs = await processJobsWithDetails(allJobs.slice(0, limit));

  console.log(
    `✅ Completed detailed extraction for ${detailedJobs.length} jobs.`,
  );
  return detailedJobs;
}
