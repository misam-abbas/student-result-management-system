import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StudentForm } from "@/components/admin/student-form";
import type { StudentUpdateInput } from "@/lib/validations";

interface EditStudentPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditStudentPage({ params }: EditStudentPageProps) {
  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: { marks: { include: { subject: true } } },
  });

  if (!student) notFound();

  const defaultValues: StudentUpdateInput = {
    name: student.name,
    fatherName: student.fatherName,
    rollNumber: student.rollNumber,
    cnic: student.cnic,
    departmentId: student.departmentId,
    semesterId: student.semesterId,
    marks: student.marks.map((m) => ({
      subjectId: m.subjectId,
      subjectName: m.subject.name,
      obtainedMarks: m.obtainedMarks,
      totalMarks: m.totalMarks,
    })),
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text-950 dark:text-ink-100">
        Edit Student
      </h1>
      <p className="mt-1 text-sm text-text-950/55 dark:text-ink-100/55">
        Update {student.name}&apos;s details or marks. The result is recalculated automatically.
      </p>

      <div className="mt-6">
        <StudentForm mode="edit" studentId={student.id} defaultValues={defaultValues} />
      </div>
    </div>
  );
}
