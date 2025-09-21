# africatechjobs.com

A comprehensive job board platform that scrapes and aggregates tech job listings from across Africa, providing developers and tech professionals with access to the latest opportunities.

## 🚀 Recent Improvements

### ✅ Production-Ready Architecture

- **Complete Database Mapping**: All jobs table fields properly populated (salary_min, salary_max, currency, source_id, is_sponsored, etc.)
- **Puppeteer Integration**: Extracts actual apply URLs and full job descriptions from LinkedIn job pages
- **AI-Powered Analysis**: Determines sponsored jobs and validates tech content using AI
- **Rate Limiting Protection**: Advanced rate limiter with exponential backoff for LinkedIn API requests
- **Configurable AI Models**: Support for Gemini, OpenAI, and Anthropic with environment variable selection
- **Robust Error Handling**: Comprehensive error recovery for network issues, HTTP errors, and rate limiting
- **Clean Architecture**: Removed duplicate code and streamlined the scraping pipeline

### 🏗️ System Architecture

```
Daily Schedule (1 AM UTC)
    ↓ triggers batches of
Category Scrapers (Trigger.dev tasks)
    ↓ calls LinkedIn API scraper
Basic Job Extraction (title, company, location, LinkedIn URL)
    ↓ uses Puppeteer to visit each job page
Detailed Job Extraction (description, apply URL, salary parsing)
    ↓ AI analysis (tech validation + visa sponsorship detection)
AI Pipeline (configurable models - Gemini/OpenAI/Anthropic)
    ↓ complete database mapping
Supabase Database (all fields populated: salary_min/max, currency, source_id, visa_sponsorship, etc.)
```

## 🔧 Configuration

### Environment Variables

```bash
# AI Model Selection (choose one)
AI_MODEL=gemini          # Default: gemini (Google AI)
# AI_MODEL=openai        # Alternative: openai
# AI_MODEL=anthropic     # Alternative: anthropic

# API Keys (configure based on your AI_MODEL choice)
GOOGLE_API_KEY=your_google_ai_api_key      # Required for gemini (default)
OPENAI_API_KEY=your_openai_api_key          # Required for openai
ANTHROPIC_API_KEY=your_anthropic_api_key    # Required for anthropic

# Scraping Configuration
SCRAPE_COUNTRY=Nigeria   # Optional: filter to specific country
SCRAPE_TEST=true         # Optional: test mode with limited categories
```

### AI Provider Configuration

**Google AI (Default - Recommended):**

```bash
AI_MODEL=gemini
GOOGLE_API_KEY=your_actual_google_ai_api_key
```

**OpenAI:**

```bash
AI_MODEL=openai
OPENAI_API_KEY=your_actual_openai_api_key
```

**Anthropic:**

```bash
AI_MODEL=anthropic
ANTHROPIC_API_KEY=your_actual_anthropic_api_key
```

**Fallback Behavior:**

- **Automatic Fallback Chain**: Gemini → OpenAI → Anthropic → Basic validation
- Tests each API key validity before using it
- If all AI models fail, uses basic validation without AI
- **Note**: If you see 403 Forbidden errors, your API key may be invalid/expired

### Rate Limiting Features

- **Per-Minute Limit**: 30 requests/minute
- **Per-Hour Limit**: 200 requests/hour
- **Exponential Backoff**: Automatic delay increase on errors
- **HTTP Error Handling**: Specific handling for 429, 403, 5xx errors
- **Network Resilience**: Automatic retry with backoff for transient failures

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run linting
pnpm lint

# Type checking
pnpm type-check

# Test AI providers
node -e "
import('./src/lib/ai/client.ts').then(({ testAIModels }) => {
  testAIModels('Software Engineer', 'Google', 'San Francisco');
});
"

# Test LinkedIn scraper with Puppeteer
npx tsx test-scraper.ts

# Test complete job processing pipeline
npx tsx test-pipeline.ts

# Production scraper for all African countries (full system)
npx tsx src/lib/jobs/scripts/scrape-africa-jobs.ts

# Test production scraper (limited categories)
SCRAPE_TEST=true npx tsx src/lib/jobs/scripts/scrape-africa-jobs.ts

# Test with specific country only
SCRAPE_COUNTRY=Nigeria npx tsx src/lib/jobs/scripts/scrape-africa-jobs.ts

# Combined test mode
SCRAPE_TEST=true SCRAPE_COUNTRY=Nigeria npx tsx src/lib/jobs/scripts/scrape-africa-jobs.ts

# Quick pipeline test with sample data
node -e "
import('./src/lib/jobs/processing-pipeline.ts').then(async ({ JobProcessingPipeline }) => {
  const pipeline = new JobProcessingPipeline();
  const testJob = {
    position: 'Senior Software Engineer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    date: '2024-01-15',
    salary: '\$120,000 - \$160,000',
    jobUrl: 'https://linkedin.com/jobs/view/123456789',
    description: 'We are looking for a Senior Software Engineer to join our team. This role offers visa sponsorship and relocation assistance.',
    sourceId: '123456789',
    isSponsored: true,
    salaryMin: 120000,
    salaryMax: 160000,
    currency: 'USD',
    applyUrl: 'https://techcorp.com/careers/apply/123'
  };
  const result = await pipeline.processIncomingJob(testJob, 'LinkedIn-Test');
  console.log('Result:', result.status === 'success' ? '✅ Success' : '❌ Failed');
});
"
```

## 📊 Key Features

- ✅ **Complete Database Population**: All jobs table fields properly filled (source_id, is_sponsored, description, etc.)
- ✅ **Puppeteer Job Detail Extraction**: Extracts actual apply URLs and full job descriptions from LinkedIn pages
- ✅ **AI-Powered Visa Sponsorship Detection**: Identifies jobs offering visa sponsorship and relocation benefits
- ✅ **Smart Salary Handling**: Gracefully handles cases where salary isn't publicly available (~90% of jobs)
- ✅ **AI-Powered Tech Job Validation**: Eliminates non-tech job spam (with fallback for API failures)
- ✅ **Intelligent AI Fallback Chain**: Gemini → OpenAI → Anthropic → Basic validation
- ✅ **Multi-Model AI Support**: Gemini, OpenAI, Anthropic with environment configuration
- ✅ **Rate Limiting Protection**: Prevents LinkedIn blocking with exponential backoff
- ✅ **Duplicate Detection**: Prevents job spam in database
- ✅ **Scalable Architecture**: Trigger.dev background processing
- ✅ **Real-time Notifications**: Job alert system
- ✅ **Quality Scoring**: AI-powered job quality assessment
- ✅ **Robust Error Handling**: System continues working even when AI APIs fail

## 💰 Salary Data Reality

**Important**: Only ~10% of job postings include salary information publicly on LinkedIn or company career pages. Our system:

- ✅ **Tries to extract salary** when available using advanced parsing
- ✅ **Gracefully handles missing salary** without errors or failures
- ✅ **Saves jobs to database** even without salary information
- ✅ **Logs appropriately** when salary data isn't found (this is normal)
