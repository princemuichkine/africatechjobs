-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUMS (All custom types defined first)
-- =============================================

CREATE TYPE job_type AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP', 'APPRENTICESHIP');

CREATE TYPE experience_level AS ENUM ('ENTRY_LEVEL', 'JUNIOR', 'MID_LEVEL', 'SENIOR', 'EXECUTIVE');

CREATE TYPE scrape_status AS ENUM ('SUCCESS', 'PARTIAL_SUCCESS', 'FAILED');

CREATE TYPE job_category AS ENUM (
    'ENGINEERING', 'SALES', 'MARKETING', 'DATA', 'DEVOPS',
    'PRODUCT', 'DESIGN', 'CLOUD', 'SUPPORT',
    'MANAGEMENT', 'RESEARCH', 'LEGAL', 'FINANCE', 'OPERATIONS', 'PR', 'HR', 'OTHER'
);

CREATE TYPE company_size AS ENUM (
    '1_10', '11_50', '51_200', '201_1000', '1000_PLUS'
);

CREATE TYPE company_industry AS ENUM (
    'FINANCE', 'HEALTHCARE', 'EDUCATION', 'AGRITECH', 'E_COMMERCE', 'LOGISTICS',
    'REAL_ESTATE', 'INSURANCE', 'BANKING', 'PAYMENTS', 'INVESTMENT', 'BLOCKCHAIN',
    'AI', 'DATA', 'CYBERSECURITY', 'CLOUD', 'SOFTWARE',
    'CONSUMER', 'AGENCY',
    'MARKETPLACE', 'MEDIA', 'TELECOM', 'ENERGY', 'TRANSPORTATION', 'OTHER'
);

-- =============================================
-- CORE TABLES WITH CONSTRAINTS AND INDEXES
-- =============================================

-- Countries table for African countries
CREATE TABLE countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE, -- ISO 3166-1 alpha-2
    region TEXT NOT NULL, -- North, West, East, Central, Southern
    currency TEXT,
    timezone TEXT[],
    is_active BOOLEAN DEFAULT TRUE
);

-- Countries indexes
CREATE INDEX idx_countries_code ON countries(code);
CREATE INDEX idx_countries_region ON countries(region);

-- Cities table for major African tech hubs
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    country_id UUID NOT NULL REFERENCES countries(id),
    is_tech_hub BOOLEAN DEFAULT FALSE,
    UNIQUE(name, country_id)
);

-- Cities indexes
CREATE INDEX idx_cities_country_id ON cities(country_id);
CREATE INDEX idx_cities_is_tech_hub ON cities(is_tech_hub);

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    logo TEXT,
    website TEXT,
    industry company_industry,
    size company_size,
    city TEXT,
    country TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Generated columns
    name_search TEXT GENERATED ALWAYS AS (LOWER(TRIM(name))) STORED
);

-- Companies constraints
ALTER TABLE companies ADD CONSTRAINT companies_website_format_check
    CHECK (website IS NULL OR website ~ '^https?://');
ALTER TABLE companies ADD CONSTRAINT companies_name_length_check
    CHECK (LENGTH(TRIM(name)) >= 2 AND LENGTH(TRIM(name)) <= 100);

-- Companies indexes
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_country ON companies(country);
CREATE INDEX idx_companies_size ON companies(size);
CREATE INDEX idx_companies_name_search ON companies USING GIN(to_tsvector('english', name));

-- Jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    company_name TEXT NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    city TEXT,
    country TEXT NOT NULL,
    type job_type DEFAULT 'FULL_TIME',
    experience_level experience_level DEFAULT 'MID_LEVEL',
    salary TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    currency TEXT DEFAULT 'USD',
    remote BOOLEAN DEFAULT FALSE,
    is_sponsored BOOLEAN DEFAULT FALSE,
    url TEXT NOT NULL UNIQUE, -- External job URL (where users get redirected)
    source TEXT NOT NULL, -- Source platform (LinkedIn, Indeed, etc.)
    source_id TEXT, -- Original job ID from source
    posted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE,
    job_category job_category DEFAULT 'ENGINEERING',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Generated columns
    title_search TEXT GENERATED ALWAYS AS (LOWER(TRIM(title))) STORED
);

-- Jobs constraints
ALTER TABLE jobs ADD CONSTRAINT jobs_salary_range_check
    CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max);
ALTER TABLE jobs ADD CONSTRAINT jobs_posted_at_future_check
    CHECK (posted_at <= NOW() + INTERVAL '1 day'); -- Allow slight future dates for timezone issues
ALTER TABLE jobs ADD CONSTRAINT jobs_deadline_future_check
    CHECK (deadline IS NULL OR deadline >= posted_at);
ALTER TABLE jobs ADD CONSTRAINT jobs_title_length_check
    CHECK (LENGTH(TRIM(title)) >= 3 AND LENGTH(TRIM(title)) <= 200);
