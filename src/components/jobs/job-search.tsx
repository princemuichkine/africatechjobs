"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { LottieIcon } from "@/components/design/lottie-icon";
import { animations } from "@/lib/utils/lottie-animations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobFilters } from "@/data/queries";
import { JobFiltersModal } from "./job-filters";
import {
  getLocalStorageItem,
  setLocalStorageItem,
} from "@/lib/utils/localStorage";
import {
  AFRICAN_COUNTRIES,
  JOB_CATEGORIES,
  JOB_TYPES,
  EXPERIENCE_LEVELS,
  COMPANY_SIZES,
} from "@/lib/types/job";

// Dynamically import Select components to avoid hydration mismatch
const Select = dynamic(
  () =>
    import("@/components/ui/select").then((mod) => ({ default: mod.Select })),
  { ssr: false },
);
const SelectContent = dynamic(
  () =>
    import("@/components/ui/select").then((mod) => ({
      default: mod.SelectContent,
    })),
  { ssr: false },
);
const SelectTrigger = dynamic(
  () =>
    import("@/components/ui/select").then((mod) => ({
      default: mod.SelectTrigger,
    })),
  { ssr: false },
);
const SelectValue = dynamic(
  () =>
    import("@/components/ui/select").then((mod) => ({
      default: mod.SelectValue,
    })),
  { ssr: false },
);

interface JobSearchProps {
  onFiltersChange: (filters: JobFilters) => void;
  initialFilters?: JobFilters;
}

// Constants for localStorage
const FILTERS_STORAGE_KEY = "afritechjobs_job_filters";

// Helper functions for filter persistence
const saveFiltersToStorage = (filters: JobFilters) => {
  try {
    const filtersToSave = { ...filters };
    // Don't save empty search strings to keep localStorage clean
    if (!filtersToSave.search || filtersToSave.search.trim() === "") {
      delete filtersToSave.search;
    }
    setLocalStorageItem(FILTERS_STORAGE_KEY, JSON.stringify(filtersToSave));
  } catch (error) {
    console.error("Error saving filters to localStorage:", error);
  }
};

const loadFiltersFromStorage = (): JobFilters => {
  try {
    const savedFilters = getLocalStorageItem(FILTERS_STORAGE_KEY);
    if (savedFilters) {
      return JSON.parse(savedFilters);
    }
  } catch (error) {
    console.error("Error loading filters from localStorage:", error);
  }
  return {};
};

