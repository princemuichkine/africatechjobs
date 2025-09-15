export interface Rule {
  title: string;
  slug: string;
  description?: string;
  content?: string;
  // Add other rule properties as needed
}

export const rules: Rule[] = [
  // Placeholder rules - can be adapted for job board rules/terms
  {
    title: "Job Posting Guidelines",
    slug: "job-posting-guidelines",
    description: "Guidelines for posting jobs on Africa Tech Jobs",
  },
];
