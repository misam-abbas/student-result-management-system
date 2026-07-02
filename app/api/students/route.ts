import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { studentFormSchema, studentQuerySchema } from "@/lib/validations";
import { computeResult } from "@/lib/calculations";

/**
 * GET /api/students
 * Admin-only. Supports ?search=&departmentId=&semesterId=&status=&page=&pageSize=
 */
export async function GET(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = studentQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const { search, departmentId, semesterId, status, page, pageSize } = parsed.data;

  const where: Prisma.StudentWhereInput = {
    ...(departmentId ? { departmentId } : {}),
    ...(semesterId ? { semesterId } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { rollNumber: { contains: search, mode: "insensitive" } },
            { cnic: { contains: search } },
          ],
        }
      : {}),
    ...(status && status !== "ALL" ? { result: { status } } : {}),
  };

  const [data, total] = await prisma.$transaction([
    prisma.student.findMany({
      where,
      include: { department: true, semester: true, result: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.student.count({ where }),
  ]);

  return NextResponse.json({
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  });
}

/**
 * POST /api/students
 * Admin-only. Creates a student with their initial marks in one
 * transaction, then computes and stores the derived Result row.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const parsed = studentFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, fatherName, rollNumber, cnic, departmentId, semesterId, marks } = parsed.data;

  const [existingRoll, existingCnic] = await Promise.all([
    prisma.student.findUnique({ where: { rollNumber } }),
    prisma.student.findUnique({ where: { cnic } }),
  ]);
  if (existingRoll) {
    return NextResponse.json({ error: "This roll number is already registered" }, { status: 409 });
  }
  if (existingCnic) {
    return NextResponse.json({ error: "This CNIC is already registered" }, { status: 409 });
  }

  const computed = computeResult(marks);

  try {
    const student = await prisma.$transaction(async (tx) => {
      const created = await tx.student.create({
        data: {
          name,
          fatherName,
          rollNumber,
          cnic,
          departmentId,
          semesterId,
          marks: {
            create: marks.map((m) => ({
              subjectId: m.subjectId,
              obtainedMarks: m.obtainedMarks,
              totalMarks: m.totalMarks,
            })),
          },
        },
      });

      await tx.result.create({
        data: {
          studentId: created.id,
          totalMarks: computed.totalMarks,
          obtainedMarks: computed.obtainedMarks,
          percentage: computed.percentage,
          gpa: computed.gpa,
          status: computed.status,
        },
      });

      return tx.student.findUniqueOrThrow({
        where: { id: created.id },
        include: {
          department: true,
          semester: true,
          marks: { include: { subject: true } },
          result: true,
        },
      });
    });

    return NextResponse.json({ data: student }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A record with these details already exists" }, { status: 409 });
    }
    console.error("Failed to create student:", error);
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}
