import puppeteer from 'puppeteer'
import * as cheerio from 'cheerio'
import axios from 'axios'
import { supabase } from './supabase'
import { enhancedScraper } from './enhanced-scraper'

export interface ScrapedJob {
  title: string
  description: string
  companyName: string
  location: string
  country: string
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE' | 'INTERNSHIP' | 'APPRENTICESHIP'
  experienceLevel: 'ENTRY_LEVEL' | 'JUNIOR' | 'MID_LEVEL' | 'SENIOR' | 'LEAD' | 'EXECUTIVE'
  salary?: string
  salaryMin?: number
  salaryMax?: number
  currency: string
  remote: boolean
  url: string
  source: string
  sourceId?: string
  postedAt: Date
  deadline?: Date
  skills: string[]
  category: string
}

export class JobScraper {
  private browser: any = null

  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
    }
  }

  async scrapeLinkedInAfrica(searchTerm: string = 'technology'): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = []

    try {
      const page = await this.browser.newPage()
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')

      // Search for tech jobs in African countries
      const africanCountries = ['nigeria', 'kenya', 'south+africa', 'ghana', 'uganda', 'tanzania', 'rwanda', 'ethiopia', 'egypt', 'morocco']

      for (const country of africanCountries.slice(0, 3)) { // Limit to first 3 countries for demo
        const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${searchTerm}&location=${country}&f_TPR=r604800` // Last 7 days

        try {
          await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 })
          await page.waitForTimeout(2000)

          // Scroll to load more jobs
          await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight)
          })
          await page.waitForTimeout(1000)

          const jobCards = await page.$$('.job-search-card')

          for (const card of jobCards.slice(0, 5)) { // Limit to 5 jobs per country
            try {
              const jobData = await card.evaluate((el) => {
                const title = el.querySelector('.job-search-card__title')?.textContent?.trim()
                const company = el.querySelector('.job-search-card__company-name')?.textContent?.trim()
                const location = el.querySelector('.job-search-card__location')?.textContent?.trim()
                const link = el.querySelector('a')?.href
                const postedTime = el.querySelector('.job-search-card__listdate')?.textContent?.trim()

                return { title, company, location, link, postedTime }
              })

              if (jobData.title && jobData.company && jobData.link) {
                const job: ScrapedJob = {
                  title: jobData.title,
                  description: 'Description will be fetched from job details page',
                  companyName: jobData.company,
                  location: jobData.location || country,
                  country: country.replace('+', ' ').toUpperCase(),
                  type: 'FULL_TIME',
                  experienceLevel: 'MID_LEVEL',
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
              }
            } catch (error) {
              console.error('Error scraping job card:', error)
            }
          }
        } catch (error) {
          console.error(`Error scraping LinkedIn for ${country}:`, error)
        }
      }

      await page.close()
    } catch (error) {
      console.error('Error in LinkedIn scraper:', error)
    }

    return jobs
  }

  async scrapeRemoteCoAfrica(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = []

    try {
      const response = await axios.get('https://remote.co/remote-jobs/africa/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      const $ = cheerio.load(response.data)
      const jobCards = $('.job-listing-item')

      jobCards.each((index, element) => {
        if (index >= 10) return false // Limit to 10 jobs

        const $el = $(element)
        const title = $el.find('.job-listing-title').text().trim()
        const company = $el.find('.job-listing-company').text().trim()
        const location = $el.find('.job-listing-location').text().trim()
        const url = $el.find('a').attr('href')
        const salary = $el.find('.job-listing-salary').text().trim()

        if (title && company && url) {
          const job: ScrapedJob = {
            title,
            description: 'Description available on Remote.co',
            companyName: company,
            location: location || 'Remote',
            country: 'AFRICA',
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

  async scrapeIndeedAfrica(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = []

    try {
      const africanDomains = ['.co.za', '.com.ng', '.co.ke', '.com.gh']

      for (const domain of africanDomains.slice(0, 2)) { // Limit to 2 domains
        const searchUrl = `https://indeed${domain}/jobs?q=software+developer&fromage=7` // Last 7 days

        try {
          const response = await axios.get(searchUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          })

          const $ = cheerio.load(response.data)
          const jobCards = $('.job_seen_beacon')

          jobCards.each((index, element) => {
            if (index >= 5) return false // 5 jobs per domain

            const $el = $(element)
            const title = $el.find('.jobTitle').text().trim()
            const company = $el.find('.companyName').text().trim()
            const location = $el.find('.companyLocation').text().trim()
            const url = $el.find('.jcs-JobTitle').attr('href')
            const salary = $el.find('.salary-snippet').text().trim()

            if (title && company && url) {
              const country = domain === '.co.za' ? 'SOUTH AFRICA' :
                             domain === '.com.ng' ? 'NIGERIA' :
                             domain === '.co.ke' ? 'KENYA' : 'GHANA'

              const job: ScrapedJob = {
                title,
                description: 'Description available on Indeed',
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
      }
    } catch (error) {
      console.error('Error in Indeed scraper:', error)
    }

    return jobs
  }

  async scrapeAllSources(): Promise<{ jobs: ScrapedJob[], stats: any }> {
    try {
      // Use the enhanced scraper for better results
      await enhancedScraper.init()

      const result = await enhancedScraper.scrapeAllSources()

      await enhancedScraper.close()

      // Convert enhanced jobs back to basic format for compatibility
      const basicJobs: ScrapedJob[] = result.jobs.map(job => ({
        title: job.title,
        description: job.description,
        companyName: job.companyName,
        location: job.location,
        country: job.country,
        type: job.type,
        experienceLevel: job.experienceLevel,
        salary: job.salary,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        currency: job.currency,
        remote: job.remote,
        url: job.url,
        source: job.source,
        sourceId: job.sourceId,
        postedAt: job.postedAt,
        deadline: job.deadline,
        skills: job.skills,
        category: job.category
      }))

      return {
        jobs: basicJobs,
        stats: {
          ...result.stats,
          linkedin: result.stats.linkedin,
          remoteCo: result.stats.remoteCo,
          indeed: result.stats.indeed
        }
      }
    } catch (error) {
      console.error('Error in enhanced scrapeAllSources:', error)
      throw error
    }
  }
}

export const jobScraper = new JobScraper()
