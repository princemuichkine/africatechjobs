'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { JobFilters } from '@/data/queries';

interface JobSearchProps {
    onFiltersChange: (filters: JobFilters) => void;
    initialFilters?: JobFilters;
    jobCount?: number;
}

const JOB_CATEGORIES = [
    { value: 'ENGINEERING', label: 'Engineering' },
    { value: 'DATA', label: 'Data Science' },
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
    { value: 'FULL_TIME', label: 'Full Time' },
    { value: 'PART_TIME', label: 'Part Time' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'FREELANCE', label: 'Freelance' },
    { value: 'INTERNSHIP', label: 'Internship' },
    { value: 'APPRENTICESHIP', label: 'Apprenticeship' },
];

const EXPERIENCE_LEVELS = [
    { value: 'ENTRY_LEVEL', label: 'Entry Level' },
    { value: 'JUNIOR', label: 'Junior' },
    { value: 'MID_LEVEL', label: 'Mid Level' },
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

export function JobSearch({ onFiltersChange, initialFilters = {}, jobCount }: JobSearchProps) {
    const [filters, setFilters] = useState<JobFilters>(initialFilters);
    const [searchInput, setSearchInput] = useState(initialFilters.search || '');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            const updatedFilters = { ...filters, search: searchInput };
            setFilters(updatedFilters);
            onFiltersChange(updatedFilters);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchInput, filters, onFiltersChange]);

    const handleFilterChange = (key: keyof JobFilters, value: string | boolean | undefined) => {
        const updatedFilters = { ...filters, [key]: value };
        setFilters(updatedFilters);
        onFiltersChange(updatedFilters);
    };

    const clearFilters = () => {
        const clearedFilters: JobFilters = { search: searchInput };
        setFilters(clearedFilters);
        onFiltersChange(clearedFilters);
    };

    const getActiveFilterCount = () => {
        return Object.entries(filters).filter(([key, value]) =>
            key !== 'search' && value !== undefined && value !== null && value !== ''
        ).length;
    };

    const activeFilterCount = getActiveFilterCount();

    return (
        <div className="space-y-6">
            {/* Hero Search Section */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                    Find Your Next Tech Job in <span className="text-primary">Africa</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Discover opportunities from Lagos to Cairo, Cape Town to Nairobi.
                    Africa&apos;s premier tech job board with {jobCount ? `${jobCount.toLocaleString()}+` : 'thousands of'} active positions.
                </p>
            </div>

            {/* Main Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-4xl mx-auto">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search jobs, companies, or skills..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-10 h-12 text-base"
                    />
                </div>

                <div className="flex gap-2">
                    <Select value={filters.country || ''} onValueChange={(value) => handleFilterChange('country', value || undefined)}>
                        <SelectTrigger className="w-[180px] h-12">
                            <MapPin className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="All Countries" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Countries</SelectItem>
                            {AFRICAN_COUNTRIES.map(country => (
                                <SelectItem key={country.value} value={country.value}>
                                    {country.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="h-12 relative">
                                <Filter className="h-4 w-4 mr-2" />
                                Filters
                                {activeFilterCount > 0 && (
                                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                                        {activeFilterCount}
                                    </Badge>
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-[400px] sm:w-[540px]">
                            <SheetHeader>
                                <SheetTitle>Filter Jobs</SheetTitle>
                                <SheetDescription>
                                    Refine your job search with these filters
                                </SheetDescription>
                            </SheetHeader>

                            <div className="space-y-6 mt-6">
                                {/* Job Category */}
                                <div>
                                    <label className="text-sm font-medium mb-3 block">Job Category</label>
                                    <Select value={filters.job_category || ''} onValueChange={(value) => handleFilterChange('job_category', value || undefined)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All Categories</SelectItem>
                                            {JOB_CATEGORIES.map(category => (
                                                <SelectItem key={category.value} value={category.value}>
                                                    {category.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Job Type */}
                                <div>
                                    <label className="text-sm font-medium mb-3 block">Job Type</label>
                                    <Select value={filters.type || ''} onValueChange={(value) => handleFilterChange('type', value || undefined)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All Types</SelectItem>
                                            {JOB_TYPES.map(type => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Experience Level */}
                                <div>
                                    <label className="text-sm font-medium mb-3 block">Experience Level</label>
                                    <Select value={filters.experience_level || ''} onValueChange={(value) => handleFilterChange('experience_level', value || undefined)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Levels" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All Levels</SelectItem>
                                            {EXPERIENCE_LEVELS.map(level => (
                                                <SelectItem key={level.value} value={level.value}>
                                                    {level.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Company Size */}
                                <div>
                                    <label className="text-sm font-medium mb-3 block">Company Size</label>
                                    <Select value={filters.company_size || ''} onValueChange={(value) => handleFilterChange('company_size', value || undefined)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Sizes" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All Sizes</SelectItem>
                                            {COMPANY_SIZES.map(size => (
                                                <SelectItem key={size.value} value={size.value}>
                                                    {size.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Remote Work */}
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="remote"
                                        checked={filters.remote === true}
                                        onCheckedChange={(checked) => handleFilterChange('remote', checked ? true : undefined)}
                                    />
                                    <label htmlFor="remote" className="text-sm font-medium">
                                        Remote work only
                                    </label>
                                </div>

                                {/* Clear Filters */}
                                {activeFilterCount > 0 && (
                                    <Button variant="outline" onClick={clearFilters} className="w-full">
                                        <X className="h-4 w-4 mr-2" />
                                        Clear All Filters
                                    </Button>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 max-w-4xl mx-auto">
                    {filters.country && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            {filters.country}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => handleFilterChange('country', undefined)}
                            />
                        </Badge>
                    )}
                    {filters.job_category && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            {JOB_CATEGORIES.find(c => c.value === filters.job_category)?.label}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => handleFilterChange('job_category', undefined)}
                            />
                        </Badge>
                    )}
                    {filters.type && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            {JOB_TYPES.find(t => t.value === filters.type)?.label}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => handleFilterChange('type', undefined)}
                            />
                        </Badge>
                    )}
                    {filters.experience_level && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            {EXPERIENCE_LEVELS.find(e => e.value === filters.experience_level)?.label}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => handleFilterChange('experience_level', undefined)}
                            />
                        </Badge>
                    )}
                    {filters.company_size && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            {COMPANY_SIZES.find(s => s.value === filters.company_size)?.label}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => handleFilterChange('company_size', undefined)}
                            />
                        </Badge>
                    )}
                    {filters.remote && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            Remote Only
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => handleFilterChange('remote', undefined)}
                            />
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
}
