import { cn } from "@/lib/cn";

// Flat Glassline surface: white card, hairline border, generous radius.
// `interactive` adds a restrained, shadow-free hover (border + lift) for
// cards that are themselves links/actions.
export const cardClass = "bg-surface rounded-lg border border-border";

export const interactiveCardClass = cn(
  cardClass,
  "transition-colors duration-200 hover:border-accent/40 hover:bg-[#fbfcfe]"
);

export default function Card({
  interactive = false,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(interactive ? interactiveCardClass : cardClass, className)}
      {...props}
    />
  );
}
