-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql' SET search_path = public;

-- Function to automatically categorize jobs based on title keywords
CREATE OR REPLACE FUNCTION auto_categorize_job()
RETURNS TRIGGER AS $$
DECLARE
    job_title TEXT;
    matching_category job_category;
BEGIN
    job_title := LOWER(TRIM(NEW.title));

    -- Try to find matching category from role_category_mappings
    SELECT category INTO matching_category
    FROM role_category_mappings
    WHERE job_title LIKE '%' || keyword || '%'
    ORDER BY LENGTH(keyword) DESC -- Prefer longer, more specific keywords
    LIMIT 1;

    -- If found, use it; otherwise keep default
    IF matching_category IS NOT NULL THEN
        NEW.job_category := matching_category;
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql' SET search_path = public;

-- Function to validate URL format
CREATE OR REPLACE FUNCTION is_valid_url(url TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN url IS NULL OR url ~ '^https?://[^\s/$.?#].[^\s]*$';
END;
$$ language 'plpgsql' SET search_path = public;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if current user is admin based on email domain or verified status
    RETURN (
        auth.jwt() ->> 'role' = 'service_role' OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND (
                email LIKE '%@afritechjobs.com' OR
                is_verified = true
            )
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get current user's profile
CREATE OR REPLACE FUNCTION get_current_user_profile()
RETURNS profiles AS $$
DECLARE
    user_profile profiles;
BEGIN
    SELECT * INTO user_profile
    FROM profiles
    WHERE id = auth.uid();

    RETURN user_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to increment job view count (for analytics)
CREATE OR REPLACE FUNCTION increment_job_view(
    job_uuid UUID,
    viewer_uuid UUID DEFAULT NULL,
    user_ip INET DEFAULT NULL,
    referrer_url TEXT DEFAULT NULL,
    session_uuid TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO job_views (job_id, viewer_id, ip_address, referrer, session_id)
    VALUES (job_uuid, viewer_uuid, user_ip, referrer_url, session_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to follow/unfollow a company
CREATE OR REPLACE FUNCTION toggle_company_follow(company_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_following BOOLEAN;
BEGIN
    -- Check if already following
    SELECT EXISTS (
        SELECT 1 FROM company_follows
        WHERE company_id = company_uuid
        AND follower_id = auth.uid()
    ) INTO is_following;

    IF is_following THEN
        -- Unfollow
        DELETE FROM company_follows
        WHERE company_id = company_uuid
        AND follower_id = auth.uid();
        RETURN false;
    ELSE
        -- Follow
        INSERT INTO company_follows (company_id, follower_id)
        VALUES (company_uuid, auth.uid());
        RETURN true;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to clean old job views (for GDPR compliance and performance)
CREATE OR REPLACE FUNCTION cleanup_old_job_views(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM job_views
    WHERE viewed_at < NOW() - INTERVAL '1 day' * days_old;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get job statistics
CREATE OR REPLACE FUNCTION get_job_stats()
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_jobs', (SELECT COUNT(*) FROM jobs WHERE is_active = true),
        'total_companies', (SELECT COUNT(*) FROM companies),
        'jobs_by_country', (
            SELECT json_object_agg(country, job_count)
            FROM (
                SELECT country, COUNT(*) as job_count
                FROM jobs
                WHERE is_active = true
                GROUP BY country
            ) country_stats
        ),
        'jobs_by_category', (
            SELECT json_object_agg(job_category, job_count)
            FROM (
                SELECT job_category, COUNT(*) as job_count
                FROM jobs
                WHERE is_active = true
                GROUP BY job_category
            ) category_stats
        ),
        'remote_jobs_percentage', (
            SELECT ROUND(
                (COUNT(*) FILTER (WHERE remote = true) * 100.0) /
                NULLIF(COUNT(*), 0), 2
            )
            FROM jobs
            WHERE is_active = true
        )
    ) INTO stats;

    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get job statistics for analytics
CREATE OR REPLACE FUNCTION get_job_stats_by_country(country_name TEXT DEFAULT NULL)
RETURNS TABLE (
    country TEXT,
    total_jobs BIGINT,
    active_jobs BIGINT,
    remote_jobs BIGINT,
    avg_days_old NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        j.country,
        COUNT(*) as total_jobs,
        COUNT(*) FILTER (WHERE j.is_active = true) as active_jobs,
        COUNT(*) FILTER (WHERE j.remote = true) as remote_jobs,
        ROUND(AVG(j.days_since_posted), 1) as avg_days_old
    FROM jobs j
    WHERE (country_name IS NULL OR j.country = country_name)
    GROUP BY j.country
    ORDER BY active_jobs DESC;
END;
$$ language 'plpgsql' SET search_path = public;

-- Function to deactivate jobs older than a specified number of days
CREATE OR REPLACE FUNCTION deactivate_old_jobs(days_old INTEGER DEFAULT 21)
RETURNS INTEGER AS $$
DECLARE
    deactivated_count INTEGER;
BEGIN
    WITH deactivated_jobs AS (
        UPDATE jobs
        SET is_active = false, updated_at = NOW()
        WHERE posted_at < (NOW() - INTERVAL '1 day' * days_old) AND is_active = true
        RETURNING id
    )
    SELECT COUNT(*) INTO deactivated_count FROM deactivated_jobs;

    RETURN deactivated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to clean up old job views (GDPR compliance)
CREATE OR REPLACE FUNCTION cleanup_old_data(days_to_keep INTEGER DEFAULT 90)
RETURNS TABLE (
    job_views_deleted BIGINT,
    old_jobs_deactivated BIGINT
) AS $$
DECLARE
    cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
    cutoff_date := NOW() - INTERVAL '1 day' * days_to_keep;

    -- Delete old job views
    WITH deleted_views AS (
        DELETE FROM job_views
        WHERE viewed_at < cutoff_date
        RETURNING id
    )
    SELECT COUNT(*) INTO job_views_deleted FROM deleted_views;

    -- Deactivate very old jobs (keep for 1 year)
    WITH deactivated_jobs AS (
        UPDATE jobs
        SET is_active = false, updated_at = NOW()
        WHERE posted_at < (NOW() - INTERVAL '1 year') AND is_active = true
        RETURNING id
    )
    SELECT COUNT(*) INTO old_jobs_deactivated FROM deactivated_jobs;

    RETURN QUERY SELECT job_views_deleted, old_jobs_deactivated;
END;
$$ language 'plpgsql' SET search_path = public;

-- Function to find duplicate jobs based on title and company
CREATE OR REPLACE FUNCTION find_duplicate_jobs()
RETURNS TABLE (
    job_id UUID,
    duplicate_id UUID,
    title TEXT,
    company_name TEXT,
    similarity_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        j1.id as job_id,
        j2.id as duplicate_id,
        j1.title,
        j1.company_name,
        (1 - (LEVENSHTEIN(LOWER(j1.title), LOWER(j2.title))::NUMERIC /
              GREATEST(LENGTH(j1.title), LENGTH(j2.title)))) * 100 as similarity_score
    FROM jobs j1
    JOIN jobs j2 ON j1.company_name = j2.company_name
                   AND j1.id < j2.id
                   AND j1.is_active = true
                   AND j2.is_active = true
    WHERE LEVENSHTEIN(LOWER(j1.title), LOWER(j2.title)) <= 3
      AND LENGTH(j1.title) > 10;
END;
$$ language 'plpgsql' SET search_path = public;

-- Enable the pg_trgm extension for fuzzy string matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Function to find jobs with similar titles and company names within a date range
CREATE OR REPLACE FUNCTION find_similar_jobs(
    comp_name TEXT,
    job_title TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ
)
RETURNS TABLE (id UUID, title TEXT, company_name TEXT, similarity REAL)
AS $$
BEGIN
    RETURN QUERY
    SELECT
        j.id,
        j.title,
        j.company_name,
        similarity(j.title, job_title) AS similarity
    FROM
        jobs j
    WHERE
        j.company_name = comp_name
        AND j.posted_at BETWEEN start_date AND end_date
        AND similarity(j.title, job_title) > 0.6 -- Adjust similarity threshold as needed
    ORDER BY
        similarity DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS
-- =============================================

-- Apply update triggers to relevant tables
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_role_category_mappings_updated_at BEFORE UPDATE ON role_category_mappings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-categorize jobs on insert/update
CREATE TRIGGER auto_categorize_job_trigger BEFORE INSERT OR UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION auto_categorize_job();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on sensitive tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_views ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES POLICIES
-- =============================================

-- Users can view public profiles or their own profile
CREATE POLICY "Users can view profiles" ON profiles
    FOR SELECT USING (is_public = true OR (select auth.uid()) = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING ((select auth.uid()) = id);

-- Users can insert their own profile (for new user registration)
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK ((select auth.uid()) = id);

-- =============================================
-- JOB ALERTS POLICIES
-- =============================================

-- Users can manage their own job alerts
CREATE POLICY "Users can manage own job alerts" ON job_alerts
    FOR ALL USING ((select auth.uid()) = user_id);

-- =============================================
-- COMPANY FOLLOWS POLICIES
-- =============================================

-- Users can view and manage their own company follows
CREATE POLICY "Users can manage own follows" ON company_follows
    FOR ALL USING ((select auth.uid()) = follower_id);

-- Note: Analytics should use aggregate functions with service role or bypass RLS

-- =============================================
-- JOB VIEWS POLICIES
-- =============================================

-- Users can view their own job view history
CREATE POLICY "Users can view own job views" ON job_views
    FOR SELECT USING ((select auth.uid()) = viewer_id);

-- System can insert job views (for analytics tracking)
CREATE POLICY "System can insert job views" ON job_views
    FOR INSERT WITH CHECK (true);

-- =============================================
-- PUBLIC ACCESS POLICIES
-- =============================================

-- Jobs table - public read access (main job board functionality)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active jobs" ON jobs
    FOR SELECT USING (is_active = true);

-- Companies table - public read access
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view companies" ON companies
    FOR SELECT USING (true);

-- Countries and cities - public read access
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view countries" ON countries
    FOR SELECT USING (is_active = true);

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view cities" ON cities
    FOR SELECT USING (true);

-- =============================================
-- ADMIN/SYSTEM POLICIES
-- =============================================

-- Scrape logs - restricted to system/admin users
ALTER TABLE scrape_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "System can manage scrape logs" ON scrape_logs
    FOR ALL USING (
        -- Allow if user has admin role or is service role
        (select auth.jwt()) ->> 'role' = 'service_role' OR
        ((select auth.uid()) IS NOT NULL AND
         EXISTS (
             SELECT 1 FROM profiles
             WHERE id = (select auth.uid())
             AND (
                 email LIKE '%@afritechjobs.com' OR
                 is_verified = true
             )
         ))
    );