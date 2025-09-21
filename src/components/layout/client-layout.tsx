"use client";

import React from "react";
import { Banner } from "@/components/custom/banner";
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
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TranslationProvider } from "@/lib/contexts/translation-context";
import { Geist } from "next/font/google";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Client component to handle RTL support
function ClientLayout({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguageState] = React.useState("en");

  React.useEffect(() => {
    // Get initial language from localStorage
    const savedLanguage = localStorage.getItem("afritechjobs.language");
    if (savedLanguage) {
      setCurrentLanguageState(savedLanguage);
    }
  }, []);

  // Listen for language changes
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "afritechjobs.language" && e.newValue) {
        setCurrentLanguageState(e.newValue);
      }
    };

    // Also listen for custom language change events
    const handleLanguageChange = (e: CustomEvent) => {
      if (e.detail && e.detail.language) {
        setCurrentLanguageState(e.detail.language);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "languageChange",
      handleLanguageChange as EventListener,
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "languageChange",
        handleLanguageChange as EventListener,
      );
    };
  }, []);

  const isRTL = currentLanguage === "ar";

  return (
    <html
      lang={currentLanguage}
      dir={isRTL ? "rtl" : "ltr"}
      suppressHydrationWarning
      className={cn(
        "whitespace-pre-line antialiased bg-background text-foreground",
        geist.variable,
        isRTL ? "rtl" : "ltr",
      )}
    >
      <body className="overflow-x-hidden max-w-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TranslationProvider>
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
                  environment: process.env.NODE_ENV || "production",
                }}
              />
            </NuqsAdapter>
          </TranslationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

export default ClientLayout;
