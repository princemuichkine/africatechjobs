import { JobForm } from "@/components/forms/job";
import { GithubSignin } from "@/components/custom/github-signin";
import { GoogleSignin } from "@/components/custom/google-signin";
import { getSession } from "@/lib/supabase/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create a new listing",
  description:
    "Create a new job listing on afritechjobs.com and reach 200,000+ tech professionals today.",
};

export default async function Page() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 w-full max-w-sm mx-auto">
        <div className="max-w-md w-full text-center -mt-32">
          <p className="text-md mt-4">
            Sign in to post a job listing <br />
            and reach 200,000+ tech professionals today.
          </p>

          <div className="mt-10 flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <GithubSignin redirectTo="/jobs/new" />
              <GoogleSignin redirectTo="/jobs/new" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-sm xl:max-w-screen-sm border-t border-border pt-32 pb-16">
      <h1 className="text-2xl mb-4">Create a new job listing</h1>
      <JobForm />
    </div>
  );
}
