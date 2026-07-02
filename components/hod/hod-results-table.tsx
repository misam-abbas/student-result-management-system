"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Award, Lock } from "lucide-react";
import { Card, Badge, Skeleton } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/form-fields";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "@/components/ui/toaster";
import { formatGPA, formatPercentage } from "@/utils/format";
import { HOD_PASSING_THRESHOLD } from "@/constants/routes";
import type { HodResultRow } from "@/types";

interface Option {
  id: string;
  label: string;
}

export function HodResultsTable() {
  const [rows, setRows] = useState<HodResultRow[]>([]);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [semesters, setSemesters] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => {
    (async () => {
      const [deptRes, semRes] = await Promise.all([fetch("/api/departments"), fetch("/api/semesters")]);
      const deptJson = await deptRes.json();
      const semJson = await semRes.json();
      setDepartments(deptJson.data.map((d: { id: string; name: string }) => ({ id: d.id, label: d.name })));
      setSemesters(semJson.data.map((s: { id: string; label: string }) => ({ id: s.id, label: s.label })));
    })();
  }, []);

  const loadResults = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(departmentId ? { departmentId } : {}),
        ...(semesterId ? { semesterId } : {}),
      });
      const res = await fetch(`/api/hod/results?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load results");
      const json = await res.json();
      setRows(json.data);
    } catch {
      toast.error("Could not load results.");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, departmentId, semesterId]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-950 dark:text-ink-100">
            Department Results
          </h1>
          <p className="mt-1 text-sm text-text-950/55 dark:text-ink-100/55">
            Showing students with {HOD_PASSING_THRESHOLD}% or higher.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-burgundy-500/10 px-3 py-1.5 text-xs font-medium text-burgundy-500">
          <Lock className="size-3.5" />
          Read-only access
        </span>
      </div>

      <Card className="mt-6 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-950/35 dark:text-ink-100/35" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or roll number…"
              className="pl-9"
              aria-label="Search students"
            />
          </div>
          <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} aria-label="Filter by department">
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </Select>
          <Select value={semesterId} onChange={(e) => setSemesterId(e.target.value)} aria-label="Filter by semester">
            <option value="">All semesters</option>
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card className="mt-4 overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-ink-950/5 dark:bg-white/5">
              <Award className="size-6 text-text-950/40 dark:text-ink-100/40" />
            </div>
            <p className="mt-4 font-medium text-text-950 dark:text-ink-100">No matching results</p>
            <p className="mt-1 max-w-xs text-sm text-text-950/50 dark:text-ink-100/50">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink-950/8 dark:border-white/8">
                  <th className="px-5 py-3 font-medium text-text-950/50 dark:text-ink-100/50">Name</th>
                  <th className="px-5 py-3 font-medium text-text-950/50 dark:text-ink-100/50">Father Name</th>
                  <th className="px-5 py-3 font-medium text-text-950/50 dark:text-ink-100/50">Roll No.</th>
                  <th className="px-5 py-3 font-medium text-text-950/50 dark:text-ink-100/50">Department</th>
                  <th className="px-5 py-3 font-medium text-text-950/50 dark:text-ink-100/50">Semester</th>
                  <th className="px-5 py-3 font-medium text-text-950/50 dark:text-ink-100/50">%</th>
                  <th className="px-5 py-3 font-medium text-text-950/50 dark:text-ink-100/50">GPA</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.studentId} className="border-b border-ink-950/5 last:border-0 dark:border-white/5">
                    <td className="px-5 py-3 font-medium text-text-950 dark:text-ink-100">{r.name}</td>
                    <td className="px-5 py-3 text-text-950/70 dark:text-ink-100/70">{r.fatherName}</td>
                    <td className="px-5 py-3 font-data text-text-950/70 dark:text-ink-100/70">{r.rollNumber}</td>
                    <td className="px-5 py-3 text-text-950/70 dark:text-ink-100/70">{r.department}</td>
                    <td className="px-5 py-3 text-text-950/70 dark:text-ink-100/70">{r.semester}</td>
                    <td className="px-5 py-3 font-data text-text-950/70 dark:text-ink-100/70">
                      {formatPercentage(r.percentage)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant="pass">{formatGPA(r.gpa)}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
