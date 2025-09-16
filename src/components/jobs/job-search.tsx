'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { X } from 'lucide-react';
import { LottieIcon } from '@/components/design/lottie-icon';
import { animations } from '@/lib/utils/lottie-animations';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { JobFilters } from '@/data/queries';
import { JobFiltersModal } from './job-filters';

// Dynamically import Select components to avoid hydration mismatch
const Select = dynamic(() => import('@/components/ui/select').then(mod => ({ default: mod.Select })), { ssr: false });
const SelectContent = dynamic(() => import('@/components/ui/select').then(mod => ({ default: mod.SelectContent })), { ssr: false });
const SelectTrigger = dynamic(() => import('@/components/ui/select').then(mod => ({ default: mod.SelectTrigger })), { ssr: false });
const SelectValue = dynamic(() => import('@/components/ui/select').then(mod => ({ default: mod.SelectValue })), { ssr: false });

interface JobSearchProps {
    onFiltersChange: (filters: JobFilters) => void;
    initialFilters?: JobFilters;
}


const AFRICAN_COUNTRIES = [
    { value: 'Nigeria', label: 'Nigeria' },
    { value: 'South Africa', label: 'South Africa' },
    { value: 'Kenya', label: 'Kenya' },
    { value: 'Egypt', label: 'Egypt' },
    { value: 'Ghana', label: 'Ghana' },
    { value: 'Morocco', label: 'Morocco' },
    { value: 'Rwanda', label: 'Rwanda' },
    { value: 'Uganda', label: 'Uganda' },
    { value: 'Tunisia', label: 'Tunisia' },
    { value: 'Senegal', label: 'Senegal' },
    { value: 'Ethiopia', label: 'Ethiopia' },
    { value: 'Tanzania', label: 'Tanzania' },
    { value: 'Cameroon', label: 'Cameroon' },
    { value: 'Ivory Coast', label: 'Ivory Coast' },
    { value: 'Angola', label: 'Angola' },
];

