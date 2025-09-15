import { JobsCard } from "@/components/jobs/jobs-card";
import { getJobsByCompany } from "@/data/queries";
import type { Tables } from "@/lib/types/database";

type Job = Tables<'jobs'>;

export async function CompanyJobs({ slug }: { slug: string }) {
  // For now, we'll use the slug as the company ID
  // In a real implementation, you'd look up the company by slug first
  const { data } = await getJobsByCompany(slug);

  if (!data) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="mt-10">Jobs</p>
      {data?.map((job: Job) => (
        <JobsCard
          key={job.id}
          data={{
            id: job.id,
            owner_id: '', // Not available in our current schema
            title: job.title,
            company: {
              name: job.company_name,
              image: '', // Not available in our current schema
              slug: job.company_name.toLowerCase().replace(/\s+/g, '-'), // Generate slug from company name
            },
            location: job.location,
            description: job.description,
            created_at: job.created_at || new Date().toISOString(),
            link: job.url,
            workplace: job.remote ? 'Remote' : 'On-site',
            experience: job.experience_level || 'Not specified',
          }}
        />
      ))}
    </div>
  );
}
