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

const AFRICAN_COUNTRIES = [
  { value: "Nigeria", label: "Nigeria" },
  { value: "South Africa", label: "South Africa" },
  { value: "Kenya", label: "Kenya" },
  { value: "Egypt", label: "Egypt" },
  { value: "Ghana", label: "Ghana" },
  { value: "Morocco", label: "Morocco" },
  { value: "Rwanda", label: "Rwanda" },
  { value: "Uganda", label: "Uganda" },
  { value: "Tunisia", label: "Tunisia" },
  { value: "Senegal", label: "Senegal" },
  { value: "Ethiopia", label: "Ethiopia" },
  { value: "Tanzania", label: "Tanzania" },
  { value: "Cameroon", label: "Cameroon" },
  { value: "Ivory Coast", label: "Ivory Coast" },
  { value: "Angola", label: "Angola" },
];

const JOB_CATEGORIES = [
  { value: "ENGINEERING", label: "Engineering" },
  { value: "DATA", label: "Data science" },
  { value: "PRODUCT", label: "Product" },
  { value: "DESIGN", label: "Design" },
  { value: "MARKETING", label: "Marketing" },
  { value: "SALES", label: "Sales" },
  { value: "DEVOPS", label: "DevOps" },
  { value: "MOBILE", label: "Mobile" },
  { value: "AI", label: "AI/ML" },
  { value: "BLOCKCHAIN", label: "Blockchain" },
  { value: "CLOUD", label: "Cloud" },
  { value: "OTHER", label: "Other" },
];

const JOB_TYPES = [
  { value: "FULL_TIME", label: "Full time" },
  { value: "PART_TIME", label: "Part time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "APPRENTICESHIP", label: "Apprenticeship" },
];

const EXPERIENCE_LEVELS = [
  { value: "ENTRY_LEVEL", label: "Entry level" },
  { value: "JUNIOR", label: "Junior" },
  { value: "MID_LEVEL", label: "Mid level" },
  { value: "SENIOR", label: "Senior" },
  { value: "EXECUTIVE", label: "Executive" },
];

const COMPANY_SIZES = [
  { value: "1_10", label: "1-10 employees" },
  { value: "11_50", label: "11-50 employees" },
  { value: "51_200", label: "51-200 employees" },
  { value: "201_1000", label: "201-1000 employees" },
  { value: "1000_PLUS", label: "1000+ employees" },
];

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
  // Merge initialFilters with saved filters, giving priority to initialFilters
  const [filters, setFilters] = useState<JobFilters>(() => {
    const savedFilters = loadFiltersFromStorage();
    return { ...savedFilters, ...initialFilters };
  });

  const [searchInput, setSearchInput] = useState(() => {
    const savedFilters = loadFiltersFromStorage();
    const mergedFilters = { ...savedFilters, ...initialFilters };
    return mergedFilters.search || "";
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const [selectedCountries, setSelectedCountries] = useState<string[]>(() => {
    const savedFilters = loadFiltersFromStorage();
    const mergedFilters = { ...savedFilters, ...initialFilters };
    return mergedFilters.country ? mergedFilters.country.split(",") : [];
  });

  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

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

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

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
    }, 300);

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
    const otherFilters = Object.entries(filters).filter(
      ([key, value]) =>
        key !== "search" &&
        key !== "country" &&
        value !== undefined &&
        value !== null &&
        value !== "",
    ).length;
    const countryFilters = selectedCountries.length;
    const searchFilter = searchInput.trim() !== "" ? 1 : 0;
    return otherFilters + countryFilters + searchFilter;
  };

  const activeFilterCount = getActiveFilterCount();
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 max-w-4xl mx-auto">
        <div className="relative w-[500px]">
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

        <div className="flex gap-2 items-center">
          {isClient ? (
            <Select
              value=""
              onValueChange={() => {}}
              open={isCountryDropdownOpen}
              onOpenChange={setIsCountryDropdownOpen}
            >
              <SelectTrigger className="w-[145px] h-12">
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
              <SelectContent className="w-[145px] max-w-[145px] min-w-[145px] max-h-[240px] overflow-y-auto">
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
            <div className="w-[145px] h-12 border rounded-sm border-input bg-background flex items-center px-3">
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

          <div className="flex space-x-2">
            <Dialog.Root
              modal={false}
              open={isFilterOpen}
              onOpenChange={setIsFilterOpen}
            >
              <Dialog.Trigger asChild>
                <Button variant="outline" className="w-[120px] h-12 relative">
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
                <Dialog.Content className="fixed z-50 right-0 inset-y-0 sm:max-w-md w-full p-0 h-full sm:m-4 sm:h-[calc(100%-2rem)] rounded-sm border bg-background shadow-lg flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right overflow-y-auto">
                  <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex-shrink-0">
                    <Dialog.Title className="text-base font-normal text-left">
                      Filters
                    </Dialog.Title>
                    <Dialog.Description className="text-sm text-muted-foreground text-left">
                      Refine your search with these filters
                    </Dialog.Description>
                  </div>
                  <JobFiltersModal
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    isClient={isClient}
                  />
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>

            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={onClearFilters}
                className="w-12 h-12 p-0 rounded-sm bg-transparent border-border text-muted-foreground hover:text-card-foreground hover:bg-accent"
              >
                <span className="group inline-flex items-center justify-center">
                  <LottieIcon
                    animationData={animations.cross}
                    size={16}
                    className="opacity-50 group-hover:opacity-100"
                  />
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Default Toggle Badges */}
      <div className="flex flex-wrap gap-2 max-w-4xl mx-auto -mt-2">
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
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 max-w-4xl mx-auto">
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
