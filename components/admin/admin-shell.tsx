"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Menu, X, LogOut, ChevronRight } from "lucide-react";
import { Seal } from "@/components/landing/seal";
import { ThemeToggle } from "@/components/landing/theme-toggle";
import { ADMIN_NAV_ITEMS, ROUTES } from "@/constants/routes";
import { logoutAction } from "@/actions/auth-actions";
import { cn } from "@/utils/cn";

const ICONS = { LayoutDashboard, Users } as const;

function useBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean).slice(1); // drop "admin"
  const labels: Record<string, string> = { dashboard: "Dashboard", students: "Students", new: "Add Student" };
  return segments.map((seg, i) => ({
    label: labels[seg] ?? (seg.length > 12 ? "Edit Student" : seg),
    isLast: i === segments.length - 1,
  }));
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <Link href={ROUTES.adminDashboard} className="flex items-center gap-2.5 px-6 py-6">
        <Seal className="size-8" />
        <span className="font-display text-sm font-semibold text-ink-100">Admin Portal</span>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon as keyof typeof ICONS];
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-gold-400/15 text-gold-300"
                  : "text-ink-100/60 hover:bg-white/5 hover:text-ink-100"
              )}
            >
              <Icon className="size-[18px]" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <form action={() => logoutAction(ROUTES.adminLogin)} className="px-3 pb-6">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-ink-100/60 transition-colors hover:bg-burgundy-500/15 hover:text-burgundy-300"
        >
          <LogOut className="size-[18px]" strokeWidth={1.75} />
          Sign out
        </button>
      </form>
    </div>
  );
}

export function AdminShell({ username, children }: { username: string; children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const breadcrumbs = useBreadcrumbs();

  return (
    <div className="min-h-screen bg-paper-50 dark:bg-ink-950">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-ink-950 sm:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <div className="absolute inset-0 bg-ink-950/60" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-ink-950 shadow-xl">
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute right-3 top-6 flex size-8 items-center justify-center rounded-lg text-ink-100/60 hover:bg-white/5"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <div className="sm:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-ink-950/8 bg-paper-50/80 px-4 py-4 backdrop-blur-lg dark:border-white/8 dark:bg-ink-950/80 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex size-9 items-center justify-center rounded-lg text-text-950/70 hover:bg-ink-950/5 dark:text-ink-100/70 dark:hover:bg-white/5 sm:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
              <Link href={ROUTES.adminDashboard} className="text-text-950/45 dark:text-ink-100/45">
                Admin
              </Link>
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <ChevronRight className="size-3.5 text-text-950/30 dark:text-ink-100/30" />
                  <span
                    className={cn(
                      crumb.isLast
                        ? "font-medium text-text-950 dark:text-ink-100"
                        : "text-text-950/45 dark:text-ink-100/45"
                    )}
                  >
                    {crumb.label}
                  </span>
                </span>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden font-data text-xs text-text-950/45 dark:text-ink-100/45 sm:inline">
              {username}
            </span>
            <ThemeToggle />
          </div>
        </header>

        <main className="px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
