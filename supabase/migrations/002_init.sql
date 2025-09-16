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

-- =============================================
-- ADDITIONAL SECURITY CONFIGURATIONS
-- =============================================

-- Create a function to check if user is admin
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

-- =============================================
-- PERFORMANCE & MAINTENANCE
-- =============================================

-- Create a function to clean old job views (for GDPR compliance and performance)
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

-- Create a function to get job statistics
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
