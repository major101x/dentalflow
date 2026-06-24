import { cn } from "@/lib/cn";

// Shared input styling: flat white field, hairline border, cobalt focus ring.
export const inputClass =
  "w-full bg-surface border border-border rounded-md px-3 py-2.5 text-sm text-ink " +
  "placeholder:text-muted/60 transition-colors duration-200 " +
  "focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent";

// Geist Mono micro-label paired with form controls.
export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("gl-label block mb-1.5", className)} {...props} />;
}
