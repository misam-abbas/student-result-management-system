/**
 * Prisma seed script.
 *
 * Run with: npm run db:seed
 * (Also runs automatically after `prisma migrate dev` if configured — see
 * the "prisma.seed" field in package.json.)
 *
 * Creates:
 *   - 1 Admin user   (admin / admin123)
 *   - 1 HOD user     (hod / hod123)
 *   - 4 Departments
 *   - 2 Semesters, each with 5 subjects
 *   - 10 demo students with marks + computed results
 *
 * Safe to re-run: uses upsert/skip-if-exists logic throughout, so running
 * it twice will not create duplicate rows or crash on unique constraints.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { computeResult } from "../lib/calculations";

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

async function seedUsers() {
  const adminPassword = await bcrypt.hash("admin123", SALT_ROUNDS);
  const hodPassword = await bcrypt.hash("hod123", SALT_ROUNDS);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", password: adminPassword, role: "ADMIN" },
  });

  await prisma.user.upsert({
    where: { username: "hod" },
    update: {},
    create: { username: "hod", password: hodPassword, role: "HOD" },
  });

  console.log("✔ Seeded users: admin/admin123, hod/hod123");
}

async function seedDepartments() {
  const departments = [
    { name: "Computer Science", code: "CS" },
    { name: "Electrical Engineering", code: "EE" },
    { name: "Business Administration", code: "BBA" },
    { name: "Mathematics", code: "MATH" },
  ];

  const created = [];
  for (const dept of departments) {
    const record = await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept,
    });
    created.push(record);
  }

  console.log(`✔ Seeded ${created.length} departments`);
  return created;
}

async function seedSemestersAndSubjects() {
  const semesterDefs = [
    {
      number: 1,
      label: "Semester 1",
      subjects: ["Programming Fundamentals", "Calculus I", "English Composition", "Physics", "Digital Logic Design"],
    },
    {
      number: 2,
      label: "Semester 2",
      subjects: ["Object Oriented Programming", "Discrete Mathematics", "Data Structures", "Linear Algebra", "Database Systems"],
    },
  ];

  const semesters = [];
  for (const def of semesterDefs) {
    const semester = await prisma.semester.upsert({
      where: { number: def.number },
      update: { label: def.label },
      create: { number: def.number, label: def.label },
    });

    for (const subjectName of def.subjects) {
      await prisma.subject.upsert({
        where: { semesterId_name: { semesterId: semester.id, name: subjectName } },
        update: {},
        create: { name: subjectName, semesterId: semester.id, totalMarks: 100 },
      });
    }

    semesters.push(semester);
  }

  console.log(`✔ Seeded ${semesters.length} semesters with subjects`);
  return semesters;
}

/** Deterministic pseudo-random CNIC generator for demo data (not real CNICs). */
function demoCnic(seed: number): string {
  const part1 = String(42000 + seed).padStart(5, "0");
  const part2 = String(1000000 + seed * 137).slice(-7);
  const part3 = String(seed % 10);
  return `${part1}-${part2}-${part3}`;
}

async function seedStudents(
  departments: { id: string; code: string }[],
  semesters: { id: string; number: number }[]
) {
  const existingCount = await prisma.student.count();
  if (existingCount > 0) {
    console.log(`↷ Skipped student seeding — ${existingCount} students already exist`);
    return;
  }

  const findDept = (code: string) => departments.find((d) => d.code === code)!;
  const findSem = (num: number) => semesters.find((s) => s.number === num)!;

  const demoStudents = [
    { name: "Ayesha Khan", fatherName: "Imran Khan", rollNumber: "CS-2024-001", deptCode: "CS", semNumber: 1, pattern: "high" },
    { name: "Bilal Ahmed", fatherName: "Tariq Ahmed", rollNumber: "CS-2024-002", deptCode: "CS", semNumber: 2, pattern: "high" },
    { name: "Sana Malik", fatherName: "Farooq Malik", rollNumber: "EE-2024-003", deptCode: "EE", semNumber: 1, pattern: "mid" },
    { name: "Hassan Raza", fatherName: "Naveed Raza", rollNumber: "EE-2024-004", deptCode: "EE", semNumber: 2, pattern: "mid" },
    { name: "Zainab Ali", fatherName: "Asif Ali", rollNumber: "BBA-2024-005", deptCode: "BBA", semNumber: 1, pattern: "high" },
    { name: "Usman Sheikh", fatherName: "Rashid Sheikh", rollNumber: "BBA-2024-006", deptCode: "BBA", semNumber: 2, pattern: "low" },
    { name: "Mahnoor Iqbal", fatherName: "Zafar Iqbal", rollNumber: "MATH-2024-007", deptCode: "MATH", semNumber: 1, pattern: "mid" },
    { name: "Fahad Aziz", fatherName: "Shahid Aziz", rollNumber: "MATH-2024-008", deptCode: "MATH", semNumber: 2, pattern: "fail" },
    { name: "Iqra Yousaf", fatherName: "Amjad Yousaf", rollNumber: "CS-2024-009", deptCode: "CS", semNumber: 1, pattern: "mid" },
    { name: "Omar Farooqi", fatherName: "Kamran Farooqi", rollNumber: "EE-2024-010", deptCode: "EE", semNumber: 2, pattern: "high" },
  ] as const;

  const marksPatterns: Record<string, number[]> = {
    high: [92, 88, 95, 90, 87],
    mid: [78, 72, 68, 75, 70],
    low: [58, 62, 55, 60, 57],
    fail: [40, 35, 45, 38, 42],
  };

  for (let i = 0; i < demoStudents.length; i++) {
    const s = demoStudents[i];
    const department = findDept(s.deptCode);
    const semester = findSem(s.semNumber);

    const subjects = await prisma.subject.findMany({ where: { semesterId: semester.id } });
    const pattern = marksPatterns[s.pattern];

    const marksData = subjects.map((subject, idx) => ({
      subjectId: subject.id,
      obtainedMarks: pattern[idx % pattern.length],
      totalMarks: subject.totalMarks,
    }));

    const computed = computeResult(marksData);

    const student = await prisma.student.create({
      data: {
        name: s.name,
        fatherName: s.fatherName,
        rollNumber: s.rollNumber,
        cnic: demoCnic(i + 1),
        departmentId: department.id,
        semesterId: semester.id,
        marks: { create: marksData },
      },
    });

    await prisma.result.create({
      data: {
        studentId: student.id,
        totalMarks: computed.totalMarks,
        obtainedMarks: computed.obtainedMarks,
        percentage: computed.percentage,
        gpa: computed.gpa,
        status: computed.status,
      },
    });
  }

  console.log(`✔ Seeded ${demoStudents.length} demo students with results`);
}

async function main() {
  console.log("🌱 Starting database seed…\n");
  await seedUsers();
  const departments = await seedDepartments();
  const semesters = await seedSemestersAndSubjects();
  await seedStudents(departments, semesters);
  console.log("\n✅ Seed complete.");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
