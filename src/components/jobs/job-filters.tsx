'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { JobFilters } from '@/data/queries';

// Dynamically import Select components to avoid hydration mismatch
const Select = dynamic(() => import('@/components/ui/select').then(mod => ({ default: mod.Select })), { ssr: false });
const SelectContent = dynamic(() => import('@/components/ui/select').then(mod => ({ default: mod.SelectContent })), { ssr: false });
const SelectTrigger = dynamic(() => import('@/components/ui/select').then(mod => ({ default: mod.SelectTrigger })), { ssr: false });
const SelectValue = dynamic(() => import('@/components/ui/select').then(mod => ({ default: mod.SelectValue })), { ssr: false });

const JOB_CATEGORIES = [
  { value: 'ENGINEERING', label: 'Engineering' },
  { value: 'DATA', label: 'Data science' },
  { value: 'PRODUCT', label: 'Product' },
  { value: 'DESIGN', label: 'Design' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'SALES', label: 'Sales' },
  { value: 'DEVOPS', label: 'DevOps' },
  { value: 'MOBILE', label: 'Mobile' },
  { value: 'AI', label: 'AI/ML' },
  { value: 'BLOCKCHAIN', label: 'Blockchain' },
  { value: 'CLOUD', label: 'Cloud' },
  { value: 'OTHER', label: 'Other' },
];

const JOB_TYPES = [
  { value: 'FULL_TIME', label: 'Full time' },
  { value: 'PART_TIME', label: 'Part time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'APPRENTICESHIP', label: 'Apprenticeship' },
];

const EXPERIENCE_LEVELS = [
  { value: 'ENTRY_LEVEL', label: 'Entry level' },
  { value: 'JUNIOR', label: 'Junior' },
  { value: 'MID_LEVEL', label: 'Mid level' },
  { value: 'SENIOR', label: 'Senior' },
  { value: 'EXECUTIVE', label: 'Executive' },
];

const COMPANY_SIZES = [
  { value: '1_10', label: '1-10 employees' },
  { value: '11_50', label: '11-50 employees' },
  { value: '51_200', label: '51-200 employees' },
  { value: '201_1000', label: '201-1000 employees' },
  { value: '1000_PLUS', label: '1000+ employees' },
];

interface JobFiltersModalProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  isClient: boolean;
}

