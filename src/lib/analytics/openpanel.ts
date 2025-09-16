import { OpenPanel } from '@openpanel/nextjs';

// Server-side OpenPanel instance for tracking server events
export const opServer = new OpenPanel({
  clientId: '2691c01c-2e94-4121-bf46-41864549fd12',
  clientSecret: 'sec_2efb4d856cb51cbe0d0d',
});

// Common event tracking functions
export const trackJobView = async (jobId: string, userId?: string) => {
  await opServer.track('job_viewed', {
    profileId: userId,
    job_id: jobId,
  });
};

export const trackJobApply = async (jobId: string, userId?: string) => {
  await opServer.track('job_applied', {
    profileId: userId,
    job_id: jobId,
  });
};

export const trackCompanyView = async (companyId: string, userId?: string) => {
  await opServer.track('company_viewed', {
    profileId: userId,
    company_id: companyId,
  });
};

export const trackJobPost = async (jobId: string, companyId: string, userId?: string) => {
  await opServer.track('job_posted', {
    profileId: userId,
    job_id: jobId,
    company_id: companyId,
  });
};

export const trackSearch = async (query: string, filters: Record<string, unknown>, userId?: string) => {
  await opServer.track('job_search', {
    profileId: userId,
    search_query: query,
    filters: filters,
  });
};

export const trackUserRegistration = async (userId: string, userType: 'job_seeker' | 'company') => {
  await opServer.track('user_registered', {
    profileId: userId,
    user_type: userType,
  });
};

export const trackAdClick = async (adId: string, userId?: string) => {
  await opServer.track('ad_clicked', {
    profileId: userId,
    ad_id: adId,
  });
};

export const trackAdView = async (adId: string, userId?: string) => {
  await opServer.track('ad_viewed', {
    profileId: userId,
    ad_id: adId,
  });
};
