'use client'

import { useState } from 'react'
import { JobFilters, JOB_TYPES, EXPERIENCE_LEVELS, AFRICAN_COUNTRIES } from '@/types/job'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface JobFiltersProps {
  filters: JobFilters
  onFiltersChange: (filters: JobFilters) => void
  onReset: () => void
}

export function JobFiltersComponent({ filters, onFiltersChange, onReset }: JobFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateFilter = (key: keyof JobFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilter = (key: keyof JobFilters) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    onFiltersChange(newFilters)
  }

  const activeFiltersCount = Object.values(filters).filter(value =>
    value !== undefined && value !== '' && value !== null
  ).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button onClick={onReset} variant="ghost" size="sm">
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search Jobs</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search by title, company, or keywords..."
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select
              value={filters.country || ''}
              onValueChange={(value) => updateFilter('country', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Countries</SelectItem>
                {AFRICAN_COUNTRIES.map((country) => (
                  <SelectItem key={country} value={country.toUpperCase()}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Job Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Job Type</Label>
            <Select
              value={filters.type || ''}
              onValueChange={(value) => updateFilter('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select job type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {Object.entries(JOB_TYPES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Remote Work */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remote"
            checked={filters.remote || false}
            onCheckedChange={(checked) => updateFilter('remote', checked)}
          />
          <Label htmlFor="remote">Remote work only</Label>
        </div>

        {/* Advanced Filters Toggle */}
        <Button
          onClick={() => setShowAdvanced(!showAdvanced)}
          variant="outline"
          className="w-full"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
        </Button>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Lagos, Nairobi..."
                  value={filters.location || ''}
                  onChange={(e) => updateFilter('location', e.target.value)}
                />
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level</Label>
                <Select
                  value={filters.experienceLevel || ''}
                  onValueChange={(value) => updateFilter('experienceLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    {Object.entries(EXPERIENCE_LEVELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={filters.category || ''}
                  onValueChange={(value) => updateFilter('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="pt-4 border-t">
            <Label className="text-sm font-medium">Active Filters:</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {filters.search}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => clearFilter('search')}
                  />
                </Badge>
              )}
              {filters.country && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Country: {filters.country}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => clearFilter('country')}
                  />
                </Badge>
              )}
              {filters.location && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Location: {filters.location}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => clearFilter('location')}
                  />
                </Badge>
              )}
              {filters.type && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Type: {JOB_TYPES[filters.type as keyof typeof JOB_TYPES]}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => clearFilter('type')}
                  />
                </Badge>
              )}
              {filters.experienceLevel && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Experience: {EXPERIENCE_LEVELS[filters.experienceLevel as keyof typeof EXPERIENCE_LEVELS]}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => clearFilter('experienceLevel')}
                  />
                </Badge>
              )}
              {filters.remote && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Remote Only
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => clearFilter('remote')}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
