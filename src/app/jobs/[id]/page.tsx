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

  const companyName =
    job.companyName || (job as { company_name?: string }).company_name;
  const title = `${job.title} at ${companyName}`;
  const description =
    job.description?.slice(0, 160) || `View job details for ${job.title}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://africatechjobs.xyz/jobs/${id}`,
      siteName: "africatechjobs.xyz",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@bm_diop",
    },
    other: {
      "article:author": companyName,
      "article:published_time": job.postedAt?.toISOString(),
    },
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
