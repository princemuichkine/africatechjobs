import { Database } from "./database";

// Base job type from database
export type Job = Database["public"]["Tables"]["jobs"]["Row"] & {
  company?: {
    id: string;
    name: string;
    logo?: string;
    website?: string;
    slug?: string;
    image?: string;
  };
  tags?: string[];
  skills?: string[];
  // CamelCase aliases for easier access
  companyName?: string;
  experienceLevel?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  postedAt?: string;
  workplace?: string;
  link?: string;
};

// Job filters type
export type JobFilters = {
  search?: string;
  city?: string;
  country?: string;
  type?: string;
  experience?: string;
  remote?: boolean;
  salary_min?: number;
  salary_max?: number;
  tags?: string[];
  company?: string;
};

// Job types, categories, experience levels, company sizes, and countries
// Consolidated from various components for better maintainability

export const JOB_CATEGORIES = [
  { value: "ENGINEERING", label: "Engineering" },
  { value: "SALES", label: "Sales" },
  { value: "MARKETING", label: "Marketing" },
  { value: "DATA", label: "Data" },
  { value: "DEVOPS", label: "DevOps" },
  { value: "PRODUCT", label: "Product" },
  { value: "DESIGN", label: "Design" },
  { value: "CLOUD", label: "Cloud" },
  { value: "SUPPORT", label: "Support" },
  { value: "MANAGEMENT", label: "Management" },
  { value: "RESEARCH", label: "Research" },
  { value: "LEGAL", label: "Legal" },
  { value: "FINANCE", label: "Finance" },
  { value: "OPERATIONS", label: "Operations" },
  { value: "PR", label: "PR" },
  { value: "HR", label: "HR" },
  { value: "OTHER", label: "Other" },
] as const;

