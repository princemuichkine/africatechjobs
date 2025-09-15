import { Startpage } from "@/components/custom/startpage";
import { getFeaturedJobs } from "@/data/queries";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Africa Tech Jobs - Find Your Dream Tech Job in Africa",
  description:
    "Discover amazing tech job opportunities across Africa. Connect with top companies and build your career in the growing African tech ecosystem.",
};

// Add force-static and revalidate configuration
export const dynamic = "force-static";
export const revalidate = 86400; // Revalidate once every day

export default async function Page() {
  const { data: featuredJobs } = await getFeaturedJobs(12);

  return <Startpage jobs={featuredJobs} />;
}
