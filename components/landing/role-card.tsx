import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

interface RoleCardProps {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  buttonLabel: string;
  href: string;
  accent: "gold" | "ink" | "burgundy";
  delayMs?: number;
}

const accentClasses = {
  gold: {
    iconWrap: "bg-gold-400/15 text-gold-600 dark:text-gold-300",
    ring: "group-hover:ring-gold-400/40",
    button: "bg-gold-400 text-ink-950 group-hover:bg-gold-300",
  },
  ink: {
    iconWrap: "bg-ink-950/8 text-ink-950 dark:bg-white/10 dark:text-ink-100",
    ring: "group-hover:ring-ink-950/20 dark:group-hover:ring-white/20",
    button: "bg-ink-950 text-paper-50 group-hover:bg-ink-800 dark:bg-white dark:text-ink-950",
  },
  burgundy: {
    iconWrap: "bg-burgundy-500/12 text-burgundy-500",
    ring: "group-hover:ring-burgundy-500/30",
    button: "bg-burgundy-500 text-white group-hover:bg-burgundy-600",
  },
} as const;

export function RoleCard({
  icon: Icon,
  eyebrow,
  title,
  description,
  buttonLabel,
  href,
  accent,
  delayMs = 0,
}: RoleCardProps) {
  const styles = accentClasses[accent];

  return (
    <Link
      href={href}
      className={cn(
        "group glass-panel animate-rise relative flex flex-col rounded-2xl p-7 ring-1 ring-transparent transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl",
        styles.ring
      )}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className={cn("flex size-12 items-center justify-center rounded-xl", styles.iconWrap)}>
        <Icon className="size-6" strokeWidth={1.75} />
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-text-950/50 dark:text-ink-100/50">
        {eyebrow}
      </p>
      <h3 className="mt-1.5 font-display text-2xl font-semibold text-text-950 dark:text-ink-100">
        {title}
      </h3>
      <p className="mt-2.5 text-sm leading-relaxed text-text-950/60 dark:text-ink-100/60">
        {description}
      </p>

      <div
        className={cn(
          "mt-6 inline-flex w-fit items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors",
          styles.button
        )}
      >
        {buttonLabel}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
