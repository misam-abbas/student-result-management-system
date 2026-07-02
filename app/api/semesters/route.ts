import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** GET /api/semesters — any authenticated Admin or HOD user. */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const semesters = await prisma.semester.findMany({ orderBy: { number: "asc" } });
  return NextResponse.json({ data: semesters });
}
