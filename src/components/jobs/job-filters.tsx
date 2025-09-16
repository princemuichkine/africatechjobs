"use client";

import { useState, useEffect, useRef } from "react";
import {
  JobFilters,
  JOB_TYPES,
  EXPERIENCE_LEVELS,
  AFRICAN_COUNTRIES,
} from "@/lib/types/job";
import { useAnalytics } from "@/lib/hooks/use-analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface JobFiltersProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  onReset: () => void;
}

export function JobFiltersComponent({
  filters,
  onFiltersChange,
  onReset,
}: JobFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { trackSearch, trackUserAction } = useAnalytics();
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Track search with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Only track if there's a search query
    if (filters.search && filters.search.trim().length > 0) {
      searchTimeoutRef.current = setTimeout(() => {
        trackSearch(filters.search!, filters);
      }, 1000); // Debounce for 1 second
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [filters, trackSearch]);

  const updateFilter = (
    key: keyof JobFilters,
    value: string | boolean | number | undefined,
  ) => {
    const newFilters = {
      ...filters,
      [key]: value === "ALL" ? undefined : value,
    };

    onFiltersChange(newFilters);

    // Track filter usage (except for search which is tracked separately)
    if (key !== 'search' && value && value !== "ALL") {
      trackUserAction('job_filter_applied', {
        filter_type: key,
        filter_value: value,
      });
    }
  };

  const clearFilter = (key: keyof JobFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== undefined && value !== "" && value !== null,
  ).length;

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
              value={filters.search || ""}
              onChange={(e) => updateFilter("search", e.target.value)}
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
              value={filters.country || "ALL"}
              onValueChange={(value) => updateFilter("country", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Countries</SelectItem>
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
              value={filters.type || "ALL"}
              onValueChange={(value) => updateFilter("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select job type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                {JOB_TYPES.map((type, index) => (
                  <SelectItem key={index} value={type}>
                    {type}
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
            onCheckedChange={(checked) => updateFilter("remote", checked)}
          />
          <Label htmlFor="remote">Remote work only</Label>
        </div>

        {/* Advanced Filters Toggle */}
        <Button
          onClick={() => setShowAdvanced(!showAdvanced)}
          variant="outline"
          className="w-full"
        >
          {showAdvanced ? "Hide" : "Show"} Advanced Filters
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
                  value={filters.location || ""}
                  onChange={(e) => updateFilter("location", e.target.value)}
                />
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level</Label>
                <Select
                  value={filters.experience || "ALL"}
                  onValueChange={(value) => updateFilter("experience", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Levels</SelectItem>
                    {EXPERIENCE_LEVELS.map((level, index) => (
                      <SelectItem key={index} value={level}>
                        {level}
                      </SelectItem>
                    ))}
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
                    onClick={() => clearFilter("search")}
                  />
                </Badge>
              )}
              {filters.country && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Country: {filters.country}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => clearFilter("country")}
                  />
                </Badge>
              )}
              {filters.location && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Location: {filters.location}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => clearFilter("location")}
                  />
                </Badge>
              )}
              {filters.type && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Type: {filters.type}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => clearFilter("type")}
                  />
                </Badge>
              )}
              {filters.experience && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Experience: {filters.experience}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => clearFilter("experience")}
                  />
                </Badge>
              )}
              {filters.remote && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Remote Only
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => clearFilter("remote")}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
