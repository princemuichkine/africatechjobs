export interface Ad {
  id: string;
  title: string;
  description: string;
  link: string;
  logoUrl: string;
}

export const ads: Ad[] = [
  {
    id: "1",
    title: "Sample Company",
    description: "Join our team and build the future of tech in Africa.",
    link: "https://example.com",
    logoUrl: "/placeholder-logo.png",
  },
];
