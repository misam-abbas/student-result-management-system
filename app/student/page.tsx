import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StudentLookup } from "@/components/student/student-lookup";
import { ThemeToggle } from "@/components/landing/theme-toggle";
import { ROUTES } from "@/constants/routes";

export default function StudentPage() {
  return (
    <div className="relative min-h-screen bg-paper-50 px-6 py-10 dark:bg-ink-950 print:bg-white print:px-0 print:py-0">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(212,175,106,0.14),transparent)] dark:bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(212,175,106,0.1),transparent)] print:hidden"
      />

      <div className="relative z-10 mx-auto flex max-w-2xl items-center justify-between print:hidden">
        <Link
          href={ROUTES.home}
          className="inline-flex items-center gap-1.5 text-sm text-text-950/50 transition-colors hover:text-text-950 dark:text-ink-100/50 dark:hover:text-ink-100"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
        <ThemeToggle />
      </div>

      <div className="relative z-10 mt-8">
        <StudentLookup />
      </div>
    </div>
  );
}
