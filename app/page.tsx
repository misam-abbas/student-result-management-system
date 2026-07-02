import { GraduationCap, UserCog, Award } from "lucide-react";
import { Seal } from "@/components/landing/seal";
import { ThemeToggle } from "@/components/landing/theme-toggle";
import { RoleCard } from "@/components/landing/role-card";
import { LandingFooter } from "@/components/landing/landing-footer";
import { INSTITUTE_NAME, ROUTES } from "@/constants/routes";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-paper-50 dark:bg-ink-950">
      {/* Ambient gradient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(212,175,106,0.16),transparent),radial-gradient(ellipse_60%_40%_at_85%_10%,rgba(123,45,62,0.10),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(212,175,106,0.10),transparent),radial-gradient(ellipse_60%_40%_at_85%_10%,rgba(123,45,62,0.14),transparent)]"
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <div className="flex items-center gap-2.5">
          <Seal className="size-8" />
          <span className="font-display text-sm font-semibold tracking-wide text-text-950 dark:text-ink-100">
            {INSTITUTE_NAME}
          </span>
        </div>
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center px-6 pb-20 pt-10 sm:pt-16">
        <div className="animate-rise flex flex-col items-center text-center">
          <Seal animated className="size-16 sm:size-20" />
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-300">
            Official Results Portal
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-[1.1] text-text-950 dark:text-ink-100 sm:text-6xl">
            Student Result
            <br />
            Management System
          </h1>
          <p className="mt-5 text-base text-text-950/60 dark:text-ink-100/60 sm:text-lg">
            Select your role to continue
          </p>
        </div>

        <div className="mt-14 grid w-full max-w-5xl gap-5 sm:mt-16 sm:grid-cols-3">
          <RoleCard
            icon={GraduationCap}
            eyebrow="For Students"
            title="Student"
            description="Check your semester result."
            buttonLabel="Continue as Student"
            href={ROUTES.student}
            accent="gold"
            delayMs={80}
          />
          <RoleCard
            icon={UserCog}
            eyebrow="For Administrators"
            title="Admin"
            description="Manage students and upload results."
            buttonLabel="Admin Login"
            href={ROUTES.adminLogin}
            accent="ink"
            delayMs={160}
          />
          <RoleCard
            icon={Award}
            eyebrow="For Department Heads"
            title="Head of Department"
            description="View students with passing percentages."
            buttonLabel="HOD Login"
            href={ROUTES.hodLogin}
            accent="burgundy"
            delayMs={240}
          />
        </div>

        <div className="ledger-rule mt-16 w-full max-w-md" />
      </main>

      <div className="relative z-10">
        <LandingFooter />
      </div>
    </div>
  );
}
