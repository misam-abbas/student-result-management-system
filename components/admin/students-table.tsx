"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Pencil, Trash2, Plus, Users } from "lucide-react";
import { Card, Badge, Skeleton } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toaster";
import { useDebounce } from "@/hooks/use-debounce";
import { deleteStudentAction } from "@/actions/student-actions";
import { formatGPA, formatPercentage } from "@/utils/format";
import { ROUTES, DEFAULT_PAGE_SIZE } from "@/constants/routes";
import type { StudentWithRelations, PaginatedResponse } from "@/types";

interface Option {
  id: string;
  label: string;
}

export function StudentsTable() {
  const [students, setStudents] = useState<StudentWithRelations[]>([]);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [semesters, setSemesters] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [status, setStatus] = useState<"ALL" | "PASS" | "FAIL">("ALL");
  const debouncedSearch = useDebounce(search, 350);

  const [pendingDelete, setPendingDelete] = useState<StudentWithRelations | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      const [deptRes, semRes] = await Promise.all([fetch("/api/departments"), fetch("/api/semesters")]);
      const deptJson = await deptRes.json();
      const semJson = await semRes.json();
      setDepartments(deptJson.data.map((d: { id: string; name: string }) => ({ id: d.id, label: d.name })));
      setSemesters(semJson.data.map((s: { id: string; label: string }) => ({ id: s.id, label: s.label })));
    })();
  }, []);

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(DEFAULT_PAGE_SIZE),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(departmentId ? { departmentId } : {}),
        ...(semesterId ? { semesterId } : {}),
        ...(status !== "ALL" ? { status } : {}),
      });
      const res = await fetch(`/api/students?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load students");
      const json: PaginatedResponse<StudentWithRelations> = await res.json();
      setStudents(json.data);
      setTotalPages(json.pagination.totalPages);
      setTotal(json.pagination.total);
    } catch {
      toast.error("Could not load students.");
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, departmentId, semesterId, status]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Reset to page 1 whenever a filter changes.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, departmentId, semesterId, status]);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    const result = await deleteStudentAction(pendingDelete.id);
    setIsDeleting(false);
    setPendingDelete(null);
    if (result.success) {
      toast.success("Student deleted.");
      loadStudents();
    } else {
      toast.error(result.error ?? "Failed to delete student.");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-950 dark:text-ink-100">
            Students
          </h1>
          <p className="mt-1 text-sm text-text-950/55 dark:text-ink-100/55">
            {total} student{total === 1 ? "" : "s"} on record.
          </p>
        </div>
        <Link href={ROUTES.adminStudentNew}>
          <Button>
            <Plus className="size-4" />
            Add Student
          </Button>
        </Link>
      </div>

      <Card className="mt-6 p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_180px_180px_140px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-950/35 dark:text-ink-100/35" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, roll number, CNIC…"
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
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as "ALL" | "PASS" | "FAIL")}
            aria-label="Filter by status"
          >
            <option value="ALL">All status</option>
            <option value="PASS">Pass</option>
            <option value="FAIL">Fail</option>
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
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-ink-950/5 dark:bg-white/5">
              <Users className="size-6 text-text-950/40 dark:text-ink-100/40" />
            </div>
            <p className="mt-4 font-medium text-text-950 dark:text-ink-100">No students found</p>
            <p className="mt-1 max-w-xs text-sm text-text-950/50 dark:text-ink-100/50">
              Try adjusting your search or filters, or add a new student to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink-950/8 dark:border-white/8">
                  <th className="px-5 py-3 font-medium text-text-950/50 dark:text-ink-100/50">Name</th>
                  <th className="px-5 py-3 font-medium text-text-950/50 dark:text-ink-100/50">Roll No.</th>
                  <th className="px-5 py-3 font-medium text-text-950/50 dark:text-ink-100/50">Department</th>
                  <th className="px-5 py-3 font-medium text-text-950/50 dark:text-ink-100/50">Semester</th>
                  <th className="px-5 py-3 font-medium text-text-950/50 dark:text-ink-100/50">%</th>
                  <th className="px-5 py-3 font-medium text-text-950/50 dark:text-ink-100/50">GPA</th>
                  <th className="px-5 py-3 font-medium text-text-950/50 dark:text-ink-100/50">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-ink-950/5 last:border-0 dark:border-white/5">
                    <td className="px-5 py-3 font-medium text-text-950 dark:text-ink-100">{s.name}</td>
                    <td className="px-5 py-3 font-data text-text-950/70 dark:text-ink-100/70">{s.rollNumber}</td>
                    <td className="px-5 py-3 text-text-950/70 dark:text-ink-100/70">{s.department.name}</td>
                    <td className="px-5 py-3 text-text-950/70 dark:text-ink-100/70">{s.semester.label}</td>
                    <td className="px-5 py-3 font-data text-text-950/70 dark:text-ink-100/70">
                      {s.result ? formatPercentage(s.result.percentage) : "—"}
                    </td>
                    <td className="px-5 py-3 font-data text-text-950/70 dark:text-ink-100/70">
                      {s.result ? formatGPA(s.result.gpa) : "—"}
                    </td>
                    <td className="px-5 py-3">
                      {s.result && <Badge variant={s.result.status === "PASS" ? "pass" : "fail"}>{s.result.status}</Badge>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`${ROUTES.adminStudents}/${s.id}`}
                          className="flex size-8 items-center justify-center rounded-lg text-text-950/50 transition-colors hover:bg-gold-400/15 hover:text-gold-600 dark:text-ink-100/50"
                          aria-label={`Edit ${s.name}`}
                        >
                          <Pencil className="size-4" />
                        </Link>
                        <button
                          onClick={() => setPendingDelete(s)}
                          className="flex size-8 items-center justify-center rounded-lg text-text-950/50 transition-colors hover:bg-burgundy-500/12 hover:text-burgundy-500 dark:text-ink-100/50"
                          aria-label={`Delete ${s.name}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this student?"
        description={`This will permanently remove ${pendingDelete?.name ?? "this student"} and their result. This action cannot be undone.`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
