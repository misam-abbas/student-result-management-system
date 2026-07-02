"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <nav className="flex items-center justify-center gap-1.5 py-4" aria-label="Pagination">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex size-9 items-center justify-center rounded-lg text-text-950/60 transition-colors hover:bg-ink-950/5 disabled:opacity-30 dark:text-ink-100/60 dark:hover:bg-white/5"
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </button>

      {pages.map((p, i) => {
        const prevPage = pages[i - 1];
        const showEllipsis = prevPage !== undefined && p - prevPage > 1;
        return (
          <span key={p} className="flex items-center gap-1.5">
            {showEllipsis && <span className="px-1 text-text-950/30 dark:text-ink-100/30">…</span>}
            <button
              onClick={() => onPageChange(p)}
              className={cn(
                "flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                p === page
                  ? "bg-ink-950 text-paper-50 dark:bg-gold-400 dark:text-ink-950"
                  : "text-text-950/60 hover:bg-ink-950/5 dark:text-ink-100/60 dark:hover:bg-white/5"
              )}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          </span>
        );
      })}

      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="flex size-9 items-center justify-center rounded-lg text-text-950/60 transition-colors hover:bg-ink-950/5 disabled:opacity-30 dark:text-ink-100/60 dark:hover:bg-white/5"
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
