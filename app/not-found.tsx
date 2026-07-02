import Link from "next/link";
import { Home } from "lucide-react";
import { Seal } from "@/components/landing/seal";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper-50 px-6 text-center dark:bg-ink-950">
      <Seal className="size-14 opacity-60" />
      <p className="font-display mt-6 text-7xl font-semibold text-text-950 dark:text-ink-100">404</p>
      <h1 className="mt-3 font-display text-2xl font-semibold text-text-950 dark:text-ink-100">
        This page isn&apos;t on record
      </h1>
      <p className="mt-2 max-w-sm text-sm text-text-950/60 dark:text-ink-100/60">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link href={ROUTES.home} className="mt-8">
        <Button>
          <Home className="size-4" />
          Back to home
        </Button>
      </Link>
    </div>
  );
}
