import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { DashboardStats } from "@/types";

/**
 * GET /api/dashboard
 * Admin-only. Aggregate statistics for the dashboard cards.
 */
export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [totalStudents, passedStudents, failedStudents, aggregate, recent] = await prisma.$transaction([
    prisma.student.count(),
    prisma.result.count({ where: { status: "PASS" } }),
    prisma.result.count({ where: { status: "FAIL" } }),
    prisma.result.aggregate({
      _avg: { gpa: true, percentage: true },
      _max: { percentage: true },
      _min: { percentage: true },
    }),
    prisma.student.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { department: true },
    }),
  ]);

  const stats: DashboardStats = {
    totalStudents,
    passedStudents,
    failedStudents,
    averageGPA: Math.round((aggregate._avg.gpa ?? 0) * 100) / 100,
    averagePercentage: Math.round((aggregate._avg.percentage ?? 0) * 100) / 100,
    highestPercentage: aggregate._max.percentage ?? 0,
    lowestPercentage: aggregate._min.percentage ?? 0,
    recentStudents: recent.map((s) => ({
      id: s.id,
      name: s.name,
      rollNumber: s.rollNumber,
      department: s.department.name,
      createdAt: s.createdAt.toISOString(),
    })),
  };

  return NextResponse.json({ data: stats });
}