export const JOB_TYPES = [
  { value: "FULL_TIME", label: "Full time" },
  { value: "PART_TIME", label: "Part time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "APPRENTICESHIP", label: "Apprenticeship" },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: "ENTRY_LEVEL", label: "Entry level" },
  { value: "JUNIOR", label: "Junior" },
  { value: "MID_LEVEL", label: "Mid level" },
  { value: "SENIOR", label: "Senior" },
  { value: "EXECUTIVE", label: "Executive" },
] as const;

export const COMPANY_SIZES = [
  { value: "1_10", label: "1-10 employees" },
  { value: "11_50", label: "11-50 employees" },
  { value: "51_200", label: "51-200 employees" },
  { value: "201_1000", label: "201-1000 employees" },
  { value: "1000_PLUS", label: "1000+ employees" },
] as const;

export const AFRICAN_COUNTRIES = [
  { value: "Algeria", label: "Algeria" },
  { value: "Angola", label: "Angola" },
  { value: "Benin", label: "Benin" },
  { value: "Botswana", label: "Botswana" },
  { value: "Burkina Faso", label: "Burkina Faso" },
  { value: "Burundi", label: "Burundi" },
  { value: "Cameroon", label: "Cameroon" },
  { value: "Cape Verde", label: "Cape Verde" },
  { value: "Central African Republic", label: "Central African Republic" },
  { value: "Chad", label: "Chad" },
  { value: "Comoros", label: "Comoros" },
  { value: "Congo", label: "Congo" },
  {
    value: "Democratic Republic of Congo",
    label: "Democratic Republic of Congo",
  },
  { value: "Djibouti", label: "Djibouti" },
  { value: "Egypt", label: "Egypt" },
  { value: "Equatorial Guinea", label: "Equatorial Guinea" },
  { value: "Eritrea", label: "Eritrea" },
  { value: "Eswatini", label: "Eswatini" },
  { value: "Ethiopia", label: "Ethiopia" },
  { value: "Gabon", label: "Gabon" },
  { value: "Gambia", label: "Gambia" },
  { value: "Ghana", label: "Ghana" },
  { value: "Guinea", label: "Guinea" },
  { value: "Guinea-Bissau", label: "Guinea-Bissau" },
  { value: "Ivory Coast", label: "Ivory Coast" },
  { value: "Kenya", label: "Kenya" },
  { value: "Lesotho", label: "Lesotho" },
  { value: "Liberia", label: "Liberia" },
  { value: "Libya", label: "Libya" },
  { value: "Madagascar", label: "Madagascar" },
  { value: "Malawi", label: "Malawi" },
  { value: "Mali", label: "Mali" },
  { value: "Mauritania", label: "Mauritania" },
  { value: "Mauritius", label: "Mauritius" },
  { value: "Morocco", label: "Morocco" },
  { value: "Mozambique", label: "Mozambique" },
  { value: "Namibia", label: "Namibia" },
  { value: "Niger", label: "Niger" },
  { value: "Nigeria", label: "Nigeria" },
  { value: "Rwanda", label: "Rwanda" },
  { value: "Sao Tome and Principe", label: "Sao Tome and Principe" },
  { value: "Senegal", label: "Senegal" },
  { value: "Seychelles", label: "Seychelles" },
  { value: "Sierra Leone", label: "Sierra Leone" },
  { value: "Somalia", label: "Somalia" },
  { value: "South Africa", label: "South Africa" },
  { value: "South Sudan", label: "South Sudan" },
  { value: "Sudan", label: "Sudan" },
  { value: "Tanzania", label: "Tanzania" },
  { value: "Togo", label: "Togo" },
  { value: "Tunisia", label: "Tunisia" },
  { value: "Uganda", label: "Uganda" },
  { value: "Zambia", label: "Zambia" },
  { value: "Zimbabwe", label: "Zimbabwe" },
] as const;

// Job category keywords mapping for LinkedIn scraping
export const JOB_CATEGORY_KEYWORDS = {
  ENGINEERING: [
    "Software Engineer",
    "Backend Developer",
    "Frontend Developer",
    "Full Stack Developer",
    "Mobile Developer",
    "iOS Developer",
    "Android Developer",
    "React Developer",
    "Node.js Developer",
    "Python Developer",
    "Java Developer",
    "C# Developer",
    "Go Developer",
    "Rust Developer",
    "TypeScript Developer",
    "JavaScript Developer",
    "Web Developer",
    "API Developer",
    "System Engineer",
    "Application Developer",
  ],
  SALES: [
    "Sales Representative",
    "Account Executive",
    "Business Development",
    "Sales Manager",
    "Sales Director",
    "Sales Consultant",
    "Sales Specialist",
    "Sales Engineer",
    "Technical Sales",
    "Inside Sales",
    "Outside Sales",
  ],
  MARKETING: [
    "Marketing Manager",
    "Marketing Coordinator",
    "Digital Marketing",
    "Content Marketing",
    "Social Media Marketing",
    "SEO Specialist",
    "Marketing Analyst",
    "Brand Manager",
    "Product Marketing",
    "Growth Marketing",
  ],
  DATA: [
    "Data Scientist",
    "Data Engineer",
    "Data Analyst",
    "Machine Learning Engineer",
    "AI Engineer",
    "Data Architect",
    "Business Intelligence Analyst",
    "Data Specialist",
    "Analytics Engineer",
    "ML Engineer",
    "AI Specialist",
  ],
  DEVOPS: [
    "DevOps Engineer",
    "Site Reliability Engineer",
    "Platform Engineer",
    "Infrastructure Engineer",
    "CI/CD Engineer",
    "DevOps Specialist",
    "Release Engineer",
    "Build Engineer",
    "Automation Engineer",
  ],
  PRODUCT: [
    "Product Manager",
    "Product Owner",
    "Technical Product Manager",
    "Product Analyst",
    "Associate Product Manager",
    "Senior Product Manager",
    "Product Director",
    "VP Product",
    "Head of Product",
  ],
  DESIGN: [
    "UI/UX Designer",
    "Product Designer",
    "UX Researcher",
    "Interaction Designer",
    "Visual Designer",
    "Graphic Designer",
    "UX Designer",
    "UI Designer",
    "Design System",
    "User Experience",
    "User Interface",
  ],
  CLOUD: [
    "Cloud Engineer",
    "AWS Engineer",
    "Azure Engineer",
    "GCP Engineer",
    "Cloud Architect",
    "Cloud Consultant",
    "Cloud Solutions Architect",
    "Kubernetes Engineer",
    "Docker Engineer",
    "Cloud Security Engineer",
  ],
  SUPPORT: [
    "Technical Support Engineer",
    "Customer Success Engineer",
    "Support Specialist",
    "Customer Support",
    "Technical Support",
    "Help Desk",
    "IT Support",
    "Customer Success Manager",
    "Client Success",
    "Support Engineer",
  ],
  MANAGEMENT: [
    "Engineering Manager",
    "Technical Lead",
    "VP Engineering",
    "CTO",
    "Director of Engineering",
    "Head of Engineering",
    "Team Lead",
    "Project Manager",
    "Program Manager",
    "Delivery Manager",
  ],
  RESEARCH: [
    "Research Scientist",
    "Applied Scientist",
    "Research Engineer",
    "Research Analyst",
    "R&D Engineer",
    "Research Associate",
    "Principal Scientist",
    "Senior Research Scientist",
  ],
  LEGAL: [
    "Legal Counsel",
    "Corporate Lawyer",
    "Legal Advisor",
    "Compliance Officer",
    "Legal Specialist",
    "Contract Manager",
    "Legal Manager",
    "General Counsel",
  ],
  FINANCE: [
    "Financial Analyst",
    "Finance Manager",
    "Financial Controller",
    "FP&A Analyst",
    "Financial Planning",
    "Budget Analyst",
    "Finance Director",
    "Chief Financial Officer",
    "Financial Operations",
  ],
  OPERATIONS: [
    "Operations Manager",
    "Operations Analyst",
    "Business Operations",
    "Operations Director",
    "Chief Operating Officer",
    "Operations Specialist",
    "Process Manager",
    "Operations Coordinator",
  ],
  PR: [
    "Public Relations",
    "PR Manager",
    "Communications Manager",
    "PR Specialist",
    "Media Relations",
    "Corporate Communications",
    "PR Coordinator",
    "Communications Director",
  ],
  HR: [
    "Human Resources",
    "HR Manager",
    "Talent Acquisition",
    "Recruiter",
    "HR Business Partner",
    "People Operations",
    "HR Director",
    "Chief Human Resources Officer",
    "Talent Manager",
  ],
  OTHER: [
    "Consultant",
    "Advisor",
    "Strategist",
    "Coordinator",
    "Administrator",
    "Specialist",
    "Associate",
    "Director",
    "VP",
    "Chief Officer",
  ],
} as const;

// Type definitions
export type JobCategoryValue = (typeof JOB_CATEGORIES)[number]["value"];
export type JobTypeValue = (typeof JOB_TYPES)[number]["value"];
export type ExperienceLevelValue = (typeof EXPERIENCE_LEVELS)[number]["value"];
export type CompanySizeValue = (typeof COMPANY_SIZES)[number]["value"];
export type AfricanCountryValue = (typeof AFRICAN_COUNTRIES)[number]["value"];

export type JobCategory = (typeof JOB_CATEGORIES)[number];
export type JobType = (typeof JOB_TYPES)[number];
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
export type CompanySize = (typeof COMPANY_SIZES)[number];
export type AfricanCountry = (typeof AFRICAN_COUNTRIES)[number];

// Type for job category keywords (used in scraping)
export type JobCategoryKeywords = keyof typeof JOB_CATEGORY_KEYWORDS;

// Legacy type aliases for backward compatibility
export type JobTypeLegacy = (typeof JOB_TYPES)[number]["label"];
export type ExperienceLevelLegacy = (typeof EXPERIENCE_LEVELS)[number]["label"];

// Workplace types
export const WORKPLACE_TYPES = ["On site", "Remote", "Hybrid"] as const;

export type WorkplaceType = (typeof WORKPLACE_TYPES)[number];