export function JobSearch({ onFiltersChange, initialFilters = {} }: JobSearchProps) {
    const [filters, setFilters] = useState<JobFilters>(initialFilters);
    const [searchInput, setSearchInput] = useState(initialFilters.search || '');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [selectedCountries, setSelectedCountries] = useState<string[]>(initialFilters.country ? [initialFilters.country] : []);
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

    // Use ref to avoid dependency on filters in useEffect
    const filtersRef = useRef(filters);

    // Update ref when filters change
    useEffect(() => {
        filtersRef.current = filters;
    }, [filters]);

    // Set client-side flag
    useEffect(() => {
        setIsClient(true);
    }, []);

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
            ? selectedCountries.filter(c => c !== countryValue)
            : [...selectedCountries, countryValue];

        setSelectedCountries(newSelectedCountries);

        // Update filters with comma-separated countries or undefined if none selected
        const countryFilter = newSelectedCountries.length > 0 ? newSelectedCountries.join(',') : undefined;
        const updatedFilters = { ...filters, country: countryFilter };
        setFilters(updatedFilters);
        onFiltersChange(updatedFilters);

        // Do not auto-open filters sheet - let user control it manually
    };

    const handleFiltersChange = (newFilters: JobFilters) => {
        setFilters(newFilters);
        onFiltersChange(newFilters);
    };


    const getActiveFilterCount = () => {
        const otherFilters = Object.entries(filters).filter(([key, value]) =>
            key !== 'search' && key !== 'country' && value !== undefined && value !== null && value !== ''
        ).length;
        const countryFilters = selectedCountries.length;
        return otherFilters + countryFilters;
    };

    const activeFilterCount = getActiveFilterCount();

    return (
        <div className="space-y-6">
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
                        placeholder="Search jobs, companies, or skills..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-10 h-12 text-base"
                    />
                </div>

                <div className="flex gap-2">
                    {isClient ? (
                        <Select value="" onValueChange={() => { }} open={isCountryDropdownOpen} onOpenChange={setIsCountryDropdownOpen}>
                            <SelectTrigger className="w-[160px] h-12">
                                <div className="flex items-center pl-2">
                                    <LottieIcon
                                        animationData={animations.globe}
                                        size={16}
                                        loop={false}
                                        autoplay={false}
                                        initialFrame={0}
                                        className="mr-2"
                                    />
                                    <SelectValue placeholder={selectedCountries.length > 0 ? `${selectedCountries.length} selected` : "Africa"} />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="w-[160px] max-w-[160px] min-w-[160px] max-h-[240px] overflow-y-auto">
                                {AFRICAN_COUNTRIES.map(country => (
                                    <div
                                        key={country.value}
                                        className={`relative flex w-full cursor-default select-none items-center rounded-sm py-2.5 pl-10 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground mb-0.5 ${selectedCountries.includes(country.value) ? 'bg-accent text-accent-foreground' : ''}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleCountryToggle(country.value);
                                        }}
                                    >
                                        <span className="absolute left-4 flex h-3.5 w-3.5 items-center justify-center">
                                            {selectedCountries.includes(country.value) && (
                                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                        <div className="w-[160px] h-12 border rounded-sm border-input bg-background flex items-center px-3">
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

                    <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                        <SheetTrigger asChild>
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
                        </SheetTrigger>
                        <SheetContent className="sm:max-w-md w-full p-0 h-full rounded-sm border-0 sm:m-4 sm:h-[calc(100%-2rem)] sm:rounded-sm sm:border shadow-lg bg-background overflow-hidden flex flex-col">
                            <div className="border-0 shadow-none rounded-sm sm:rounded-sm h-full flex flex-col">
                                <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex flex-row items-center justify-between flex-shrink-0">
                                    <div className="flex-1">
                                        <h2 className="text-base font-normal pt-2">Filters</h2>
                                        <p className="text-sm text-muted-foreground">Refine your search with these filters</p>
                                    </div>
                                </div>
                                <JobFiltersModal
                                    filters={filters}
                                    onFiltersChange={handleFiltersChange}
                                    isClient={isClient}
                                />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 max-w-4xl mx-auto">
                    {/* Country Badges - Blue */}
                    {selectedCountries.length > 0 && (
                        <>
                            {selectedCountries.map(country => (
                                <Badge
                                    key={country}
                                    className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-800 dark:hover:text-blue-200"
                                >
                                    {AFRICAN_COUNTRIES.find(c => c.value === country)?.label}
                                    <X
                                        className="h-3 w-3 cursor-pointer"
                                        onClick={() => handleCountryToggle(country)}
                                    />
                                </Badge>
                            ))}
                        </>
                    )}

                    {/* Category Badges - Orange */}
                    {filters.job_category && filters.job_category.split(',').map(category => (
                        <Badge
                            key={`category-${category}`}
                            className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40 hover:text-orange-800 dark:hover:text-orange-200"
                        >
                            {category}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                    const categories = filters.job_category!.split(',').filter(c => c !== category);
                                    const updatedFilters = { ...filters, job_category: categories.length > 0 ? categories.join(',') : undefined };
                                    handleFiltersChange(updatedFilters);
                                }}
                            />
                        </Badge>
                    ))}

                    {/* Type Badges - Purple */}
                    {filters.type && filters.type.split(',').map(type => (
                        <Badge
                            key={`type-${type}`}
                            className="flex items-center gap-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:text-purple-800 dark:hover:text-purple-200"
                        >
                            {type}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                    const types = filters.type!.split(',').filter(t => t !== type);
                                    const updatedFilters = { ...filters, type: types.length > 0 ? types.join(',') : undefined };
                                    handleFiltersChange(updatedFilters);
                                }}
                            />
                        </Badge>
                    ))}

                    {/* Experience Badges - Cyan */}
                    {filters.experience_level && filters.experience_level.split(',').map(experience => (
                        <Badge
                            key={`experience-${experience}`}
                            className="flex items-center gap-1 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 hover:text-cyan-800 dark:hover:text-cyan-200"
                        >
                            {experience}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                    const experiences = filters.experience_level!.split(',').filter(e => e !== experience);
                                    const updatedFilters = { ...filters, experience_level: experiences.length > 0 ? experiences.join(',') : undefined };
                                    handleFiltersChange(updatedFilters);
                                }}
                            />
                        </Badge>
                    ))}

                    {/* Company Size Badges - Yellow */}
                    {filters.company_size && filters.company_size.split(',').map(size => (
                        <Badge
                            key={`size-${size}`}
                            className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 hover:text-yellow-800 dark:hover:text-yellow-200"
                        >
                            {size}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                    const sizes = filters.company_size!.split(',').filter(s => s !== size);
                                    const updatedFilters = { ...filters, company_size: sizes.length > 0 ? sizes.join(',') : undefined };
                                    handleFiltersChange(updatedFilters);
                                }}
                            />
                        </Badge>
                    ))}

                    {/* Remote Badge - Emerald */}
                    {filters.remote && (
                        <Badge className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:text-emerald-800 dark:hover:text-emerald-200">
                            Remote Only
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                    const updatedFilters = { ...filters, remote: undefined };
                                    handleFiltersChange(updatedFilters);
                                }}
                            />
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
}
