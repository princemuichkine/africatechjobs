// src/lib/scrapers/job-sources.ts
export const JOB_SOURCES = {
  // Pan-African Platforms
  JOBBERMAN: {
    name: 'Jobberman',
    countries: ['NG', 'GH', 'KE', 'UG'],
    api_endpoint: 'https://api.jobberman.com/v1/jobs',
    rate_limit: '100/hour',
    scraping_method: 'API'
  },
  
  BRIGHTERMONDAY: {
    name: 'BrighterMonday',
    countries: ['UG', 'KE', 'TZ', 'RW'],
    api_endpoint: 'https://www.brightermonday.com/api/jobs',
    rate_limit: '50/hour',
    scraping_method: 'API'
  },

  CAREERS24: {
    name: 'Careers24',
    countries: ['ZA', 'BW', 'NA', 'ZW'],
    api_endpoint: 'https://www.careers24.com/api/jobs',
    rate_limit: '200/hour',
    scraping_method: 'API'
  },

  // International with African presence
  LINKEDIN: {
    name: 'LinkedIn',
    countries: 'ALL_AFRICA',
    api_endpoint: 'https://api.linkedin.com/v2/jobs',
    rate_limit: '500/day',
    scraping_method: 'API',
    requires_partnership: true
  },

  INDEED: {
    name: 'Indeed',
    countries: ['ZA', 'NG', 'EG', 'KE', 'GH'],
    scraping_method: 'WEB_SCRAPING',
    rate_limit: '1000/day'
  },

  // Tech-specific
  ANGELLIST: {
    name: 'AngelList',
    countries: 'ALL_AFRICA',
    focus: 'STARTUPS',
    api_endpoint: 'https://api.angel.co/1/jobs',
    scraping_method: 'API'
  },

  REMOTE_AFRICA: {
    name: 'Remote Africa',
    countries: 'ALL_AFRICA',
    focus: 'REMOTE_JOBS',
    scraping_method: 'RSS_FEED'
  }
};