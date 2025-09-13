'use client'

import { useState } from 'react'
import { Job, JobFilters } from '@/types/job'
import { JobList } from '@/components/job-list'
import { JobFiltersComponent } from '@/components/job-filters'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw, Globe, TrendingUp, Users, Building } from 'lucide-react'

export default function Home() {
  const [filters, setFilters] = useState<JobFilters>({})
  const [refreshing, setRefreshing] = useState(false)

  const handleFiltersChange = (newFilters: JobFilters) => {
    setFilters(newFilters)
  }

  const handleResetFilters = () => {
    setFilters({})
  }

  const handleScrapeJobs = async () => {
    try {
      setRefreshing(true)
      const response = await fetch('/api/scrape', { method: 'POST' })
      const data = await response.json()

      if (response.ok) {
        // Refresh the job list
        window.location.reload()
      } else {
        console.error('Scraping failed:', data.error)
      }
    } catch (error) {
      console.error('Error triggering scrape:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleJobClick = (job: Job) => {
    window.open(job.url, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                AfricaTech Jobs
              </h1>
              <p className="text-gray-600 mt-1">
                Discover the latest tech jobs across Africa
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                20+ Countries
              </Badge>
              <Button
                onClick={handleScrapeJobs}
                disabled={refreshing}
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Updating...' : 'Update Jobs'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <JobFiltersComponent
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onReset={handleResetFilters}
              />

              {/* Stats Card */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Platform Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Active Jobs
                    </span>
                    <span className="font-semibold">Loading...</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Companies
                    </span>
                    <span className="font-semibold">Loading...</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Countries
                    </span>
                    <span className="font-semibold">20+</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Job Listings */}
          <div className="lg:col-span-3">
            <JobList
              filters={filters}
              onJobClick={handleJobClick}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              © 2024 AfricaTech Jobs. Connecting African tech talent with opportunities.
            </p>
            <p className="text-sm">
              Data sourced from LinkedIn, Indeed, Remote.co and other job platforms.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