ALTER TABLE jobs ADD CONSTRAINT jobs_description_length_check
    CHECK (LENGTH(TRIM(description)) >= 10);

-- Jobs indexes
CREATE INDEX idx_jobs_is_active ON jobs(is_active);
CREATE INDEX idx_jobs_posted_at ON jobs(posted_at DESC);
CREATE INDEX idx_jobs_country ON jobs(country);
CREATE INDEX idx_jobs_type ON jobs(type);
CREATE INDEX idx_jobs_experience_level ON jobs(experience_level);
CREATE INDEX idx_jobs_remote ON jobs(remote);
CREATE INDEX idx_jobs_category ON jobs(job_category);
CREATE INDEX idx_jobs_source ON jobs(source);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_url ON jobs(url); -- For duplicate detection
CREATE INDEX idx_jobs_source_id ON jobs(source, source_id); -- For source tracking
CREATE INDEX idx_jobs_is_sponsored ON jobs(is_sponsored);
CREATE INDEX idx_jobs_active_country_category ON jobs(is_active, country, job_category) WHERE is_active = true;
CREATE INDEX idx_jobs_active_remote_posted ON jobs(is_active, remote, posted_at DESC) WHERE is_active = true;
CREATE INDEX idx_jobs_active_type_level ON jobs(is_active, type, experience_level) WHERE is_active = true;
CREATE INDEX idx_jobs_active_posted_category ON jobs(posted_at DESC, job_category) WHERE is_active = true;
CREATE INDEX idx_jobs_active_country_posted ON jobs(country, posted_at DESC) WHERE is_active = true;
CREATE INDEX idx_jobs_title_search ON jobs USING GIN(to_tsvector('english', title));
CREATE INDEX idx_jobs_description_search ON jobs USING GIN(to_tsvector('english', description));

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    status TEXT,
    work TEXT,
    website TEXT,
    social_x_link TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    location TEXT,
    country TEXT,
    phone TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    slug TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles constraints
ALTER TABLE profiles ADD CONSTRAINT profiles_website_format_check
    CHECK (website IS NULL OR website ~ '^https?://');
ALTER TABLE profiles ADD CONSTRAINT profiles_slug_format_check
    CHECK (slug IS NULL OR slug ~ '^[a-z0-9-]+$');

-- Profiles indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_slug ON profiles(slug);
CREATE INDEX idx_profiles_country ON profiles(country);
CREATE INDEX idx_profiles_is_public ON profiles(is_public);

-- =============================================
-- ANALYTICS & TRACKING TABLES
-- =============================================

-- Job scraping logs
CREATE TABLE scrape_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL,
    status scrape_status DEFAULT 'SUCCESS',
    jobs_found INTEGER DEFAULT 0,
    jobs_added INTEGER DEFAULT 0,
    jobs_updated INTEGER DEFAULT 0,
    jobs_skipped INTEGER DEFAULT 0,
    error TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Scrape logs indexes
CREATE INDEX idx_scrape_logs_started_at ON scrape_logs(started_at DESC);
CREATE INDEX idx_scrape_logs_status ON scrape_logs(status);
CREATE INDEX idx_scrape_logs_source ON scrape_logs(source);

-- Track job views for analytics
CREATE TABLE job_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ip_address INET,
    referrer TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id TEXT
);

-- Job views indexes
CREATE INDEX idx_job_views_job_id ON job_views(job_id);
CREATE INDEX idx_job_views_viewer_id ON job_views(viewer_id);
CREATE INDEX idx_job_views_viewed_at ON job_views(viewed_at DESC);

-- Company follows for user engagement
CREATE TABLE company_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    followed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, follower_id)
);

-- Company follows indexes
CREATE INDEX idx_company_follows_company_id ON company_follows(company_id);
CREATE INDEX idx_company_follows_follower_id ON company_follows(follower_id);

-- Job alerts for users
CREATE TABLE job_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    filters JSONB NOT NULL, -- Store search criteria
    is_active BOOLEAN DEFAULT TRUE,
    frequency TEXT DEFAULT 'daily', -- 'immediate', 'daily', 'weekly'
    last_sent TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job alerts constraints
ALTER TABLE job_alerts ADD CONSTRAINT job_alerts_frequency_check
    CHECK (frequency IN ('immediate', 'daily', 'weekly'));

-- Job alerts indexes
CREATE INDEX idx_job_alerts_user_id ON job_alerts(user_id);
CREATE INDEX idx_job_alerts_is_active ON job_alerts(is_active);
CREATE INDEX idx_job_alerts_filters ON job_alerts USING GIN(filters);

-- =============================================
-- ROLE CATEGORIZATION TABLES
-- =============================================

-- This table maps keywords found in job titles to a specific job category
-- It allows for a flexible, data-driven approach to categorizing jobs.
CREATE TABLE role_category_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword TEXT NOT NULL UNIQUE,
    category job_category NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role category mappings indexes
CREATE INDEX idx_role_category_mappings_keyword ON role_category_mappings(keyword);
