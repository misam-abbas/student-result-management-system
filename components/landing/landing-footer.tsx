import { INSTITUTE_NAME } from "@/constants/routes";

export function LandingFooter() {
  return (
    <footer className="border-t border-ink-950/8 dark:border-white/8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-xs text-text-950/50 dark:text-ink-100/50">
          © {new Date().getFullYear()} {INSTITUTE_NAME}. All rights reserved.
        </p>
        <p className="font-data text-xs text-text-950/40 dark:text-ink-100/40">
          Student Result Management System
        </p>
      </div>
    </footer>
  );
}
