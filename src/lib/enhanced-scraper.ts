import puppeteer from 'puppeteer'
import * as cheerio from 'cheerio'
import axios from 'axios'
import axiosRetry from 'axios-retry'
import { supabase } from './supabase'
import { redis } from '@africatechjobs/kv/redis'
import type { ScrapedJob } from './scraper'

// Configure axios retry
axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
           error.response?.status === 429 ||
           (error.response?.status ?? 0) >= 500
  },
})

export interface EnhancedScrapedJob extends ScrapedJob {
  fundingStage?: string
  companySize?: string
  benefits?: string[]
  requirements?: string[]
  applicationDeadline?: Date
}

export class EnhancedJobScraper {
  private browser: any = null
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ]

  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    })
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
    }
  }

  private async createStealthPage() {
    const page = await this.browser.newPage()
    await page.setUserAgent(this.userAgents[Math.floor(Math.random() * this.userAgents.length)])

    // Set viewport
    await page.setViewport({ width: 1366, height: 768 })

    // Block unnecessary resources
    await page.setRequestInterception(true)
    page.on('request', (req) => {
      const resourceType = req.resourceType()
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        req.abort()
      } else {
        req.continue()
      }
    })

    return page
  }

  async scrapeLinkedInAfrica(searchTerm: string = 'technology'): Promise<EnhancedScrapedJob[]> {
    const jobs: EnhancedScrapedJob[] = []

    try {
      const page = await this.createStealthPage()

      const africanCountries = [
        { code: 'nigeria', name: 'NIGERIA' },
        { code: 'kenya', name: 'KENYA' },
        { code: 'south+africa', name: 'SOUTH AFRICA' },
        { code: 'ghana', name: 'GHANA' },
        { code: 'uganda', name: 'UGANDA' }
      ]

      for (const country of africanCountries) {
        try {
          const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${searchTerm}&location=${country.code}&f_TPR=r604800&sortBy=DD`

          console.log(`Scraping LinkedIn for ${country.name}...`)
          await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 })

          // Wait for job cards to load
          await page.waitForSelector('.job-search-card', { timeout: 10000 })

          // Scroll to load more jobs
          await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight)
          })
          await page.waitForTimeout(2000)

          const jobElements = await page.$$('.job-search-card')
          console.log(`Found ${jobElements.length} job cards for ${country.name}`)

          for (let i = 0; i < Math.min(jobElements.length, 8); i++) {
            try {
              const element = jobElements[i]
              const jobData = await element.evaluate((el) => {
                const title = el.querySelector('.job-search-card__title')?.textContent?.trim()
                const company = el.querySelector('.job-search-card__company-name')?.textContent?.trim()
                const location = el.querySelector('.job-search-card__location')?.textContent?.trim()
                const link = el.querySelector('a')?.href
                const postedTime = el.querySelector('.job-search-card__listdate')?.textContent?.trim()
                const salary = el.querySelector('.job-search-card__salary-info')?.textContent?.trim()

                return { title, company, location, link, postedTime, salary }
              })

              if (jobData.title && jobData.company && jobData.link) {
                // Check if job already exists in cache
                const jobKey = `job:${jobData.link}`
                const exists = await redis.exists(jobKey)

                if (!exists) {
                  const job: EnhancedScrapedJob = {
                    title: jobData.title,
                    description: `Job opportunity at ${jobData.company}`,
                    companyName: jobData.company,
                    location: jobData.location || country.name,
                    country: country.name,
                    type: 'FULL_TIME',
                    experienceLevel: 'MID_LEVEL',
                    salary: jobData.salary,
                    currency: 'USD',
                    remote: jobData.location?.toLowerCase().includes('remote') || false,
                    url: jobData.link,
                    source: 'LinkedIn',
                    sourceId: jobData.link.split('/').pop(),
                    postedAt: new Date(),
                    skills: ['Technology'],
                    category: 'Technology'
                  }

                  jobs.push(job)

                  // Cache job for 24 hours
                  await redis.setex(jobKey, 86400, '1')
                }
              }
            } catch (error) {
              console.error(`Error scraping job card ${i}:`, error)
            }
          }
        } catch (error) {
          console.error(`Error scraping LinkedIn for ${country.name}:`, error)
        }

        // Add delay between countries to avoid rate limiting
        await page.waitForTimeout(2000)
      }

      await page.close()
    } catch (error) {
      console.error('Error in LinkedIn scraper:', error)
    }

    return jobs
  }

  async scrapeRemoteCoAfrica(): Promise<EnhancedScrapedJob[]> {
    const jobs: EnhancedScrapedJob[] = []

    try {
      console.log('Scraping Remote.co Africa...')

      const response = await axios.get('https://remote.co/remote-jobs/africa/', {
        headers: {
          'User-Agent': this.userAgents[Math.floor(Math.random() * this.userAgents.length)],
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 30000
      })

      const $ = cheerio.load(response.data)
      const jobCards = $('.job-listing-item')

      console.log(`Found ${jobCards.length} job cards on Remote.co`)

      jobCards.each((index, element) => {
        if (index >= 15) return false // Limit to 15 jobs

        const $el = $(element)
        const title = $el.find('.job-listing-title').text().trim()
        const company = $el.find('.job-listing-company').text().trim()
        const location = $el.find('.job-listing-location').text().trim()
        const url = $el.find('a').attr('href')
        const salary = $el.find('.job-listing-salary').text().trim()

        if (title && company && url) {
          // Extract country from location
          const country = this.extractCountryFromLocation(location)

          const job: EnhancedScrapedJob = {
            title,
            description: 'Remote work opportunity in Africa',
            companyName: company,
            location: location || 'Remote',
            country: country || 'AFRICA',
            type: 'FULL_TIME',
            experienceLevel: 'MID_LEVEL',
            salary,
            currency: 'USD',
            remote: true,
            url: url.startsWith('http') ? url : `https://remote.co${url}`,
            source: 'Remote.co',
            postedAt: new Date(),
            skills: ['Remote Work'],
            category: 'Technology'
          }

          jobs.push(job)
        }
      })
    } catch (error) {
      console.error('Error scraping Remote.co:', error)
    }

    return jobs
  }

  async scrapeIndeedAfrica(): Promise<EnhancedScrapedJob[]> {
    const jobs: EnhancedScrapedJob[] = []

    try {
      console.log('Scraping Indeed Africa...')

      const africanDomains = [
        { domain: '.co.za', country: 'SOUTH AFRICA' },
        { domain: '.com.ng', country: 'NIGERIA' },
        { domain: '.co.ke', country: 'KENYA' },
        { domain: '.com.gh', country: 'GHANA' }
      ]

      for (const { domain, country } of africanDomains.slice(0, 2)) { // Limit to 2 domains
        try {
          const searchUrl = `https://indeed${domain}/jobs?q=software+developer&fromage=7`

          console.log(`Scraping Indeed ${domain}...`)

          const response = await axios.get(searchUrl, {
            headers: {
              'User-Agent': this.userAgents[Math.floor(Math.random() * this.userAgents.length)],
            },
            timeout: 30000
          })

          const $ = cheerio.load(response.data)
          const jobCards = $('.job_seen_beacon')

          console.log(`Found ${jobCards.length} job cards on Indeed ${domain}`)

          jobCards.each((index, element) => {
            if (index >= 8) return false // 8 jobs per domain

            const $el = $(element)
            const title = $el.find('.jobTitle').text().trim()
            const company = $el.find('.companyName').text().trim()
            const location = $el.find('.companyLocation').text().trim()
            const url = $el.find('.jcs-JobTitle').attr('href')
            const salary = $el.find('.salary-snippet').text().trim()

            if (title && company && url) {
              const job: EnhancedScrapedJob = {
                title,
                description: 'Software development position',
                companyName: company,
                location: location || 'Various',
                country,
                type: 'FULL_TIME',
                experienceLevel: 'MID_LEVEL',
                salary,
                currency: 'USD',
                remote: false,
                url: url.startsWith('http') ? url : `https://indeed${domain}${url}`,
                source: 'Indeed',
                postedAt: new Date(),
                skills: ['Software Development'],
                category: 'Technology'
              }

              jobs.push(job)
            }
          })
        } catch (error) {
          console.error(`Error scraping Indeed ${domain}:`, error)
        }

        // Add delay between domains
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    } catch (error) {
      console.error('Error in Indeed scraper:', error)
    }

    return jobs
  }

  private extractCountryFromLocation(location: string): string | null {
    const locationLower = location.toLowerCase()

    const countryMap: Record<string, string> = {
      'nigeria': 'NIGERIA',
      'kenya': 'KENYA',
      'south africa': 'SOUTH AFRICA',
      'ghana': 'GHANA',
      'uganda': 'UGANDA',
      'tanzania': 'TANZANIA',
      'rwanda': 'RWANDA',
      'ethiopia': 'ETHIOPIA',
      'egypt': 'EGYPT',
      'morocco': 'MOROCCO'
    }

    for (const [key, value] of Object.entries(countryMap)) {
      if (locationLower.includes(key)) {
        return value
      }
    }

    return null
  }

  async scrapeAllSources(): Promise<{
    jobs: EnhancedScrapedJob[],
    stats: {
      linkedin: { found: number; added: number };
      remoteCo: { found: number; added: number };
      indeed: { found: number; added: number };
      totalJobsFound: number;
      totalJobsAdded: number;
    }
  }> {
    const allJobs: EnhancedScrapedJob[] = []
    const stats = {
      linkedin: { found: 0, added: 0 },
      remoteCo: { found: 0, added: 0 },
      indeed: { found: 0, added: 0 },
      totalJobsFound: 0,
      totalJobsAdded: 0
    }

    try {
      console.log('Starting comprehensive job scraping...')

      // Scrape LinkedIn
      console.log('🔍 Scraping LinkedIn Africa...')
      const linkedinJobs = await this.scrapeLinkedInAfrica()
      stats.linkedin.found = linkedinJobs.length
      allJobs.push(...linkedinJobs)

      // Scrape Remote.co
      console.log('🔍 Scraping Remote.co Africa...')
      const remoteCoJobs = await this.scrapeRemoteCoAfrica()
      stats.remoteCo.found = remoteCoJobs.length
      allJobs.push(...remoteCoJobs)

      // Scrape Indeed
      console.log('🔍 Scraping Indeed Africa...')
      const indeedJobs = await this.scrapeIndeedAfrica()
      stats.indeed.found = indeedJobs.length
      allJobs.push(...indeedJobs)

      stats.totalJobsFound = allJobs.length

      // Save to database with deduplication
      console.log(`💾 Saving ${allJobs.length} jobs to database...`)

      for (const job of allJobs) {
        try {
          // Check if job already exists
          const { data: existingJob } = await supabase
            .from('jobs')
            .select('id')
            .eq('url', job.url)
            .single()

          if (!existingJob) {
            const { data, error } = await supabase
              .from('jobs')
              .insert({
                title: job.title,
                description: job.description,
                company_name: job.companyName,
                location: job.location,
                country: job.country,
                type: job.type,
                experience_level: job.experienceLevel,
                salary: job.salary,
                salary_min: job.salaryMin,
                salary_max: job.salaryMax,
                currency: job.currency,
                remote: job.remote,
                url: job.url,
                source: job.source,
                source_id: job.sourceId,
                posted_at: job.postedAt.toISOString(),
                deadline: job.deadline?.toISOString(),
                skills: job.skills,
                category: job.category,
                is_active: true
              })
              .select()
              .single()

            if (!error && data) {
              stats.totalJobsAdded++

              // Update source-specific stats
              if (job.source === 'LinkedIn') stats.linkedin.added++
              else if (job.source === 'Remote.co') stats.remoteCo.added++
              else if (job.source === 'Indeed') stats.indeed.added++

              console.log(`✅ Added job: ${job.title} at ${job.companyName}`)
            }
          } else {
            console.log(`⏭️  Skipped duplicate job: ${job.title}`)
          }
        } catch (error) {
          console.error('❌ Error saving job to database:', error)
        }
      }

      console.log(`🎉 Scraping completed! Found: ${stats.totalJobsFound}, Added: ${stats.totalJobsAdded}`)
      return { jobs: allJobs, stats }
    } catch (error) {
      console.error('❌ Error in comprehensive scraper:', error)
      throw error
    }
  }
}

export const enhancedScraper = new EnhancedJobScraper()
