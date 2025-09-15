import { Banner } from "@/components/custom/banner";
import "./globals.css";
import { Header } from "@/components/custom/header";
import { GlobalModals } from "@/components/modals/global-modals";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/actions/utils";
import { OpenPanelComponent } from "@openpanel/nextjs";
import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export const metadata: Metadata = {
  title: "Africa Tech Jobs",
  description:
    "Find your dream tech job in Africa. Connect with top companies and build your career in the growing African tech ecosystem.",
  icons: [
    {
      rel: "icon",
      url: "/favicon.ico",
    },
  ],
  openGraph: {
    title: "Africa Tech Jobs",
    description:
      "Find your dream tech job in Africa. Connect with top companies and build your career in the growing African tech ecosystem.",
    url: "https://africatechjobs.com",
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
    title: "Africa Tech Jobs",
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
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "whitespace-pre-line antialiased bg-background text-foreground !dark font-sans",
      )}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NuqsAdapter>
            <Header />
            {children}

            <a
              href="https://github.com/yourusername/africatechjobs"
              target="_blank"
              rel="noreferrer"
            >
              <Button
                className="hidden size-[48px] bg-[#F5F5F3]/30 text-black border border-black rounded-full font-medium fixed bottom-4 left-6 z-10 backdrop-blur-lg dark:bg-[#F5F5F3]/30 dark:text-white dark:border-white"
                variant="outline"
                size="icon"
              >
                <PlusIcon className="w-4 h-4" />
              </Button>
            </a>

            <Banner />
            <Toaster />
            <GlobalModals />
          </NuqsAdapter>
        </ThemeProvider>
      </body>

      <OpenPanelComponent
        clientId={process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID!}
        trackScreenViews
        disabled={process.env.NODE_ENV === "development"}
      />
    </html>
  );
}
