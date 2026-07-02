import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { HOD_PASSING_THRESHOLD } from "@/constants/routes";
import type { HodResultRow } from "@/types";

/**
 * GET /api/hod/results
 * HOD-only, strictly read-only. Only returns students whose percentage is
 * 60 or above. Supports ?search=&departmentId=&semesterId=
 */
export async function GET(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "HOD") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() || undefined;
  const departmentId = searchParams.get("departmentId") || undefined;
  const semesterId = searchParams.get("semesterId") || undefined;

  const where: Prisma.StudentWhereInput = {
    result: { percentage: { gte: HOD_PASSING_THRESHOLD } },
    ...(departmentId ? { departmentId } : {}),
    ...(semesterId ? { semesterId } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { rollNumber: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const students = await prisma.student.findMany({
    where,
    include: { department: true, semester: true, result: true },
    orderBy: { result: { percentage: "desc" } },
  });

  const rows: HodResultRow[] = students
    .filter((s) => s.result)
    .map((s) => ({
      studentId: s.id,
      name: s.name,
      fatherName: s.fatherName,
      rollNumber: s.rollNumber,
      department: s.department.name,
      semester: s.semester.label,
      percentage: s.result!.percentage,
      gpa: s.result!.gpa,
      status: s.result!.status,
    }));

  return NextResponse.json({ data: rows });
}
