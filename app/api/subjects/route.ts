import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { subjectSchema } from "@/lib/validations";

/** GET /api/subjects?semesterId=... — any authenticated Admin or HOD user. */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const semesterId = searchParams.get("semesterId") || undefined;

  const subjects = await prisma.subject.findMany({
    where: semesterId ? { semesterId } : undefined,
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ data: subjects });
}

/** POST /api/subjects — Admin-only quick-add, used from the student form. */
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

  const parsed = subjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const subject = await prisma.subject.create({ data: parsed.data });
    return NextResponse.json({ data: subject }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "This subject already exists for the selected semester" }, { status: 409 });
    }
    console.error("Failed to create subject:", error);
    return NextResponse.json({ error: "Failed to create subject" }, { status: 500 });
  }
}
