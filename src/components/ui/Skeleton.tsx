import { cn } from "@/lib/cn";

// Flat Glassline skeleton block. Uses the border tone so it reads on both the
// neutral page and white cards. The global prefers-reduced-motion rule tames
// the pulse for motion-sensitive users.
export default function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-border", className)}
      {...props}
    />
  );
}
