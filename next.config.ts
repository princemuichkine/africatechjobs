import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "twenty-icons.com",
      },
    ],
  },
};

export default nextConfig;
