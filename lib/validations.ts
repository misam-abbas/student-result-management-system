import { z } from "zod";
import { CNIC_PATTERN } from "@/utils/cnic";

export const cnicSchema = z
  .string()
  .regex(CNIC_PATTERN, "CNIC must be in the format xxxxx-xxxxxxx-x");

export const roleSchema = z.enum(["ADMIN", "HOD"]);

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  role: roleSchema,
});
export type LoginInput = z.infer<typeof loginSchema>;

// Used by the login forms themselves (role is injected at submit time).
export const credentialsSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
export type CredentialsInput = z.infer<typeof credentialsSchema>;

export const subjectMarkSchema = z
  .object({
    subjectId: z.string().min(1, "Subject is required"),
    subjectName: z.string().optional(), // convenience field for new/unsaved subjects in the UI
    // NOTE: plain z.number(), not z.coerce.number() — the <input type="number">
    // fields in StudentForm use react-hook-form's `valueAsNumber: true`, which
    // already converts the DOM string to a real number before Zod ever sees
    // it. Using z.coerce here too would make the schema's *input* type
    // diverge from its *output* type (unknown vs number), which breaks
    // zodResolver's generic inference against useForm<StudentUpdateInput>.
    obtainedMarks: z.number({ error: "Enter obtained marks" }).min(0, "Marks cannot be negative"),
    totalMarks: z.number({ error: "Enter total marks" }).min(1, "Total marks must be at least 1"),
  })
  .refine((data) => data.obtainedMarks <= data.totalMarks, {
    message: "Obtained marks cannot exceed total marks",
    path: ["obtainedMarks"],
  });
export type SubjectMarkInput = z.infer<typeof subjectMarkSchema>;

export const studentFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  fatherName: z.string().min(2, "Father's name must be at least 2 characters").max(100),
  rollNumber: z
    .string()
    .min(1, "Roll number is required")
    .max(30, "Roll number is too long")
    .regex(/^[A-Za-z0-9\-/]+$/, "Roll number can only contain letters, numbers, - and /"),
  cnic: cnicSchema,
  departmentId: z.string().min(1, "Department is required"),
  semesterId: z.string().min(1, "Semester is required"),
  marks: z.array(subjectMarkSchema).min(1, "Add at least one subject"),
});
export type StudentFormInput = z.infer<typeof studentFormSchema>;

// Marks are optional on update — an admin may just be correcting a name.
export const studentUpdateSchema = studentFormSchema.extend({
  marks: z.array(subjectMarkSchema).optional(),
});
export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>;

export const studentLookupSchema = z.object({
  cnic: cnicSchema,
  rollNumber: z.string().min(1, "Roll number is required"),
});
export type StudentLookupInput = z.infer<typeof studentLookupSchema>;

export const departmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  code: z
    .string()
    .min(1, "Code is required")
    .max(20)
    .regex(/^[A-Za-z0-9]+$/, "Code can only contain letters and numbers"),
});
export type DepartmentInput = z.infer<typeof departmentSchema>;

export const subjectSchema = z.object({
  name: z.string().min(1, "Subject name is required").max(100),
  code: z.string().max(20).optional(),
  totalMarks: z.coerce.number().min(1).max(1000).default(100),
  semesterId: z.string().min(1, "Semester is required"),
});
export type SubjectInput = z.infer<typeof subjectSchema>;

export const studentQuerySchema = z.object({
  search: z.string().optional(),
  departmentId: z.string().optional(),
  semesterId: z.string().optional(),
  status: z.enum(["PASS", "FAIL", "ALL"]).optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
});
export type StudentQueryInput = z.infer<typeof studentQuerySchema>;
