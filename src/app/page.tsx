import HomeClient from '@/components/custom/home-client';
import { getJobs, getFeaturedJobs } from '@/data/queries';

export const metadata = {
  title: "afritechjobs.com",
  description: "Find your next tech role in Africa. Browse thousands of jobs from Lagos to Cairo, Cape Town to Nairobi. Connect with top African companies and startups.",
  keywords: "African tech jobs, Nigeria jobs, South Africa jobs, Kenya jobs, startup jobs Africa, remote jobs Africa",
};

export const revalidate = 3600; // Revalidate every hour

export default async function Page() {
  // Load initial data on server
  const [{ data: featuredJobs }, { data: allJobs, count: totalJobs }] = await Promise.all([
    getFeaturedJobs(6),
    getJobs({}, 20, 0)
  ]);

  return (
    <HomeClient
      initialFeaturedJobs={featuredJobs || []}
      initialJobs={allJobs || []}
      initialJobCount={totalJobs}
    />
  );
}