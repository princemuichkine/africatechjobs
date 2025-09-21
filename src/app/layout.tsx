import React from "react";
import "./globals.css";
import type { Metadata } from "next";
import ClientLayout from "@/components/layout/client-layout";

export const metadata: Metadata = {
  title: "afritechjobs.com",
  description:
    "Find your dream tech job in Africa. Connect with top companies and build your career in the growing African tech ecosystem.",
  metadataBase: new URL("https://afritechjobs.com"),
  icons: [
    {
      rel: "icon",
      url: "/favicon.ico",
    },
  ],
  openGraph: {
    title: "afritechjobs.com",
    description:
      "Find your dream tech job in Africa. Connect with top companies and build your career in the growing African tech ecosystem.",
    url: "https://afritechjobs.com",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 800,
        height: 600,
      },
    ],
  },
  twitter: {
    title: "afritechjobs.com",
    description:
      "Find your dream tech job in Africa. Connect with top companies and build your career in the growing African tech ecosystem.",
    images: [
      {
        url: "/og-image.png",
        width: 800,
        height: 600,
      },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    // { media: "(prefers-color-scheme: light)" },
    { media: "(prefers-color-scheme: dark)" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ClientLayout>{children}</ClientLayout>;
}
