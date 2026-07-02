"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { Seal } from "@/components/landing/seal";
import { ThemeToggle } from "@/components/landing/theme-toggle";
import { ROUTES } from "@/constants/routes";
import { logoutAction } from "@/actions/auth-actions";

export function HodShell({ username, children }: { username: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper-50 dark:bg-ink-950">
      <header className="sticky top-0 z-20 border-b border-ink-950/8 bg-paper-50/80 backdrop-blur-lg dark:border-white/8 dark:bg-ink-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
          <Link href={ROUTES.hodDashboard} className="flex items-center gap-2.5">
            <Seal className="size-8" />
            <div className="leading-tight">
              <p className="font-display text-sm font-semibold text-text-950 dark:text-ink-100">
                HOD Portal
              </p>
              <p className="text-[11px] text-burgundy-500">Read-only access</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden font-data text-xs text-text-950/45 dark:text-ink-100/45 sm:inline">
              {username}
            </span>
            <ThemeToggle />
            <form action={() => logoutAction(ROUTES.hodLogin)}>
              <button
                type="submit"
                aria-label="Sign out"
                className="flex size-10 items-center justify-center rounded-full border border-ink-950/10 text-text-950/70 transition-colors hover:bg-burgundy-500/10 hover:text-burgundy-500 dark:border-white/15 dark:text-ink-100/70"
              >
                <LogOut className="size-[18px]" strokeWidth={1.75} />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}
