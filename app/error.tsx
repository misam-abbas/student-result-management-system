"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw, Home } from "lucide-react";
import { Seal } from "@/components/landing/seal";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper-50 px-6 text-center dark:bg-ink-950">
      <Seal className="size-14 text-burgundy-500 opacity-70" />
      <p className="font-display mt-6 text-7xl font-semibold text-text-950 dark:text-ink-100">500</p>
      <h1 className="mt-3 font-display text-2xl font-semibold text-text-950 dark:text-ink-100">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-sm text-sm text-text-950/60 dark:text-ink-100/60">
        An unexpected error occurred while processing your request. You can try again, or head back
        to the homepage.
      </p>
      <div className="mt-8 flex gap-3">
        <Button variant="outline" onClick={reset}>
          <RotateCw className="size-4" />
          Try again
        </Button>
        <Link href={ROUTES.home}>
          <Button>
            <Home className="size-4" />
            Back to home
          </Button>
        </Link>
      </div>
    </div>
  );
}
