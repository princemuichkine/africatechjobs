import { cn } from "@/lib/actions/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-sm bg-card", className)}
      {...props}
    />
  );
}

export { Skeleton };
