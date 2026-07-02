"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "!bg-white dark:!bg-ink-850 !border !border-ink-950/10 dark:!border-white/10 !text-text-950 dark:!text-ink-100 !shadow-lg !rounded-xl",
          title: "!font-medium",
          success: "[&_svg]:!text-sage-500",
          error: "[&_svg]:!text-burgundy-500",
        },
      }}
    />
  );
}

export { toast } from "sonner";
