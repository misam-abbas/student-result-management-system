import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils/cn";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: "gold" | "sage" | "burgundy" | "ink";
}

const accentClasses = {
  gold: "bg-gold-400/15 text-gold-600 dark:text-gold-300",
  sage: "bg-sage-500/12 text-sage-600 dark:text-sage-500",
  burgundy: "bg-burgundy-500/12 text-burgundy-500",
  ink: "bg-ink-950/8 text-ink-950 dark:bg-white/10 dark:text-ink-100",
};

export function StatCard({ label, value, icon: Icon, accent = "ink" }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className={cn("flex size-10 items-center justify-center rounded-lg", accentClasses[accent])}>
        <Icon className="size-5" strokeWidth={1.75} />
      </div>
      <p className="mt-4 text-2xl font-semibold text-text-950 dark:text-ink-100">{value}</p>
      <p className="mt-0.5 text-sm text-text-950/50 dark:text-ink-100/50">{label}</p>
    </Card>
  );
}
