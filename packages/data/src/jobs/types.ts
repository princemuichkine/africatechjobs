export interface Job {
  id: string;
  title: string;
  description: string;
  companyName: string;
  companyId?: string;
  location: string;
  country: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE' | 'INTERNSHIP' | 'APPRENTICESHIP';
  experienceLevel: 'ENTRY_LEVEL' | 'JUNIOR' | 'MID_LEVEL' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  remote: boolean;
  url: string;
  source: string;
  sourceId?: string;
  postedAt: string;
  deadline?: string;
  skills: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface JobFilters {
  search?: string;
  country?: string;
  location?: string;
  type?: string;
  experienceLevel?: string;
  remote?: boolean;
  category?: string;
  page?: number;
  limit?: number;
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  country?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScrapeLog {
  id: string;
  source: string;
  status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED';
  jobsFound: number;
  jobsAdded: number;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

export interface JobStats {
  total: number;
  recent: number;
  byCountry: Record<string, number>;
  byType: Record<string, number>;
  bySource: Record<string, number>;
  lastUpdated: string;
}
