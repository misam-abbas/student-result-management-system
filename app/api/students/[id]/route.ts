import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { studentUpdateSchema } from "@/lib/validations";
import { computeResult } from "@/lib/calculations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/students/:id
 * Admin-only. Updates student details and, if a marks array is supplied,
 * replaces all marks and recomputes the Result row.
 */
export async function PUT(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.student.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const parsed = studentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, fatherName, rollNumber, cnic, departmentId, semesterId, marks } = parsed.data;

  const [rollConflict, cnicConflict] = await Promise.all([
    prisma.student.findUnique({ where: { rollNumber } }),
    prisma.student.findUnique({ where: { cnic } }),
  ]);
  if (rollConflict && rollConflict.id !== id) {
    return NextResponse.json({ error: "This roll number is already registered" }, { status: 409 });
  }
  if (cnicConflict && cnicConflict.id !== id) {
    return NextResponse.json({ error: "This CNIC is already registered" }, { status: 409 });
  }

  try {
    const student = await prisma.$transaction(async (tx) => {
      await tx.student.update({
        where: { id },
        data: { name, fatherName, rollNumber, cnic, departmentId, semesterId },
      });

      if (marks && marks.length > 0) {
        await tx.marks.deleteMany({ where: { studentId: id } });
        await tx.marks.createMany({
          data: marks.map((m) => ({
            studentId: id,
            subjectId: m.subjectId,
            obtainedMarks: m.obtainedMarks,
            totalMarks: m.totalMarks,
          })),
        });

        const computed = computeResult(marks);
        await tx.result.upsert({
          where: { studentId: id },
          create: {
            studentId: id,
            totalMarks: computed.totalMarks,
            obtainedMarks: computed.obtainedMarks,
            percentage: computed.percentage,
            gpa: computed.gpa,
            status: computed.status,
          },
          update: {
            totalMarks: computed.totalMarks,
            obtainedMarks: computed.obtainedMarks,
            percentage: computed.percentage,
            gpa: computed.gpa,
            status: computed.status,
          },
        });
      }

      return tx.student.findUniqueOrThrow({
        where: { id },
        include: {
          department: true,
          semester: true,
          marks: { include: { subject: true } },
          result: true,
        },
      });
    });

    return NextResponse.json({ data: student });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A record with these details already exists" }, { status: 409 });
    }
    console.error("Failed to update student:", error);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

/**
 * DELETE /api/students/:id
 * Admin-only. Marks and the Result row cascade-delete automatically.
 */
export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.student.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  await prisma.student.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

/**
 * GET /api/students/:id
 * Admin-only. Fetches a single student with relations (used to prefill
 * the edit form).
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      department: true,
      semester: true,
      marks: { include: { subject: true } },
      result: true,
    },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  return NextResponse.json({ data: student });
}
