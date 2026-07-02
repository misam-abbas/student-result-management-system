import type { Department, Marks, Result, ResultStatus, Semester, Subject } from "@prisma/client";

/** A single subject's marks, as entered/displayed in forms and results. */
export interface MarkEntry {
  subjectId: string;
  subjectName: string;
  obtainedMarks: number;
  totalMarks: number;
}

/** A student together with the relations the UI needs to render. */
export interface StudentWithRelations {
  id: string;
  name: string;
  fatherName: string;
  rollNumber: string;
  cnic: string;
  departmentId: string;
  semesterId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  department: Department;
  semester: Semester;
  result: Result | null;
  marks?: (Marks & { subject: Subject })[];
}

/** The computed result view shown on the student lookup page and in the PDF. */
export interface ResultView {
  student: {
    name: string;
    fatherName: string;
    rollNumber: string;
    cnic: string;
    department: string;
    semester: string;
  };
  subjects: MarkEntry[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  gpa: number;
  status: ResultStatus;
  generatedAt: string;
}

/** Row shape for the HOD read-only results table. */
export interface HodResultRow {
  studentId: string;
  name: string;
  fatherName: string;
  rollNumber: string;
  department: string;
  semester: string;
  percentage: number;
  gpa: number;
  status: ResultStatus;
}

/** Admin dashboard aggregate statistics. */
export interface DashboardStats {
  totalStudents: number;
  passedStudents: number;
  failedStudents: number;
  averageGPA: number;
  averagePercentage: number;
  highestPercentage: number;
  lowestPercentage: number;
  recentStudents: {
    id: string;
    name: string;
    rollNumber: string;
    department: string;
    createdAt: string;
  }[];
}

/** Standard shape for paginated list API responses. */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/** Standard API error shape. */
export interface ApiErrorResponse {
  error: string;
  details?: Record<string, string[]>;
}
