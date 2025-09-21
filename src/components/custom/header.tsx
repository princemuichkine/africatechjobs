"use client";

import { cn } from "@/lib/actions/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/custom/auth-modal";

const navigationLinks = [
  { href: "/", label: "Jobs" },
  { href: "/advertise", label: "Advertise" },
] as const;

export function Header() {
  const pathname = usePathname();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

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
    <div className="flex justify-between items-center mt-2 md:mt-0">
      <div className="md:fixed z-20 flex justify-end items-center top-0 px-6 py-2 left-0 right-0 bg-background backdrop-filter backdrop-blur-sm bg-opacity-30">
        <div className="flex items-center gap-5">
          {navigationLinks.map((link: { href: string; label: string }) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={playClickSound}
              className={cn(
                "flex items-center gap-2 text-sm font-medium",
                pathname === link.href ? "text-primary" : "text-[#878787]",
              )}
            >
              {link.label}
            </Link>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="rounded-sm"
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
    </div>
  );
}
