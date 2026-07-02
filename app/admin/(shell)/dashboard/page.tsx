"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Percent,
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
} from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { Card, Skeleton } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import { formatDate, formatGPA, formatPercentage } from "@/utils/format";
import { ROUTES } from "@/constants/routes";
import type { DashboardStats } from "@/types";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Failed to load dashboard");
        const json = await res.json();
        if (!cancelled) setStats(json.data);
      } catch {
        if (!cancelled) toast.error("Could not load dashboard statistics.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-950 dark:text-ink-100">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-text-950/55 dark:text-ink-100/55">
            An overview of student results across the institute.
          </p>
        </div>
        <Link href={ROUTES.adminStudentNew}>
          <Button>
            <Plus className="size-4" />
            Add Student
          </Button>
        </Link>
      </div>

      {isLoading || !stats ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[104px]" />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <StatCard label="Total Students" value={String(stats.totalStudents)} icon={Users} accent="ink" />
            <StatCard
              label="Passed Students"
              value={String(stats.passedStudents)}
              icon={CheckCircle2}
              accent="sage"
            />
            <StatCard
              label="Failed Students"
              value={String(stats.failedStudents)}
              icon={XCircle}
              accent="burgundy"
            />
            <StatCard label="Average GPA" value={formatGPA(stats.averageGPA)} icon={TrendingUp} accent="gold" />
            <StatCard
              label="Average Percentage"
              value={formatPercentage(stats.averagePercentage)}
              icon={Percent}
              accent="ink"
            />
            <StatCard
              label="Highest Percentage"
              value={formatPercentage(stats.highestPercentage)}
              icon={ArrowUpCircle}
              accent="sage"
            />
            <StatCard
              label="Lowest Percentage"
              value={formatPercentage(stats.lowestPercentage)}
              icon={ArrowDownCircle}
              accent="burgundy"
            />
          </div>

          <div className="mt-10">
            <h2 className="font-display text-lg font-semibold text-text-950 dark:text-ink-100">
              Recently Added Students
            </h2>
            <Card className="mt-4 overflow-hidden">
              {stats.recentStudents.length === 0 ? (
                <p className="p-8 text-center text-sm text-text-950/50 dark:text-ink-100/50">
                  No students added yet. Add your first student to see them here.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-ink-950/8 dark:border-white/8">
                        <th className="px-5 py-3 font-medium text-text-950/50 dark:text-ink-100/50">Name</th>
                        <th className="px-5 py-3 font-medium text-text-950/50 dark:text-ink-100/50">
                          Roll Number
                        </th>
                        <th className="px-5 py-3 font-medium text-text-950/50 dark:text-ink-100/50">
                          Department
                        </th>
                        <th className="px-5 py-3 font-medium text-text-950/50 dark:text-ink-100/50">
                          Added On
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentStudents.map((s) => (
                        <tr
                          key={s.id}
                          className="border-b border-ink-950/5 last:border-0 dark:border-white/5"
                        >
                          <td className="px-5 py-3 font-medium text-text-950 dark:text-ink-100">{s.name}</td>
                          <td className="px-5 py-3 font-data text-text-950/70 dark:text-ink-100/70">
                            {s.rollNumber}
                          </td>
                          <td className="px-5 py-3 text-text-950/70 dark:text-ink-100/70">{s.department}</td>
                          <td className="px-5 py-3 text-text-950/50 dark:text-ink-100/50">
                            {formatDate(s.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