export function JobFiltersModal({ filters, onFiltersChange, isClient }: JobFiltersModalProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    filters.job_category ? filters.job_category.split(',') : []
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    filters.type ? filters.type.split(',') : []
  );
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>(
    filters.experience_level ? filters.experience_level.split(',') : []
  );
  const [selectedCompanySizes, setSelectedCompanySizes] = useState<string[]>(
    filters.company_size ? filters.company_size.split(',') : []
  );
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isExperienceDropdownOpen, setIsExperienceDropdownOpen] = useState(false);
  const [isCompanySizeDropdownOpen, setIsCompanySizeDropdownOpen] = useState(false);

  const handleCategoryToggle = (categoryValue: string) => {
    const newSelected = selectedCategories.includes(categoryValue)
      ? selectedCategories.filter(c => c !== categoryValue)
      : [...selectedCategories, categoryValue];

    setSelectedCategories(newSelected);
    const categoryFilter = newSelected.length > 0 ? newSelected.join(',') : undefined;
    const updatedFilters = { ...filters, job_category: categoryFilter };
    onFiltersChange(updatedFilters);
  };

  const handleTypeToggle = (typeValue: string) => {
    const newSelected = selectedTypes.includes(typeValue)
      ? selectedTypes.filter(t => t !== typeValue)
      : [...selectedTypes, typeValue];

    setSelectedTypes(newSelected);
    const typeFilter = newSelected.length > 0 ? newSelected.join(',') : undefined;
    const updatedFilters = { ...filters, type: typeFilter };
    onFiltersChange(updatedFilters);
  };

  const handleExperienceToggle = (experienceValue: string) => {
    const newSelected = selectedExperiences.includes(experienceValue)
      ? selectedExperiences.filter(e => e !== experienceValue)
      : [...selectedExperiences, experienceValue];

    setSelectedExperiences(newSelected);
    const experienceFilter = newSelected.length > 0 ? newSelected.join(',') : undefined;
    const updatedFilters = { ...filters, experience_level: experienceFilter };
    onFiltersChange(updatedFilters);
  };

  const handleCompanySizeToggle = (sizeValue: string) => {
    const newSelected = selectedCompanySizes.includes(sizeValue)
      ? selectedCompanySizes.filter(s => s !== sizeValue)
      : [...selectedCompanySizes, sizeValue];

    setSelectedCompanySizes(newSelected);
    const sizeFilter = newSelected.length > 0 ? newSelected.join(',') : undefined;
    const updatedFilters = { ...filters, company_size: sizeFilter };
    onFiltersChange(updatedFilters);
  };


  const getActiveFilterCount = () => {
    return selectedCategories.length + selectedTypes.length + selectedExperiences.length + selectedCompanySizes.length;
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedTypes([]);
    setSelectedExperiences([]);
    setSelectedCompanySizes([]);
    const clearedFilters: JobFilters = {
      search: filters.search,
      country: filters.country,
      remote: filters.remote,
      is_sponsored: filters.is_sponsored
    };
    onFiltersChange(clearedFilters);
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="p-4 space-y-6 overflow-auto flex-1">
      {/* Job Category */}
      <div>
        <label className="text-sm font-medium mb-3 block">Category</label>
        {isClient ? (
          <Select value="" onValueChange={() => { }} open={isCategoryDropdownOpen} onOpenChange={setIsCategoryDropdownOpen}>
            <SelectTrigger>
              <SelectValue placeholder={selectedCategories.length > 0 ? `${selectedCategories.length} selected` : "All categories"} />
            </SelectTrigger>
            <SelectContent className="max-h-[240px] overflow-y-auto">
              {JOB_CATEGORIES.map(category => (
                <div
                  key={category.value}
                  className={`relative flex w-full cursor-default select-none items-center rounded-sm py-2.5 pl-10 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground mb-0.5 ${selectedCategories.includes(category.value) ? 'bg-accent text-accent-foreground' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCategoryToggle(category.value);
                  }}
                >
                  <span className="absolute left-4 flex h-3.5 w-3.5 items-center justify-center">
                    {selectedCategories.includes(category.value) && (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <span className="text-sm text-muted-foreground">All categories</span>
          </div>
        )}
      </div>

      {/* Job Type */}
      <div>
        <label className="text-sm font-medium mb-3 block">Type</label>
        {isClient ? (
          <Select value="" onValueChange={() => { }} open={isTypeDropdownOpen} onOpenChange={setIsTypeDropdownOpen}>
            <SelectTrigger>
              <SelectValue placeholder={selectedTypes.length > 0 ? `${selectedTypes.length} selected` : "All types"} />
            </SelectTrigger>
            <SelectContent className="max-h-[240px] overflow-y-auto">
              {JOB_TYPES.map(type => (
                <div
                  key={type.value}
                  className={`relative flex w-full cursor-default select-none items-center rounded-sm py-2.5 pl-10 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground mb-0.5 ${selectedTypes.includes(type.value) ? 'bg-accent text-accent-foreground' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleTypeToggle(type.value);
                  }}
                >
                  <span className="absolute left-4 flex h-3.5 w-3.5 items-center justify-center">
                    {selectedTypes.includes(type.value) && (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <label className="text-sm font-medium mb-3 block">Experience</label>
        {isClient ? (
          <Select value="" onValueChange={() => { }} open={isExperienceDropdownOpen} onOpenChange={setIsExperienceDropdownOpen}>
            <SelectTrigger>
              <SelectValue placeholder={selectedExperiences.length > 0 ? `${selectedExperiences.length} selected` : "All levels"} />
            </SelectTrigger>
            <SelectContent className="max-h-[240px] overflow-y-auto">
              {EXPERIENCE_LEVELS.map(level => (
                <div
                  key={level.value}
                  className={`relative flex w-full cursor-default select-none items-center rounded-sm py-2.5 pl-10 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground mb-0.5 ${selectedExperiences.includes(level.value) ? 'bg-accent text-accent-foreground' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleExperienceToggle(level.value);
                  }}
                >
                  <span className="absolute left-4 flex h-3.5 w-3.5 items-center justify-center">
                    {selectedExperiences.includes(level.value) && (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <label className="text-sm font-medium mb-3 block">Company size</label>
        {isClient ? (
          <Select value="" onValueChange={() => { }} open={isCompanySizeDropdownOpen} onOpenChange={setIsCompanySizeDropdownOpen}>
            <SelectTrigger>
              <SelectValue placeholder={selectedCompanySizes.length > 0 ? `${selectedCompanySizes.length} selected` : "All sizes"} />
            </SelectTrigger>
            <SelectContent className="max-h-[240px] overflow-y-auto">
              {COMPANY_SIZES.map(size => (
                <div
                  key={size.value}
                  className={`relative flex w-full cursor-default select-none items-center rounded-sm py-2.5 pl-10 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground mb-0.5 ${selectedCompanySizes.includes(size.value) ? 'bg-accent text-accent-foreground' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCompanySizeToggle(size.value);
                  }}
                >
                  <span className="absolute left-4 flex h-3.5 w-3.5 items-center justify-center">
                    {selectedCompanySizes.includes(size.value) && (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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


      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button onClick={clearFilters} className="w-full h-9 bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-900/40 hover:text-pink-900 dark:hover:text-pink-200 border border-pink-300 dark:border-pink-800">
          Clear all filters
        </Button>
      )}

    </div>
  );
}