"use client";

import { useOpenPanel } from "@openpanel/nextjs";
import { X } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function Banner() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const pathname = usePathname();
  const op = useOpenPanel();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCurrentBannerIndex(Math.floor(Math.random() * 2));
    setMounted(true);
  }, []);

  const [isAnimating, setIsAnimating] = useState(true); // Start as true
  const [animateDirection, setAnimateDirection] = useState<"up" | "down">("up");

  const banners = [
    {
      id: "lomi.",
      href: "https://lomi.africa",
      logo: mounted ? (
        <Image
          src={theme === 'dark' ? '/ads/transparent_l.webp' : '/ads/transparent_d.webp'}
          alt="lomi logo"
          width={32}
          height={28}
          className="absolute left-4 top-7"
        />
      ) : (
        <div className="absolute left-4 top-7 w-8 h-7 bg-muted animate-pulse rounded-sm" />
      ),
      title: "lomi.",
      description:
        "The open-source payment processing platform powering West-African businesses. ↗",
    }
  ];

  useEffect(() => {
    // Show banner after 2s delay on pathname change
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (!isVisible) return;

    // Initial animation up
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);

    const switchBanner = () => {
      setIsAnimating(true);
      setAnimateDirection("down");
      // Animate current banner down
      setTimeout(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
        setAnimateDirection("up");
        // Animate next banner up
        setTimeout(() => {
          setIsAnimating(false);
        }, 300);
      }, 300);
    };

    // Initial switch after 8 seconds
    const timer = setTimeout(switchBanner, 8000);

    // Set up recurring switches every 16 seconds
    const interval = setInterval(switchBanner, 16000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isVisible, banners.length]);

  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsAnimating(true);
    setAnimateDirection("down");
    setTimeout(() => {
      setIsVisible(false);
      setIsAnimating(false);
    }, 300);
  };

  const slideClass = isAnimating
    ? animateDirection === "down"
      ? "animate-out slide-out-to-bottom duration-300"
      : "animate-in slide-in-from-bottom-full duration-300"
    : "";

  const currentBanner = banners[currentBannerIndex];

  if (!isVisible || !mounted || !currentBanner) return null;

  // Hide banner on /generate page
  if (
    pathname === "/generate" ||
    pathname.includes("/games") ||
    pathname.includes("/board") ||
    pathname.endsWith("/new") ||
    pathname.endsWith("/edit")
  ) {
    return null;
  }

  return (
    <a
      href={currentBanner.href}
      target="_blank"
      rel="noreferrer"
      onClick={() => {
        try {
          // Play click sound
          const audio = new Audio('/sounds/light.mp3');
          audio.play().catch(() => {
            // Ignore audio play failures (user hasn't interacted with page yet, etc.)
          });
        } catch {
          // Ignore audio creation/play failures
        }

        op.track("banner_clicked", {
          banner_id: currentBanner.id,
          banner_url: currentBanner.href,
          type: "banner",
        });
      }}
    >
      <div
        className={`fixed overflow-hidden ${slideClass} z-50 bottom-4 md:bottom-4 left-4 md:left-auto right-4 md:right-4 w-[calc(100vw-32px)] md:w-auto md:max-w-[370px] border border-border p-4 transition-all bg-background h-[88px] rounded-sm group`}
      >
        {currentBanner.logo}

        <div className="flex justify-between">
          <div className="flex flex-col space-y-0.5 pl-[40px]">
            <div className="flex space-x-2 items-center">
              <span className="text-sm font-medium">{currentBanner.title}</span>
            </div>
            <p className="text-xs text-[#878787]">
              {currentBanner.description}
            </p>
          </div>

          <button
            type="button"
            className="absolute right-1.5 top-1.5 text-[#878787] hidden group-hover:block"
            onClick={handleClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </a>
  );
}
