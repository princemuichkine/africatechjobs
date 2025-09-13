import { NextRequest, NextResponse } from 'next/server'
import { jobScraper } from '@/lib/scraper'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Start scraping
    await jobScraper.init()

    const scrapeLogId = crypto.randomUUID()

    // Create scrape log entry
    const { error: logError } = await supabase
      .from('scrape_logs')
      .insert({
        id: scrapeLogId,
        source: 'All Sources',
        status: 'SUCCESS',
        jobs_found: 0,
        jobs_added: 0
      })

    if (logError) {
      console.error('Error creating scrape log:', logError)
    }

    // Perform scraping
    const { jobs, stats } = await jobScraper.scrapeAllSources()

    // Update scrape log
    const totalJobsFound = stats.linkedin.found + stats.remoteCo.found + stats.indeed.found
    const totalJobsAdded = stats.linkedin.added + stats.remoteCo.added + stats.indeed.added

    await supabase
      .from('scrape_logs')
      .update({
        jobs_found: totalJobsFound,
        jobs_added: totalJobsAdded,
        completed_at: new Date().toISOString()
      })
      .eq('id', scrapeLogId)

    await jobScraper.close()

    return NextResponse.json({
      success: true,
      message: 'Scraping completed successfully',
      stats: {
        totalJobsFound,
        totalJobsAdded,
        sources: stats
      },
      scrapeLogId
    })
  } catch (error) {
    console.error('Error in scrape API:', error)

    // Update scrape log with error
    if (request.body) {
      const body = await request.json().catch(() => ({}))
      if (body.scrapeLogId) {
        await supabase
          .from('scrape_logs')
          .update({
            status: 'FAILED',
            error: error instanceof Error ? error.message : 'Unknown error',
            completed_at: new Date().toISOString()
          })
          .eq('id', body.scrapeLogId)
      }
    }

    await jobScraper.close()

    return NextResponse.json(
      { error: 'Scraping failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { data: logs, error } = await supabase
      .from('scrape_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching scrape logs:', error)
      return NextResponse.json({ error: 'Failed to fetch scrape logs' }, { status: 500 })
    }

    return NextResponse.json({ logs: logs || [] })
  } catch (error) {
    console.error('Error in scrape logs API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
