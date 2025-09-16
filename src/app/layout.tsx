import { Banner } from "@/components/custom/banner";
import "./globals.css";
import { Footer } from "@/components/custom/footer";
import { Header } from "@/components/custom/header";
import { GlobalModals } from "@/components/modals/global-modals";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import SoundGateInit from "@/components/ui/sound-gate-init";
import { UserIdentifier } from "@/components/analytics/user-identifier";
import { CustomScrollbar } from "@/components/ui/custom-scrollbar";
import { cn } from "@/lib/actions/utils";
import { OpenPanelComponent } from "@openpanel/nextjs";
import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

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
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "whitespace-pre-line antialiased bg-background text-foreground",
        geist.variable,
      )}
    >
      <body className="overflow-x-hidden max-w-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <NuqsAdapter>
            <CustomScrollbar className="h-screen">
              <Header />
              {children}

              <a
                href="https://github.com/princemuichkine/afritechjobs"
                target="_blank"
                rel="noreferrer"
              >
                <Button
                  className="hidden size-[48px] bg-[#F5F5F3]/30 text-black border border-black rounded-sm font-medium fixed bottom-4 left-6 z-10 backdrop-blur-lg dark:bg-[#F5F5F3]/30 dark:text-white dark:border-white"
                  variant="outline"
                  size="icon"
                >
                  <PlusIcon className="w-4 h-4" />
                </Button>
              </a>

              <Banner />
              <Footer />
            </CustomScrollbar>
            <Toaster />
            <GlobalModals />
            <UserIdentifier />
            <SoundGateInit />
            <OpenPanelComponent
              clientId="2691c01c-2e94-4121-bf46-41864549fd12"
              apiUrl="/api/op"
              trackScreenViews={true}
              trackOutgoingLinks={true}
              trackAttributes={true}
              disabled={process.env.NODE_ENV === "development"}
              globalProperties={{
                platform: "web",
                app_version: "0.1.0",
                environment: process.env.NODE_ENV || "production"
              }}
            />
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  );
}
