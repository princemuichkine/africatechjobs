import JobDetailsClient from "@/components/custom/job-details-client";
import { getJobByIdServer } from "@/data/server-queries";
import { notFound } from "next/navigation";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const { data: job } = await getJobByIdServer(id);

  if (!job) {
    return {
      title: "Job Not Found",
    };
  }

  return {
    title: `${job.title} at ${job.companyName || job.company_name}`,
    description:
      job.description?.slice(0, 160) || `View job details for ${job.title}`,
  };
}

export default async function JobDetailsPage({ params }: { params: Params }) {
  const { id } = await params;
  const { data: job } = await getJobByIdServer(id);

  if (!job) {
    notFound();
  }

  return <JobDetailsClient job={job} />;
}
