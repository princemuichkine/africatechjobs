#!/usr/bin/env node

/**
 * Simple cron job scheduler for job scraping
 * Run with: node scripts/schedule-scraping.js
 */

const https = require('https')

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

function scrapeJobs() {
    console.log(`[${new Date().toISOString()}] Starting scheduled job scraping...`)

    const options = {
        hostname: BASE_URL.replace('http://', '').replace('https://', ''),
        port: BASE_URL.startsWith('https') ? 443 : 80,
        path: '/api/scrape',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'AfricaTechJobs-Scheduler/1.0'
        }
    }

    const req = https.request(options, (res) => {
        let data = ''

        res.on('data', (chunk) => {
            data += chunk
        })

        res.on('end', () => {
            try {
                const response = JSON.parse(data)
                console.log(`[${new Date().toISOString()}] Scraping completed:`, response)
            } catch (error) {
                console.error(`[${new Date().toISOString()}] Error parsing response:`, error.message)
            }
        })
    })

    req.on('error', (error) => {
        console.error(`[${new Date().toISOString()}] Scraping failed:`, error.message)
    })

    req.end()
}

// Run immediately
scrapeJobs()

// Schedule to run every 6 hours
setInterval(scrapeJobs, 6 * 60 * 60 * 1000)

console.log(`[${new Date().toISOString()}] Scheduler started. Will scrape every 6 hours.`)

// Graceful shutdown
process.on('SIGINT', () => {
    console.log(`[${new Date().toISOString()}] Scheduler stopped.`)
    process.exit(0)
})
