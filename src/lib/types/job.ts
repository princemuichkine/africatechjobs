import { Database } from "./database";

// Base job type from database
export type Job = Database["public"]["Tables"]["jobs"]["Row"] & {
  company?: {
    id: string;
    name: string;
    logo?: string;
    website?: string;
  };
  tags?: string[];
  skills?: string[];
  // CamelCase aliases for easier access
  companyName?: string;
  experienceLevel?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  postedAt?: string;
};

// Job filters type
export type JobFilters = {
  search?: string;
  location?: string;
  country?: string;
  type?: string;
  experience?: string;
  remote?: boolean;
  salary_min?: number;
  salary_max?: number;
  tags?: string[];
  company?: string;
};

// Job types enum values
export const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Internship",
  "Temporary",
] as const;

export type JobType = (typeof JOB_TYPES)[number];

// Experience levels
export const EXPERIENCE_LEVELS = [
  "Entry Level",
  "Mid Level",
  "Senior Level",
  "Executive",
  "Not Specified",
] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

// African countries for location filtering
export const AFRICAN_COUNTRIES = [
  "Algeria",
  "Angola",
  "Benin",
  "Botswana",
  "Burkina Faso",
  "Burundi",
  "Cameroon",
  "Cape Verde",
  "Central African Republic",
  "Chad",
  "Comoros",
  "Congo",
  "Democratic Republic of the Congo",
  "Djibouti",
  "Egypt",
  "Equatorial Guinea",
  "Eritrea",
  "Eswatini",
  "Ethiopia",
  "Gabon",
  "Gambia",
  "Ghana",
  "Guinea",
  "Guinea-Bissau",
  "Ivory Coast",
  "Kenya",
  "Lesotho",
  "Liberia",
  "Libya",
  "Madagascar",
  "Malawi",
  "Mali",
  "Mauritania",
  "Mauritius",
  "Morocco",
  "Mozambique",
  "Namibia",
  "Niger",
  "Nigeria",
  "Rwanda",
  "Sao Tome and Principe",
  "Senegal",
  "Seychelles",
  "Sierra Leone",
  "Somalia",
  "South Africa",
  "South Sudan",
  "Sudan",
  "Tanzania",
  "Togo",
  "Tunisia",
  "Uganda",
  "Zambia",
  "Zimbabwe",
] as const;

export type AfricanCountry = (typeof AFRICAN_COUNTRIES)[number];

// Workplace types
export const WORKPLACE_TYPES = ["On site", "Remote", "Hybrid"] as const;

export type WorkplaceType = (typeof WORKPLACE_TYPES)[number];
