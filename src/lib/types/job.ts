export interface Job {
  id: string
  title: string
  description: string
  companyName: string
  companyId?: string
  location: string
  country: string
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE' | 'INTERNSHIP' | 'APPRENTICESHIP'
  experienceLevel: 'ENTRY_LEVEL' | 'JUNIOR' | 'MID_LEVEL' | 'SENIOR' | 'LEAD' | 'EXECUTIVE'
  salary?: string
  salaryMin?: number
  salaryMax?: number
  currency: string
  remote: boolean
  url: string
  source: string
  sourceId?: string
  postedAt: string
  deadline?: string
  skills: string[]
  category: string
  createdAt: string
  updatedAt: string
  isActive: boolean
}

export interface JobFilters {
  search?: string
  country?: string
  location?: string
  type?: string
  experienceLevel?: string
  remote?: boolean
  category?: string
  page?: number
  limit?: number
}

export interface JobStats {
  total: number
  recent: number
  byCountry: Record<string, number>
  byType: Record<string, number>
  bySource: Record<string, number>
  topCountries: [string, number][]
  topSources: [string, number][]
}

export const JOB_TYPES = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  CONTRACT: 'Contract',
  FREELANCE: 'Freelance',
  INTERNSHIP: 'Internship',
  APPRENTICESHIP: 'Apprenticeship'
} as const

export const EXPERIENCE_LEVELS = {
  ENTRY_LEVEL: 'Entry Level',
  JUNIOR: 'Junior',
  MID_LEVEL: 'Mid Level',
  SENIOR: 'Senior',
  LEAD: 'Lead',
  EXECUTIVE: 'Executive'
} as const

export const AFRICAN_COUNTRIES = [
  'Nigeria', 'Kenya', 'South Africa', 'Ghana', 'Uganda',
  'Tanzania', 'Rwanda', 'Ethiopia', 'Egypt', 'Morocco',
  'Senegal', 'Tunisia', 'Algeria', 'Botswana', 'Namibia',
  'Zimbabwe', 'Zambia', 'Angola', 'Mozambique', 'Madagascar'
]
