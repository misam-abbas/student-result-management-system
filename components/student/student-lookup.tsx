"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, ShieldCheck } from "lucide-react";
import { studentLookupSchema, type StudentLookupInput } from "@/lib/validations";
import { formatCnicInput } from "@/utils/cnic";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/form-fields";
import { ResultCard } from "@/components/student/result-card";
import { Seal } from "@/components/landing/seal";
import type { ResultView } from "@/types";

export function StudentLookup() {
  const [result, setResult] = useState<ResultView | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFoundMessage, setNotFoundMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<StudentLookupInput>({
    resolver: zodResolver(studentLookupSchema),
  });

  const onSubmit = async (data: StudentLookupInput) => {
    setIsSearching(true);
    setNotFoundMessage(null);
    try {
      const params = new URLSearchParams({ cnic: data.cnic, rollNumber: data.rollNumber });
      const res = await fetch(`/api/student-result?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) {
        setNotFoundMessage(json.error ?? "No result found for this CNIC and roll number.");
        return;
      }
      setResult(json.data);
    } catch {
      setNotFoundMessage("Something went wrong. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchAgain = () => {
    setResult(null);
    setNotFoundMessage(null);
    reset();
  };

  if (result) {
    return <ResultCard result={result} onSearchAgain={handleSearchAgain} />;
  }

  return (
    <div className="animate-rise mx-auto w-full max-w-md">
      <div className="flex flex-col items-center text-center">
        <Seal className="size-11" />
        <h1 className="mt-5 font-display text-2xl font-semibold text-text-950 dark:text-ink-100">
          Check Your Result
        </h1>
        <p className="mt-1.5 text-sm text-text-950/55 dark:text-ink-100/55">
          Enter your CNIC and roll number to view your semester result.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="glass-panel mt-8 space-y-5 rounded-2xl p-7 shadow-lg" noValidate>
        <FormField label="CNIC" htmlFor="cnic" error={errors.cnic?.message} hint="Format: xxxxx-xxxxxxx-x">
          <Input
            id="cnic"
            inputMode="numeric"
            placeholder="42101-1234567-1"
            className="font-data"
            {...register("cnic", {
              onChange: (e) => setValue("cnic", formatCnicInput(e.target.value)),
            })}
          />
        </FormField>

        <FormField label="Roll Number" htmlFor="rollNumber" error={errors.rollNumber?.message}>
          <Input id="rollNumber" placeholder="e.g. CS-2024-014" {...register("rollNumber")} />
        </FormField>

        {notFoundMessage && (
          <p className="rounded-lg bg-burgundy-500/10 px-3.5 py-2.5 text-sm text-burgundy-500">
            {notFoundMessage}
          </p>
        )}

        <Button type="submit" variant="secondary" className="w-full" isLoading={isSearching}>
          <Search className="size-4" />
          View Result
        </Button>

        <p className="flex items-center justify-center gap-1.5 text-xs text-text-950/40 dark:text-ink-100/40">
          <ShieldCheck className="size-3.5" />
          Both fields must match our records exactly.
        </p>
      </form>
    </div>
  );
}
