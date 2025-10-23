"use client";

import { cn } from "@/lib/actions/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/custom/auth-modal";

const navigationLinks = [
  { href: "/", label: "Jobs" },
  { href: "/advertise", label: "Advertise" },
] as const;

export function Header() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const playClickSound = () => {
    if (typeof window !== "undefined") {
      try {
        const audio = new Audio("/sounds/light.mp3");
        audio.volume = 0.4;
        void audio.play().catch(() => {
          // Silently handle audio play errors (autoplay policies, etc.)
        });
      } catch {
        // Ignore audio creation errors
      }
    }
  };

  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
  };

  return (
    <>
      <div className="md:fixed z-20 flex justify-between items-center top-0 px-4 md:px-6 py-4 left-0 right-0 bg-background backdrop-filter backdrop-blur-sm bg-opacity-30">
        {/* Logo - Hidden on mobile/tablet, visible on desktop */}
        <Link href="/" className="hidden md:flex items-center">
          {mounted ? (
            <Image
              src={theme === "dark" ? "/africatechjobs_w.png" : "/africatechjobs_b.png"}
              alt="Africa Tech Jobs"
              width={323}
              height={67}
              className="h-8 w-auto"
              priority
            />
          ) : (
            <div className="h-8 w-32 bg-muted rounded-sm" />
          )}
        </Link>

        <div className="flex items-center gap-3 md:gap-5 -translate-x-1">
          {navigationLinks.map((link: { href: string; label: string }) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={playClickSound}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-zinc-900 dark:text-white"
                  : "text-[#878787]",
              )}
            >
              {link.label}
            </Link>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="rounded-sm px-3 md:px-4"
            onClick={() => {
              playClickSound();
              setAuthModalOpen(true);
            }}
          >
            Sign in
          </Button>
        </div>
      </div>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        mode={authMode}
        onModeChange={setAuthMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
}
