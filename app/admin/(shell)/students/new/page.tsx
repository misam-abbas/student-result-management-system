import { StudentForm } from "@/components/admin/student-form";

export default function NewStudentPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text-950 dark:text-ink-100">
        Add Student
      </h1>
      <p className="mt-1 text-sm text-text-950/55 dark:text-ink-100/55">
        Enter student details and subject marks. Percentage, GPA, and pass/fail status are
        calculated automatically.
      </p>

      <div className="mt-6">
        <StudentForm mode="create" />
      </div>
    </div>
  );
}
