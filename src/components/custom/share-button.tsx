"use client";

import { cn } from "@/lib/actions/utils";
import { LottieIcon } from "@/components/design/lottie-icon";
import { animations } from "@/lib/utils/lottie-animations";
import { useState } from "react";
import { toast } from "@/components/ui/toast";

export function ShareButton({
  slug,
  small,
}: {
  slug: string;
  small?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
    setCopied(true);
    toast({ type: "default", description: "URL copied to clipboard" });

    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "text-xs bg-black text-white dark:bg-white dark:text-black rounded-sm flex items-center justify-center",
        small ? "p-1.5 size-7" : "p-2 size-9",
      )}
      type="button"
    >
      {copied ? (
        <LottieIcon
          animationData={animations.checkmark}
          size={small ? 12 : 16}
          loop={false}
          autoplay={false}
          initialFrame={0}
        />
      ) : (
        <LottieIcon
          animationData={animations.link}
          size={small ? 12 : 16}
          loop={false}
          autoplay={false}
          initialFrame={0}
        />
      )}
    </button>
  );
}
