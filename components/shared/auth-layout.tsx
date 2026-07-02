import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import { Seal } from "@/components/landing/seal";
import { ROUTES } from "@/constants/routes";

export function AuthLayout({
  icon: Icon,
  title,
  subtitle,
  accent,
  children,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  accent: "gold" | "burgundy";
  children: React.ReactNode;
}) {
  const glow =
    accent === "gold"
      ? "bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(212,175,106,0.18),transparent)] dark:bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(212,175,106,0.12),transparent)]"
      : "bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(123,45,62,0.16),transparent)] dark:bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(123,45,62,0.18),transparent)]";
  const iconWrap =
    accent === "gold" ? "bg-gold-400/15 text-gold-600 dark:text-gold-300" : "bg-burgundy-500/12 text-burgundy-500";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-paper-50 px-6 py-12 dark:bg-ink-950">
      <div aria-hidden className={`pointer-events-none absolute inset-0 ${glow}`} />

      <Link
        href={ROUTES.home}
        className="absolute left-6 top-6 inline-flex items-center gap-1.5 text-sm text-text-950/50 transition-colors hover:text-text-950 dark:text-ink-100/50 dark:hover:text-ink-100"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>

      <div className="animate-rise relative z-10 w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Seal className="size-10" />
          <div className={`mt-5 flex size-12 items-center justify-center rounded-xl ${iconWrap}`}>
            <Icon className="size-6" strokeWidth={1.75} />
          </div>
          <h1 className="mt-4 font-display text-2xl font-semibold text-text-950 dark:text-ink-100">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-text-950/55 dark:text-ink-100/55">{subtitle}</p>
        </div>

        <div className="glass-panel rounded-2xl p-7 shadow-lg">{children}</div>
      </div>
    </div>
  );
}
