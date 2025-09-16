import { JobsFeatured } from "@/components/jobs/jobs-featured";
import { JobList } from "@/components/jobs/job-list";
import { getFeaturedJobs } from "@/data/queries";
import Link from "next/link";

export const metadata = {
  title: "Jobs",
  description: "Find your next job with afritechjobs.com",
};

export const revalidate = 3600;

export default async function Page() {
  const { data: featuredJobs } = await getFeaturedJobs();

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12 md:mt-24 pb-32">
      <h1 className="text-xl mb-2">Featured jobs in Africa</h1>
      <p className="text-sm text-[#878787] mb-8">
        Browse positions or{" "}
        <Link href="/jobs/new" className="border-b border-border border-dashed">
          post a job to reach 200,000+ monthly active tech professionals
        </Link>
        .
      </p>

      <JobsFeatured data={featuredJobs} />
      <JobList />
    </div>
  );
}
