"use client";

import { voteAction } from "@/lib/actions/vote-action";
import { cn } from "@/lib/actions/utils";
import { LottieIcon } from '@/components/design/lottie-icon';
import { animations } from '@/lib/utils/lottie-animations';
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "@/components/ui/toast";

export function CopyButton({
  content,
  slug,
  small,
}: {
  content: string;
  slug: string;
  small?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const { execute } = useAction(voteAction);

  const handleCopy = () => {
    execute({ slug });
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast({ type: 'default', description: 'Copied to clipboard. Add a .cursorrules file to your project and paste the rule.' });

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
          animationData={animations.edit}
          size={small ? 12 : 16}
          loop={false}
          autoplay={false}
          initialFrame={0}
        />
      )}
    </button>
  );
}
