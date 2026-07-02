import type { ResultStatus } from "@prisma/client";

export interface GpaTier {
  min: number;
  gpa: number;
}

/** Exact grading table from the project specification. */
export const GPA_TABLE: GpaTier[] = [
  { min: 90, gpa: 4.0 },
  { min: 85, gpa: 3.7 },
  { min: 80, gpa: 3.3 },
  { min: 75, gpa: 3.0 },
  { min: 70, gpa: 2.7 },
  { min: 65, gpa: 2.3 },
  { min: 60, gpa: 2.0 },
  { min: 55, gpa: 1.7 },
  { min: 50, gpa: 1.0 },
];

export const PASSING_PERCENTAGE = 50;

export function calculateGPA(percentage: number): number {
  for (const tier of GPA_TABLE) {
    if (percentage >= tier.min) return tier.gpa;
  }
  return 0.0;
}

export function calculateStatus(percentage: number): ResultStatus {
  return percentage >= PASSING_PERCENTAGE ? "PASS" : "FAIL";
}

export interface SubjectMarksInput {
  obtainedMarks: number;
  totalMarks: number;
}

export interface ComputedResult {
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  gpa: number;
  status: ResultStatus;
}

/**
 * Derives total/obtained/percentage/GPA/status from a student's per-subject
 * marks. This is the single source of truth used whenever marks are
 * created or updated, so the stored Result row always stays in sync.
 */
export function computeResult(entries: SubjectMarksInput[]): ComputedResult {
  const totalMarks = entries.reduce((sum, e) => sum + e.totalMarks, 0);
  const obtainedMarks = entries.reduce((sum, e) => sum + e.obtainedMarks, 0);
  const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
  const roundedPercentage = Math.round(percentage * 100) / 100;

  return {
    totalMarks,
    obtainedMarks,
    percentage: roundedPercentage,
    gpa: calculateGPA(roundedPercentage),
    status: calculateStatus(roundedPercentage),
  };
}
