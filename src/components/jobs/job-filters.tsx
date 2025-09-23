"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { JobFilters } from "@/data/queries";
import {
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

interface JobFiltersModalProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  isClient: boolean;
  onClose?: () => void;
}

export function JobFiltersModal({
  filters,
  onFiltersChange,
  isClient,
  onClose,
}: JobFiltersModalProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    filters.job_category ? filters.job_category.split(",") : [],
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    filters.type ? filters.type.split(",") : [],
  );
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>(
    filters.experience_level ? filters.experience_level.split(",") : [],
  );
  const [selectedCompanySizes, setSelectedCompanySizes] = useState<string[]>(
    filters.company_size ? filters.company_size.split(",") : [],
  );
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isExperienceDropdownOpen, setIsExperienceDropdownOpen] =
    useState(false);
  const [isCompanySizeDropdownOpen, setIsCompanySizeDropdownOpen] =
    useState(false);
  const [selectedDatePosted, setSelectedDatePosted] = useState<string>(
    filters.date_posted || ""
  );
  const [isDatePostedDropdownOpen, setIsDatePostedDropdownOpen] = useState(false);

  const handleCategoryToggle = (categoryValue: string) => {
    const newSelected = selectedCategories.includes(categoryValue)
      ? selectedCategories.filter((c) => c !== categoryValue)
      : [...selectedCategories, categoryValue];

    setSelectedCategories(newSelected);
    const categoryFilter =
      newSelected.length > 0 ? newSelected.join(",") : undefined;
    const updatedFilters = { ...filters, job_category: categoryFilter };
    onFiltersChange(updatedFilters);
  };

  const handleTypeToggle = (typeValue: string) => {
    const newSelected = selectedTypes.includes(typeValue)
      ? selectedTypes.filter((t) => t !== typeValue)
      : [...selectedTypes, typeValue];

    setSelectedTypes(newSelected);
    const typeFilter =
      newSelected.length > 0 ? newSelected.join(",") : undefined;
    const updatedFilters = { ...filters, type: typeFilter };
    onFiltersChange(updatedFilters);
  };

  const handleExperienceToggle = (experienceValue: string) => {
    const newSelected = selectedExperiences.includes(experienceValue)
      ? selectedExperiences.filter((e) => e !== experienceValue)
      : [...selectedExperiences, experienceValue];

    setSelectedExperiences(newSelected);
    const experienceFilter =
      newSelected.length > 0 ? newSelected.join(",") : undefined;
    const updatedFilters = { ...filters, experience_level: experienceFilter };
    onFiltersChange(updatedFilters);
  };

  const handleCompanySizeToggle = (sizeValue: string) => {
    const newSelected = selectedCompanySizes.includes(sizeValue)
      ? selectedCompanySizes.filter((s) => s !== sizeValue)
      : [...selectedCompanySizes, sizeValue];

    setSelectedCompanySizes(newSelected);
    const sizeFilter =
      newSelected.length > 0 ? newSelected.join(",") : undefined;
    const updatedFilters = { ...filters, company_size: sizeFilter };
    onFiltersChange(updatedFilters);
  };

  const handleDatePostedChange = (dateValue: string) => {
    setSelectedDatePosted(dateValue);
    const dateFilter = dateValue || undefined;
    const updatedFilters = { ...filters, date_posted: dateFilter };
    onFiltersChange(updatedFilters);
  };

  const getActiveFilterCount = () => {
    return (
      selectedCategories.length +
      selectedTypes.length +
      selectedExperiences.length +
      selectedCompanySizes.length +
      (selectedDatePosted ? 1 : 0)
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedTypes([]);
    setSelectedExperiences([]);
    setSelectedCompanySizes([]);
    setSelectedDatePosted("");
    const clearedFilters: JobFilters = {
      search: filters.search,
      country: filters.country,
      remote: filters.remote,
      is_sponsored: filters.is_sponsored,
    };
    onFiltersChange(clearedFilters);
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="p-4 sm:p-6 overflow-auto flex-1 flex flex-col">
      <div className="space-y-4 sm:space-y-6 flex-1">
        {/* Job Category */}
        <div>
          <label className="text-sm font-medium mb-2 sm:mb-3 block">
            Category
          </label>
          {isClient ? (
            <Select
              value=""
              onValueChange={() => { }}
              open={isCategoryDropdownOpen}
              onOpenChange={setIsCategoryDropdownOpen}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    selectedCategories.length > 0
                      ? `${selectedCategories.length} selected`
                      : "All categories"
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-[240px] overflow-y-auto">
                {JOB_CATEGORIES.map((category) => (
                  <div
                    key={category.value}
                    className={`relative flex w-full cursor-default select-none items-center rounded-sm py-2.5 pl-10 pr-2 text-sm outline-none hover:bg-accent/60 dark:hover:bg-accent hover:text-accent-foreground mb-0.5 ${selectedCategories.includes(category.value) ? "bg-accent/80 dark:bg-accent text-accent-foreground" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCategoryToggle(category.value);
                    }}
                  >
                    <span className="absolute left-4 flex h-3.5 w-3.5 items-center justify-center">
                      {selectedCategories.includes(category.value) && (
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
                    <span>{category.label}</span>
                  </div>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="h-10 border rounded-sm border-input bg-background flex items-center px-3">
              <span className="text-sm text-muted-foreground">
                All categories
              </span>
            </div>
          )}
        </div>

        {/* Job Type */}
        <div>
          <label className="text-sm font-medium mb-2 sm:mb-3 block">Type</label>
          {isClient ? (
            <Select
              value=""
              onValueChange={() => { }}
              open={isTypeDropdownOpen}
              onOpenChange={setIsTypeDropdownOpen}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    selectedTypes.length > 0
                      ? `${selectedTypes.length} selected`
                      : "All types"
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-[240px] overflow-y-auto">
                {JOB_TYPES.map((type) => (
                  <div
                    key={type.value}
                    className={`relative flex w-full cursor-default select-none items-center rounded-sm py-2.5 pl-10 pr-2 text-sm outline-none hover:bg-accent/60 dark:hover:bg-accent hover:text-accent-foreground mb-0.5 ${selectedTypes.includes(type.value) ? "bg-accent/80 dark:bg-accent text-accent-foreground" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleTypeToggle(type.value);
                    }}
                  >
                    <span className="absolute left-4 flex h-3.5 w-3.5 items-center justify-center">
                      {selectedTypes.includes(type.value) && (
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
                    <span>{type.label}</span>
                  </div>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="h-10 border rounded-sm border-input bg-background flex items-center px-3">
              <span className="text-sm text-muted-foreground">All types</span>
            </div>
          )}
        </div>

        {/* Experience Level */}
        <div>
          <label className="text-sm font-medium mb-2 sm:mb-3 block">
            Experience
          </label>
          {isClient ? (
            <Select
              value=""
              onValueChange={() => { }}
              open={isExperienceDropdownOpen}
              onOpenChange={setIsExperienceDropdownOpen}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    selectedExperiences.length > 0
                      ? `${selectedExperiences.length} selected`
                      : "All levels"
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-[240px] overflow-y-auto">
                {EXPERIENCE_LEVELS.map((level) => (
                  <div
                    key={level.value}
                    className={`relative flex w-full cursor-default select-none items-center rounded-sm py-2.5 pl-10 pr-2 text-sm outline-none hover:bg-accent/60 dark:hover:bg-accent hover:text-accent-foreground mb-0.5 ${selectedExperiences.includes(level.value) ? "bg-accent/80 dark:bg-accent text-accent-foreground" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleExperienceToggle(level.value);
                    }}
                  >
                    <span className="absolute left-4 flex h-3.5 w-3.5 items-center justify-center">
                      {selectedExperiences.includes(level.value) && (
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
                    <span>{level.label}</span>
                  </div>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="h-10 border rounded-sm border-input bg-background flex items-center px-3">
              <span className="text-sm text-muted-foreground">All levels</span>
            </div>
          )}
        </div>

        {/* Company Size */}
        <div>
          <label className="text-sm font-medium mb-2 sm:mb-3 block">
            Company size
          </label>
          {isClient ? (
            <Select
              value=""
              onValueChange={() => { }}
              open={isCompanySizeDropdownOpen}
              onOpenChange={setIsCompanySizeDropdownOpen}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    selectedCompanySizes.length > 0
                      ? `${selectedCompanySizes.length} selected`
                      : "All sizes"
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-[240px] overflow-y-auto">
                {COMPANY_SIZES.map((size) => (
                  <div
                    key={size.value}
                    className={`relative flex w-full cursor-default select-none items-center rounded-sm py-2.5 pl-10 pr-2 text-sm outline-none hover:bg-accent/60 dark:hover:bg-accent hover:text-accent-foreground mb-0.5 ${selectedCompanySizes.includes(size.value) ? "bg-accent/80 dark:bg-accent text-accent-foreground" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCompanySizeToggle(size.value);
                    }}
                  >
                    <span className="absolute left-4 flex h-3.5 w-3.5 items-center justify-center">
                      {selectedCompanySizes.includes(size.value) && (
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
                    <span>{size.label}</span>
                  </div>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="h-10 border rounded-sm border-input bg-background flex items-center px-3">
              <span className="text-sm text-muted-foreground">All sizes</span>
            </div>
          )}
        </div>

        {/* Date Posted */}
        <div>
          <label className="text-sm font-medium mb-2 sm:mb-3 block">
            Date posted
          </label>
          {isClient ? (
            <Select
              value={selectedDatePosted}
              onValueChange={handleDatePostedChange}
              open={isDatePostedDropdownOpen}
              onOpenChange={setIsDatePostedDropdownOpen}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder="Any time"
                />
              </SelectTrigger>
              <SelectContent>
                {[
                  { value: "", label: "Any time" },
                  { value: "past_24h", label: "Past 24 hours" },
                  { value: "past_week", label: "Past week" },
                  { value: "past_month", label: "Past month" },
                ].map((option) => (
                  <div
                    key={option.value}
                    className={`relative flex w-full cursor-default select-none items-center rounded-sm py-2.5 pl-10 pr-2 text-sm outline-none hover:bg-accent/60 dark:hover:bg-accent hover:text-accent-foreground mb-0.5 ${selectedDatePosted === option.value ? "bg-accent/80 dark:bg-accent text-accent-foreground" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDatePostedChange(option.value);
                    }}
                  >
                    <span className="absolute left-4 flex h-3.5 w-3.5 items-center justify-center">
                      {selectedDatePosted === option.value && (
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
                    <span>{option.label}</span>
                  </div>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="h-10 border rounded-sm border-input bg-background flex items-center px-3">
              <span className="text-sm text-muted-foreground">Any time</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-3 pt-4 border-t mt-auto">
        {activeFilterCount > 0 && (
          <Button
            onClick={clearFilters}
            className="h-10 sm:h-9 bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/40 hover:text-pink-800 dark:hover:text-pink-200 border border-pink-200 dark:border-pink-800 order-2 sm:order-1"
          >
            Clear all filters
          </Button>
        )}

        <Button
          onClick={() => onClose?.()}
          className="h-10 sm:h-9 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800 order-1 sm:order-2 sm:ml-auto"
        >
          Validate section
        </Button>
      </div>
    </div>
  );
}
