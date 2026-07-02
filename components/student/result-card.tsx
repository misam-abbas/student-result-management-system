"use client";

import { Download, Printer, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Seal } from "@/components/landing/seal";
import { generateResultPDF } from "@/lib/pdf/generate-result-pdf";
import { formatDate, formatGPA, formatPercentage } from "@/utils/format";
import { INSTITUTE_NAME } from "@/constants/routes";
import type { ResultView } from "@/types";

export function ResultCard({ result, onSearchAgain }: { result: ResultView; onSearchAgain: () => void }) {
  return (
    <div className="animate-rise mx-auto w-full max-w-2xl">
      <div id="result-print-area" className="glass-panel overflow-hidden rounded-2xl shadow-lg print:shadow-none">
        {/* Header */}
        <div className="border-b border-ink-950/8 px-7 py-6 dark:border-white/8">
          <div className="flex items-center gap-3">
            <Seal className="size-9" />
            <div>
              <p className="font-display text-base font-semibold text-text-950 dark:text-ink-100">
                {INSTITUTE_NAME}
              </p>
              <p className="text-xs text-text-950/50 dark:text-ink-100/50">Official Result Transcript</p>
            </div>
          </div>
        </div>

        {/* Student info */}
        <div className="grid grid-cols-2 gap-4 px-7 py-6 sm:grid-cols-3">
          <InfoField label="Student Name" value={result.student.name} />
          <InfoField label="Father Name" value={result.student.fatherName} />
          <InfoField label="Roll Number" value={result.student.rollNumber} mono />
          <InfoField label="CNIC" value={result.student.cnic} mono />
          <InfoField label="Department" value={result.student.department} />
          <InfoField label="Semester" value={result.student.semester} />
        </div>

        <div className="ledger-rule mx-7" />

        {/* Subjects table */}
        <div className="px-7 py-6">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-950/8 dark:border-white/8">
                <th className="pb-2.5 font-medium text-text-950/50 dark:text-ink-100/50">Subject</th>
                <th className="pb-2.5 text-right font-medium text-text-950/50 dark:text-ink-100/50">
                  Obtained
                </th>
                <th className="pb-2.5 text-right font-medium text-text-950/50 dark:text-ink-100/50">Total</th>
              </tr>
            </thead>
            <tbody>
              {result.subjects.map((s) => (
                <tr key={s.subjectId} className="border-b border-ink-950/5 last:border-0 dark:border-white/5">
                  <td className="py-2.5 text-text-950 dark:text-ink-100">{s.subjectName}</td>
                  <td className="py-2.5 text-right font-data text-text-950/80 dark:text-ink-100/80">
                    {s.obtainedMarks}
                  </td>
                  <td className="py-2.5 text-right font-data text-text-950/60 dark:text-ink-100/60">
                    {s.totalMarks}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-ink-950/8 dark:border-white/8">
                <td className="pt-2.5 font-semibold text-text-950 dark:text-ink-100">Total</td>
                <td className="pt-2.5 text-right font-data font-semibold text-text-950 dark:text-ink-100">
                  {result.obtainedMarks}
                </td>
                <td className="pt-2.5 text-right font-data font-semibold text-text-950 dark:text-ink-100">
                  {result.totalMarks}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Summary band */}
        <div
          className={
            result.status === "PASS"
              ? "bg-sage-500 px-7 py-5"
              : "bg-burgundy-500 px-7 py-5"
          }
        >
          <div className="grid grid-cols-3 text-center text-white">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider opacity-80">Percentage</p>
              <p className="mt-1 font-display text-xl font-semibold">{formatPercentage(result.percentage)}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider opacity-80">GPA</p>
              <p className="mt-1 font-display text-xl font-semibold">{formatGPA(result.gpa)}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider opacity-80">Status</p>
              <p className="mt-1 font-display text-xl font-semibold">{result.status}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-7 py-4">
          <p className="text-xs text-text-950/45 dark:text-ink-100/45">
            Date Generated: {formatDate(result.generatedAt)}
          </p>
          <Badge variant={result.status === "PASS" ? "pass" : "fail"}>{result.status}</Badge>
        </div>
      </div>

      {/* Actions (hidden on print) */}
      <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
        <Button onClick={() => generateResultPDF(result)}>
          <Download className="size-4" />
          Download as PDF
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="size-4" />
          Print Result
        </Button>
        <Button variant="ghost" onClick={onSearchAgain}>
          <RotateCcw className="size-4" />
          Search Again
        </Button>
      </div>
    </div>
  );
}

function InfoField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-text-950/45 dark:text-ink-100/45">
        {label}
      </p>
      <p className={`mt-0.5 text-sm font-medium text-text-950 dark:text-ink-100 ${mono ? "font-data" : ""}`}>
        {value}
      </p>
    </div>
  );
}
