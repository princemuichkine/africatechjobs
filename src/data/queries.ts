import { createClient } from "@/lib/supabase/server";

export async function getJobById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching job:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getFeaturedJobs(limit: number = 10) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .order('posted_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured jobs:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getJobsByCompany(companyId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('posted_at', { ascending: false });

  if (error) {
    console.error('Error fetching jobs by company:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getCompanyProfile(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching company profile:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getUserProfile(slug: string, currentUserId?: string) {
  const supabase = await createClient();

  const query = supabase
    .from('profiles')
    .select(`
      *,
      _count:follows!follows_following_id_fkey(count)
    `)
    .eq('slug', slug)
    .single();

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching user profile:', error);
    return { data: null, error };
  }

  // Check if current user is following this profile
  let isFollowing = false;
  if (currentUserId && data) {
    const { data: followData } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUserId)
      .eq('following_id', data.id)
      .single();

    isFollowing = !!followData;
  }

  return {
    data: {
      ...data,
      isFollowing,
      followersCount: data._count || 0,
    },
    error: null,
  };
}