export function JobSearch({
  onFiltersChange,
  initialFilters = {},
}: JobSearchProps) {
  const [filters, setFilters] = useState<JobFilters>(initialFilters);
  const [searchInput, setSearchInput] = useState(initialFilters.search || "");
  const [selectedCountries, setSelectedCountries] = useState<string[]>(
    initialFilters.country ? initialFilters.country.split(",") : [],
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  // Set client-side flag and load filters from storage
  useEffect(() => {
    if (!isClient) {
      setIsClient(true);
      const savedFilters = loadFiltersFromStorage();
      if (Object.keys(savedFilters).length > 0) {
        const mergedFilters = { ...savedFilters, ...initialFilters };
        setFilters(mergedFilters);
        setSearchInput(mergedFilters.search || "");
        setSelectedCountries(
          mergedFilters.country ? mergedFilters.country.split(",") : [],
        );
      }
    }
    // We only want this to run once on mount, so we intentionally leave the dependency array empty.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);

  const playClickSound = useCallback(() => {
    try {
      const audio = new Audio("/sounds/light.mp3");
      audio.volume = 0.4;
      void audio.play().catch(() => {
        // Ignore audio play errors
      });
    } catch {
      // Ignore audio creation errors
    }
  }, []);

  // Use ref to avoid dependency on filters in useEffect
  const filtersRef = useRef(filters);
  const onFiltersChangeRef = useRef(onFiltersChange);

  // Update refs when values change
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    onFiltersChangeRef.current = onFiltersChange;
  }, [onFiltersChange]);

  // Notify parent component about loaded filters on mount (only once)
  useEffect(() => {
    if (isClient && Object.keys(filtersRef.current).length > 0) {
      onFiltersChangeRef.current(filtersRef.current);
    }
  }, [isClient]); // Only run when isClient becomes true

  // Save filters to localStorage whenever they change
  useEffect(() => {
    if (isClient) {
      saveFiltersToStorage(filters);
    }
  }, [filters, isClient]);

  // Debounced search - only depend on searchInput and onFiltersChange
  useEffect(() => {
    const timer = setTimeout(() => {
      const updatedFilters = { ...filtersRef.current, search: searchInput };
      setFilters(updatedFilters);
      onFiltersChange(updatedFilters);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchInput, onFiltersChange]);

  const handleCountryToggle = (countryValue: string) => {
    const newSelectedCountries = selectedCountries.includes(countryValue)
      ? selectedCountries.filter((c) => c !== countryValue)
      : [...selectedCountries, countryValue];

    setSelectedCountries(newSelectedCountries);

    // Update filters with comma-separated countries or undefined if none selected
    const countryFilter =
      newSelectedCountries.length > 0
        ? newSelectedCountries.join(",")
        : undefined;
    const updatedFilters = { ...filters, country: countryFilter };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);

    // Do not auto-open filters sheet - let user control it manually
  };

  const handleFiltersChange = (newFilters: JobFilters) => {
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const onClearFilters = useCallback(() => {
    playClickSound();
    setFilters({});
    setSearchInput("");
    setSelectedCountries([]);
    onFiltersChange({});
  }, [playClickSound, onFiltersChange]);

  const getActiveFilterCount = () => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (
        key !== "search" &&
        key !== "country" &&
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        if (typeof value === "string" && value.includes(",")) {
          count += value.split(",").filter((item) => item.trim() !== "").length;
        } else {
          count++;
        }
      }
    });

    const countryFilters = selectedCountries.length;
    const searchFilter = searchInput.trim() !== "" ? 1 : 0;
    return count + countryFilters + searchFilter;
  };

  const activeFilterCount = getActiveFilterCount();
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 max-w-4xl mx-auto px-4 sm:px-0 sm:translate-x-3 transition-transform duration-300 ease-in-out">
        <div className="relative w-full sm:w-[500px] min-w-[350px] sm:min-w-0">
          <LottieIcon
            animationData={animations.search}
            size={16}
            loop={false}
            autoplay={false}
            initialFrame={0}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search jobs, companies, or cities..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        <div className="flex flex-row gap-2 items-stretch">
          {isClient ? (
            <Select
              value=""
              onValueChange={() => {}}
              open={isCountryDropdownOpen}
              onOpenChange={setIsCountryDropdownOpen}
            >
              <SelectTrigger
                className={`flex-1 sm:w-[200px] min-w-0 sm:min-w-0 h-12`}
              >
                <div className="flex items-center pl-2">
                  <LottieIcon
                    animationData={animations.globe}
                    size={16}
                    loop={false}
                    autoplay={false}
                    initialFrame={0}
                    className="mr-2"
                  />
                  <SelectValue
                    placeholder={
                      selectedCountries.length > 0
                        ? `${selectedCountries.length} selected`
                        : "Africa"
                    }
                  />
                </div>
              </SelectTrigger>
              <SelectContent className="w-[180px] sm:w-[158px] sm:max-w-[158px] max-h-[220px] overflow-y-auto">
                {AFRICAN_COUNTRIES.map((country) => (
                  <div
                    key={country.value}
                    className={`relative flex w-full cursor-default select-none items-center rounded-sm py-2.5 pl-10 pr-2 text-sm outline-none hover:bg-accent/60 dark:hover:bg-accent hover:text-accent-foreground mb-0.5 ${selectedCountries.includes(country.value) ? "bg-accent/80 dark:bg-accent text-accent-foreground" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCountryToggle(country.value);
                    }}
                  >
                    <span className="absolute left-4 flex h-3.5 w-3.5 items-center justify-center">
                      {selectedCountries.includes(country.value) && (
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20,6 9,17 4,12" />
                        </svg>
                      )}
                    </span>
                    <span>{country.label}</span>
                  </div>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div
              className={`flex-1 sm:w-[200px] min-w-0 sm:min-w-0 h-12 border rounded-sm border-input bg-background flex items-center px-3`}
            >
              <div className="flex items-center pl-1">
                <LottieIcon
                  animationData={animations.globe}
                  size={16}
                  loop={false}
                  autoplay={false}
                  initialFrame={0}
                  className="-mr-1 text-muted-foreground"
                />
                <span className="text-sm text-muted-foreground">Africa</span>
              </div>
            </div>
          )}

          <Dialog.Root
            modal={false}
            open={isFilterOpen}
            onOpenChange={setIsFilterOpen}
          >
            <Dialog.Trigger asChild>
              <Button
                variant="outline"
                className={`flex-1 sm:w-[120px] min-w-0 sm:min-w-0 h-12 relative`}
              >
                <LottieIcon
                  animationData={animations.filter}
                  size={16}
                  loop={false}
                  autoplay={false}
                  initialFrame={0}
                  className="mr-1.5"
                />
                Filters
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Content className="fixed z-50 right-0 inset-y-0 sm:max-w-md w-full p-0 h-full m-0 sm:m-4 sm:h-[calc(100%-2rem)] rounded-none sm:rounded-sm border bg-background shadow-lg flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right overflow-y-auto">
                <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Dialog.Title className="text-base font-normal text-left">
                        Filters
                      </Dialog.Title>
                      <Dialog.Description className="text-sm text-muted-foreground text-left">
                        Refine your search with these filters
                      </Dialog.Description>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 sm:hidden"
                      onClick={() => setIsFilterOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <JobFiltersModal
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  isClient={isClient}
                  onClose={() => setIsFilterOpen(false)}
                />
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          {/* Clear button with responsive placeholder for desktop */}
          {isClient && hasActiveFilters ? (
            <div className="w-12 h-12 relative">
              <Button
                variant="outline"
                onClick={onClearFilters}
                className="absolute inset-0 w-12 h-12 p-0 rounded-sm bg-transparent border-border text-muted-foreground hover:text-card-foreground hover:bg-accent"
              >
                <span className="group inline-flex items-center justify-center">
                  <LottieIcon
                    animationData={animations.cross}
                    size={16}
                    className="opacity-50 group-hover:opacity-100"
                  />
                </span>
              </Button>
            </div>
          ) : (
            <div className="hidden sm:block w-12 h-12" />
          )}
        </div>
      </div>

      {/* Default Toggle Badges */}
      <div className="flex flex-wrap gap-2 max-w-4xl mx-auto px-4 sm:px-0 -mt-2 sm:translate-x-3 transition-transform duration-300 ease-in-out">
        <Badge
          className={`cursor-pointer transition-colors ${
            filters.remote
              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/40 hover:text-emerald-900 dark:hover:text-emerald-200"
              : "bg-accent dark:bg-muted text-accent-foreground dark:text-muted-foreground hover:bg-accent/80 dark:hover:bg-accent hover:text-accent-foreground dark:hover:text-accent-foreground"
          }`}
          onClick={() => {
            playClickSound();
            const updatedFilters = {
              ...filters,
              remote: filters.remote ? undefined : true,
            };
            handleFiltersChange(updatedFilters);
          }}
        >
          Remote
        </Badge>

        <Badge
          className={`cursor-pointer transition-colors ${
            filters.is_sponsored
              ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/40 hover:text-indigo-900 dark:hover:text-indigo-200"
              : "bg-accent dark:bg-muted text-accent-foreground dark:text-muted-foreground hover:bg-accent/80 dark:hover:bg-accent hover:text-accent-foreground dark:hover:text-accent-foreground"
          }`}
          onClick={() => {
            playClickSound();
            const updatedFilters = {
              ...filters,
              is_sponsored: filters.is_sponsored ? undefined : true,
            };
            handleFiltersChange(updatedFilters);
          }}
        >
          Sponsored
        </Badge>

        {/* Date Posted Badge */}
        <Badge
          className={`cursor-pointer transition-colors ${
            filters.date_posted
              ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/40 hover:text-orange-900 dark:hover:text-orange-200"
              : "bg-accent dark:bg-muted text-accent-foreground dark:text-muted-foreground hover:bg-accent/80 dark:hover:bg-accent hover:text-accent-foreground dark:hover:text-accent-foreground"
          }`}
          onClick={() => {
            playClickSound();
            // Cycle through date options: none -> past_24h -> past_week -> past_month -> none
            const dateOptions = ["", "past_24h", "past_week", "past_month"];
            const currentIndex = dateOptions.indexOf(filters.date_posted || "");
            const nextIndex = (currentIndex + 1) % dateOptions.length;
            const nextDateValue = dateOptions[nextIndex];

            const updatedFilters = {
              ...filters,
              date_posted: nextDateValue || undefined,
            };
            handleFiltersChange(updatedFilters);
          }}
        >
          {filters.date_posted === "past_24h"
            ? "24h"
            : filters.date_posted === "past_week"
              ? "Week"
              : filters.date_posted === "past_month"
                ? "Month"
                : "Any time"}
        </Badge>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 max-w-4xl mx-auto px-4 sm:px-0 sm:translate-x-3 transition-transform duration-300 ease-in-out">
          {/* Country Badges - Blue */}
          {selectedCountries.length > 0 && (
            <>
              {selectedCountries.map((country) => (
                <Badge
                  key={country}
                  className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  {AFRICAN_COUNTRIES.find((c) => c.value === country)?.label}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      playClickSound();
                      handleCountryToggle(country);
                    }}
                  />
                </Badge>
              ))}
            </>
          )}

          {/* Category Badges - Orange */}
          {filters.job_category &&
            filters.job_category.split(",").map((category) => (
              <Badge
                key={`category-${category}`}
                className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40 hover:text-orange-800 dark:hover:text-orange-200"
              >
                {JOB_CATEGORIES.find((c) => c.value === category)?.label ||
                  category}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    playClickSound();
                    const categories = filters
                      .job_category!.split(",")
                      .filter((c) => c !== category);
                    const updatedFilters = {
                      ...filters,
                      job_category:
                        categories.length > 0
                          ? categories.join(",")
                          : undefined,
                    };
                    handleFiltersChange(updatedFilters);
                  }}
                />
              </Badge>
            ))}

          {/* Type Badges - Purple */}
          {filters.type &&
            filters.type.split(",").map((type) => (
              <Badge
                key={`type-${type}`}
                className="flex items-center gap-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:text-purple-800 dark:hover:text-purple-200"
              >
                {JOB_TYPES.find((t) => t.value === type)?.label || type}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    playClickSound();
                    const types = filters
                      .type!.split(",")
                      .filter((t) => t !== type);
                    const updatedFilters = {
                      ...filters,
                      type: types.length > 0 ? types.join(",") : undefined,
                    };
                    handleFiltersChange(updatedFilters);
                  }}
                />
              </Badge>
            ))}

          {/* Experience Badges - Cyan */}
          {filters.experience_level &&
            filters.experience_level.split(",").map((experience) => (
              <Badge
                key={`experience-${experience}`}
                className="flex items-center gap-1 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 hover:text-cyan-800 dark:hover:text-cyan-200"
              >
                {EXPERIENCE_LEVELS.find((e) => e.value === experience)?.label ||
                  experience}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    playClickSound();
                    const experiences = filters
                      .experience_level!.split(",")
                      .filter((e) => e !== experience);
                    const updatedFilters = {
                      ...filters,
                      experience_level:
                        experiences.length > 0
                          ? experiences.join(",")
                          : undefined,
                    };
                    handleFiltersChange(updatedFilters);
                  }}
                />
              </Badge>
            ))}

          {/* Company Size Badges - Yellow */}
          {filters.company_size &&
            filters.company_size.split(",").map((size) => (
              <Badge
                key={`size-${size}`}
                className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 hover:text-yellow-800 dark:hover:text-yellow-200"
              >
                {COMPANY_SIZES.find((s) => s.value === size)?.label || size}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    playClickSound();
                    const sizes = filters
                      .company_size!.split(",")
                      .filter((s) => s !== size);
                    const updatedFilters = {
                      ...filters,
                      company_size:
                        sizes.length > 0 ? sizes.join(",") : undefined,
                    };
                    handleFiltersChange(updatedFilters);
                  }}
                />
              </Badge>
            ))}
        </div>
      )}
    </div>
  );
}
