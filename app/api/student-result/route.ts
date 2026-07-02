import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { studentLookupSchema } from "@/lib/validations";
import type { ResultView } from "@/types";

/**
 * GET /api/student-result?cnic=xxxxx-xxxxxxx-x&rollNumber=...
 * Public. Both CNIC and Roll Number must match the same student record.
 * Intentionally returns the same generic error whether the CNIC, the roll
 * number, or the combination is wrong, so the response can't be used to
 * enumerate which part was incorrect.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = studentLookupSchema.safeParse({
    cnic: searchParams.get("cnic") ?? "",
    rollNumber: searchParams.get("rollNumber") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid CNIC and roll number", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { cnic, rollNumber } = parsed.data;

  const student = await prisma.student.findFirst({
    where: { cnic, rollNumber },
    include: {
      department: true,
      semester: true,
      marks: { include: { subject: true } },
      result: true,
    },
  });

  if (!student || !student.result) {
    return NextResponse.json(
      { error: "No result found for this CNIC and roll number combination" },
      { status: 404 }
    );
  }

  const result: ResultView = {
    student: {
      name: student.name,
      fatherName: student.fatherName,
      rollNumber: student.rollNumber,
      cnic: student.cnic,
      department: student.department.name,
      semester: student.semester.label,
    },
    subjects: student.marks.map((m) => ({
      subjectId: m.subjectId,
      subjectName: m.subject.name,
      obtainedMarks: m.obtainedMarks,
      totalMarks: m.totalMarks,
    })),
    totalMarks: student.result.totalMarks,
    obtainedMarks: student.result.obtainedMarks,
    percentage: student.result.percentage,
    gpa: student.result.gpa,
    status: student.result.status,
    generatedAt: student.result.generatedAt.toISOString(),
  };

  return NextResponse.json({ data: result });
}
