import AdvertiseClient from "@/components/custom/advertise-client";

export const metadata = {
  title: "Advertise",
  description:
    "Reach over 120,000 developers and operators monthly and showcase your role openings, products or services on our platform.",
  openGraph: {
    title: "Advertise on africatechjobs.xyz",
    description:
      "Reach over 120,000 developers and operators monthly and showcase your role openings, products or services on our platform.",
    type: "website",
    url: "https://africatechjobs.xyz/advertise",
    siteName: "africatechjobs.xyz",
  },
  twitter: {
    card: "summary_large_image",
    title: "Advertise on africatechjobs.xyz",
    description:
      "Reach over 120,000 developers and operators monthly and showcase your role openings, products or services on our platform.",
    creator: "@bm_diop",
  },
};

export default function Advertise() {
  return <AdvertiseClient />;
}
