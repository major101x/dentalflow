import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

// Glassline buttons are flat: no shadows, no gradients. The single cobalt
// "primary" is the one reserved action per screen; everything else is
// secondary (outlined) or ghost (text).
const base =
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap rounded-md " +
  "transition-colors duration-200 cursor-pointer " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-neutral " +
  "disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-on-accent hover:bg-accent-hover",
  secondary: "bg-surface text-ink border border-border hover:bg-neutral",
  ghost: "text-muted hover:text-ink hover:bg-neutral",
};

// Sizes keep interactive targets at/above the 44px touch minimum where it matters.
const sizes: Record<ButtonSize, string> = {
  sm: "text-xs px-3 py-2",
  md: "text-sm px-5 py-2.5 min-h-[44px]",
  lg: "text-base px-6 py-3 min-h-[48px]",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export default function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return <button className={buttonVariants({ variant, size, className })} {...props} />;
}
