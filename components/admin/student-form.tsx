"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, Plus, Save } from "lucide-react";
import { studentUpdateSchema, type StudentUpdateInput } from "@/lib/validations";
import { computeResult } from "@/lib/calculations";
import { formatCnicInput } from "@/utils/cnic";
import { formatGPA, formatPercentage } from "@/utils/format";
import { Button } from "@/components/ui/button";
import { Card, Badge } from "@/components/ui/card";
import { FormField, Input } from "@/components/ui/form-fields";
import { QuickAddSelect } from "@/components/admin/quick-add-select";
import { toast } from "@/components/ui/toaster";
import { ROUTES } from "@/constants/routes";

interface Option {
  id: string;
  label: string;
}

interface StudentFormProps {
  mode: "create" | "edit";
  studentId?: string;
  defaultValues?: StudentUpdateInput;
}

export function StudentForm({ mode, studentId, defaultValues }: StudentFormProps) {
  const router = useRouter();
  const [departments, setDepartments] = useState<Option[]>([]);
  const [semesters, setSemesters] = useState<Option[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialSemesterId = useRef(defaultValues?.semesterId ?? "");
  const hasSyncedInitialSubjects = useRef(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StudentUpdateInput>({
    resolver: zodResolver(studentUpdateSchema),
    defaultValues: defaultValues ?? {
      name: "",
      fatherName: "",
      rollNumber: "",
      cnic: "",
      departmentId: "",
      semesterId: "",
      marks: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({ control, name: "marks" });
  const departmentId = watch("departmentId");
  const semesterId = watch("semesterId");
  const watchedMarks = watch("marks");

  // Load departments + semesters once.
  useEffect(() => {
    (async () => {
      try {
        const [deptRes, semRes] = await Promise.all([fetch("/api/departments"), fetch("/api/semesters")]);
        const deptJson = await deptRes.json();
        const semJson = await semRes.json();
        setDepartments(deptJson.data.map((d: { id: string; name: string }) => ({ id: d.id, label: d.name })));
        setSemesters(semJson.data.map((s: { id: string; label: string }) => ({ id: s.id, label: s.label })));
      } catch {
        toast.error("Could not load departments and semesters.");
      }
    })();
  }, []);

  // Load subjects whenever the semester changes; auto-populate marks rows
  // for a fresh selection without wiping pre-filled edit data.
  useEffect(() => {
    if (!semesterId) {
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/subjects?semesterId=${semesterId}`);
        const json = await res.json();
        const list = json.data as { id: string; name: string; totalMarks: number }[];

        const isInitialLoad = !hasSyncedInitialSubjects.current && semesterId === initialSemesterId.current;
        hasSyncedInitialSubjects.current = true;

        if (isInitialLoad && defaultValues?.marks?.length) {
          return; // keep the existing marks rows exactly as loaded for edit mode
        }

        replace(
          list.map((subject) => {
            const existing = defaultValues?.marks?.find((m) => m.subjectId === subject.id);
            return {
              subjectId: subject.id,
              subjectName: subject.name,
              obtainedMarks: existing?.obtainedMarks ?? 0,
              totalMarks: subject.totalMarks,
            };
          })
        );
      } catch {
        toast.error("Could not load subjects for this semester.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semesterId]);

  const handleAddDepartment = async (name: string) => {
    const code = name.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "X");
    const res = await fetch("/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, code: `${code}${Math.floor(Math.random() * 90 + 10)}` }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error ?? "Could not add department.");
      return;
    }
    setDepartments((prev) => [...prev, { id: json.data.id, label: json.data.name }]);
    setValue("departmentId", json.data.id, { shouldValidate: true });
    toast.success("Department added.");
  };

  const handleAddSubject = async (name: string) => {
    if (!semesterId) {
      toast.error("Select a semester first.");
      return;
    }
    const res = await fetch("/api/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, semesterId, totalMarks: 100 }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error ?? "Could not add subject.");
      return;
    }
    append({ subjectId: json.data.id, subjectName: json.data.name, obtainedMarks: 0, totalMarks: json.data.totalMarks });
    toast.success("Subject added.");
  };

  const onSubmit = async (data: StudentUpdateInput) => {
    setIsSubmitting(true);
    try {
      const url = mode === "create" ? "/api/students" : `/api/students/${studentId}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Something went wrong.");
        return;
      }
      toast.success(mode === "create" ? "Student added successfully." : "Student updated successfully.");
      router.push(ROUTES.adminStudents);
      router.refresh();
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const preview =
    watchedMarks && watchedMarks.length > 0
      ? computeResult(
          watchedMarks.map((m) => ({
            obtainedMarks: Number(m.obtainedMarks) || 0,
            totalMarks: Number(m.totalMarks) || 0,
          }))
        )
      : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold text-text-950 dark:text-ink-100">
          Student Information
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField label="Student Name" htmlFor="name" error={errors.name?.message}>
            <Input id="name" placeholder="e.g. Ayesha Khan" {...register("name")} />
          </FormField>
          <FormField label="Father Name" htmlFor="fatherName" error={errors.fatherName?.message}>
            <Input id="fatherName" placeholder="e.g. Imran Khan" {...register("fatherName")} />
          </FormField>
          <FormField label="Roll Number" htmlFor="rollNumber" error={errors.rollNumber?.message}>
            <Input id="rollNumber" placeholder="e.g. CS-2024-014" {...register("rollNumber")} />
          </FormField>
          <FormField
            label="CNIC"
            htmlFor="cnic"
            error={errors.cnic?.message}
            hint="Format: xxxxx-xxxxxxx-x"
          >
            <Input
              id="cnic"
              placeholder="42101-1234567-1"
              {...register("cnic", {
                onChange: (e) => setValue("cnic", formatCnicInput(e.target.value)),
              })}
            />
          </FormField>
          <FormField label="Department" htmlFor="departmentId" error={errors.departmentId?.message}>
            <QuickAddSelect
              id="departmentId"
              value={departmentId}
              options={departments}
              placeholder="Select department"
              onChange={(id) => setValue("departmentId", id, { shouldValidate: true })}
              onQuickAdd={handleAddDepartment}
              addLabel="Add new department"
            />
          </FormField>
          <FormField label="Semester" htmlFor="semesterId" error={errors.semesterId?.message}>
            <QuickAddSelect
              id="semesterId"
              value={semesterId}
              options={semesters}
              placeholder="Select semester"
              onChange={(id) => setValue("semesterId", id, { shouldValidate: true })}
              onQuickAdd={async () => {
                toast.error("Semesters are seeded automatically — add subjects from the marks table instead.");
              }}
              addLabel="Semesters are preset"
            />
          </FormField>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-text-950 dark:text-ink-100">
            Subjects &amp; Marks
          </h2>
          {preview && (
            <div className="flex items-center gap-4 font-data text-sm">
              <span className="text-text-950/60 dark:text-ink-100/60">
                {formatPercentage(preview.percentage)} · GPA {formatGPA(preview.gpa)}
              </span>
              <Badge variant={preview.status === "PASS" ? "pass" : "fail"}>{preview.status}</Badge>
            </div>
          )}
        </div>

        {!semesterId ? (
          <p className="mt-5 rounded-lg bg-ink-950/[0.03] px-4 py-6 text-center text-sm text-text-950/50 dark:bg-white/[0.03] dark:text-ink-100/50">
            Select a semester above to load its subjects.
          </p>
        ) : (
          <div className="mt-5 space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr_auto_auto_auto] items-start gap-3">
                <div className="flex h-10 items-center text-sm font-medium text-text-950 dark:text-ink-100">
                  {field.subjectName}
                </div>
                <div className="w-28">
                  <Input
                    type="number"
                    step="0.01"
                    aria-label={`${field.subjectName} obtained marks`}
                    {...register(`marks.${index}.obtainedMarks` as const, { valueAsNumber: true })}
                  />
                  <FieldErrorText message={errors.marks?.[index]?.obtainedMarks?.message} />
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    step="0.01"
                    aria-label={`${field.subjectName} total marks`}
                    {...register(`marks.${index}.totalMarks` as const, { valueAsNumber: true })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="flex size-10 items-center justify-center rounded-lg text-text-950/40 transition-colors hover:bg-burgundy-500/10 hover:text-burgundy-500 dark:text-ink-100/40"
                  aria-label="Remove subject"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}

            <div className="pt-1">
              <SubjectQuickAdd onAdd={handleAddSubject} />
            </div>

            {errors.marks?.message && <FieldErrorText message={errors.marks.message} />}
          </div>
        )}
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push(ROUTES.adminStudents)}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          <Save className="size-4" />
          {mode === "create" ? "Add Student" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

function FieldErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-burgundy-500">{message}</p>;
}

function SubjectQuickAdd({ onAdd }: { onAdd: (name: string) => Promise<void> }) {
  const [value, setValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const submit = async () => {
    if (!value.trim()) return;
    setIsSaving(true);
    try {
      await onAdd(value.trim());
      setValue("");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add another subject…"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
        className="max-w-xs"
      />
      <Button type="button" variant="outline" size="sm" onClick={submit} isLoading={isSaving}>
        <Plus className="size-3.5" />
        Add
      </Button>
    </div>
  );
}
