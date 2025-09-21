"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

interface BackgroundTextProps {
  onClick?: () => void;
}

export function BackgroundText({ onClick }: BackgroundTextProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const imageSrc = resolvedTheme === "dark" ? "/tw.webp" : "/tb.webp";

  if (!mounted) {
    // Render a placeholder or null on the server and initial client render
    return null;
  }

  return (
    <div className="w-full overflow-hidden relative h-32 sm:h-40 md:h-48 lg:h-56 -mt-8 -mb-52 ml-28 lg:ml-[365px] pointer-events-none">
      <Image
        src={imageSrc}
        className="absolute inset-0 w-full h-full object-contain opacity-[0.04] select-none scale-110 sm:scale-125 md:scale-140 lg:scale-150"
        alt="Background image"
        width={1000}
        height={1000}
        priority={false}
      />
      {/* Clickable overlay if onClick is provided */}
      {onClick && (
        <div
          className="absolute inset-0 cursor-pointer z-10 pointer-events-auto"
          onClick={onClick}
        />
      )}
    </div>
  );
}
