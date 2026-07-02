"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/constants/routes";

export interface DeleteStudentResult {
  success: boolean;
  error?: string;
}

export async function deleteStudentAction(studentId: string): Promise<DeleteStudentResult> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.student.delete({ where: { id: studentId } });
  } catch {
    return { success: false, error: "Failed to delete student. They may have already been removed." };
  }

  revalidatePath(ROUTES.adminStudents);
  revalidatePath(ROUTES.adminDashboard);
  return { success: true };
}
