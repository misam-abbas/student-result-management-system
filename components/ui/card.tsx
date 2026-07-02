import { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-ink-950/8 dark:border-white/8 bg-white dark:bg-ink-850 shadow-sm",
        className
      )}
      {...props}
    />
  );
}

type BadgeVariant = "pass" | "fail" | "neutral" | "gold";

const badgeVariants: Record<BadgeVariant, string> = {
  pass: "bg-sage-500/12 text-sage-600 dark:text-sage-500",
  fail: "bg-burgundy-500/12 text-burgundy-500",
  neutral: "bg-ink-950/8 text-text-950/70 dark:bg-white/10 dark:text-ink-100/70",
  gold: "bg-gold-400/15 text-gold-600 dark:text-gold-300",
};

export function Badge({
  variant = "neutral",
  className,
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-ink-950/8 dark:bg-white/8", className)} />;
}
