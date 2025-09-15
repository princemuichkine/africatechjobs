"use client";

import { cn } from "@/lib/actions/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const navigationLinks = [
  { href: "/jobs", label: "Jobs" },
  { href: "/advertise", label: "Advertise" },
  { href: "/companies", label: "Companies" },
] as const;

export function Header() {
  const pathname = usePathname();

  return (
    <div className="flex justify-between items-center mt-2 md:mt-0">
      <div className="md:fixed z-20 flex justify-center items-center top-0 px-6 py-2 w-full bg-background backdrop-filter backdrop-blur-sm bg-opacity-30">
        <div className="flex items-center gap-5">
          {navigationLinks.map((link: { href: string; label: string }) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 text-sm font-medium",
                pathname === link.href
                  ? "text-primary"
                  : "text-[#878787]",
              )}
            >
              {link.label}
            </Link>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="rounded-sm"
            asChild
          >
            <Link href="/login">
              Sign In
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
