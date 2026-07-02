-- ============================================================================
-- Student Result Management System — Database Schema & Seed Data
-- ============================================================================
-- This file is a standalone reference/import path for PostgreSQL. It
-- mirrors prisma/schema.prisma column-for-column and constraint-for-
-- constraint. It is provided for direct `psql` import if you ever need to
-- provision the database without running Prisma Migrate.
--
-- THE SOURCE OF TRUTH FOR SCHEMA CHANGES IS ALWAYS prisma/schema.prisma,
-- managed through `npx prisma migrate dev`. If you edit the schema, update
-- it there first and generate a new migration — do not hand-edit this file
-- and expect Prisma to know about it. See README.md → "Database Setup".
--
-- Usage:
--   psql "$DIRECT_URL" -f database.sql
--
-- Safe to re-run: every statement uses IF NOT EXISTS / ON CONFLICT DO NOTHING.
-- ============================================================================

-- ---- Extensions -------------------------------------------------------
-- Needed for gen_random_uuid(), used as the server-side default for all
-- primary keys so rows inserted outside of Prisma Client still get a valid
-- UUID automatically.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---- Enums --------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('ADMIN', 'HOD');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ResultStatus" AS ENUM ('PASS', 'FAIL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- Tables (created in dependency order)
-- ============================================================================

-- ---- users ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "users" (
  "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "username"  TEXT NOT NULL UNIQUE,
  "password"  TEXT NOT NULL,
  "role"      "Role" NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users" ("role");

-- ---- departments ------------------------------------------------------
CREATE TABLE IF NOT EXISTS "departments" (
  "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"      TEXT NOT NULL UNIQUE,
  "code"      TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---- semesters --------------------------------------------------------
CREATE TABLE IF NOT EXISTS "semesters" (
  "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "number"    INTEGER NOT NULL UNIQUE,
  "label"     TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---- subjects -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS "subjects" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"       TEXT NOT NULL,
  "code"       TEXT,
  "totalMarks" INTEGER NOT NULL DEFAULT 100,
  "semesterId" UUID NOT NULL REFERENCES "semesters" ("id") ON DELETE CASCADE,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "subjects_semesterId_name_key" UNIQUE ("semesterId", "name")
);
CREATE INDEX IF NOT EXISTS "subjects_semesterId_idx" ON "subjects" ("semesterId");

-- ---- students -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS "students" (
  "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"         TEXT NOT NULL,
  "fatherName"   TEXT NOT NULL,
  "rollNumber"   TEXT NOT NULL UNIQUE,
  "cnic"         TEXT NOT NULL UNIQUE,
  "departmentId" UUID NOT NULL REFERENCES "departments" ("id") ON DELETE RESTRICT,
  "semesterId"   UUID NOT NULL REFERENCES "semesters" ("id") ON DELETE RESTRICT,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "students_cnic_format_check" CHECK ("cnic" ~ '^\d{5}-\d{7}-\d{1}$')
);
CREATE INDEX IF NOT EXISTS "students_departmentId_idx" ON "students" ("departmentId");
CREATE INDEX IF NOT EXISTS "students_semesterId_idx" ON "students" ("semesterId");
CREATE INDEX IF NOT EXISTS "students_cnic_rollNumber_idx" ON "students" ("cnic", "rollNumber");

-- ---- marks ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "marks" (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "studentId"     UUID NOT NULL REFERENCES "students" ("id") ON DELETE CASCADE,
  "subjectId"     UUID NOT NULL REFERENCES "subjects" ("id") ON DELETE CASCADE,
  "obtainedMarks" DOUBLE PRECISION NOT NULL,
  "totalMarks"    DOUBLE PRECISION NOT NULL,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "marks_studentId_subjectId_key" UNIQUE ("studentId", "subjectId"),
  CONSTRAINT "marks_not_exceeding_total_check" CHECK ("obtainedMarks" <= "totalMarks")
);
CREATE INDEX IF NOT EXISTS "marks_studentId_idx" ON "marks" ("studentId");
CREATE INDEX IF NOT EXISTS "marks_subjectId_idx" ON "marks" ("subjectId");

-- ---- results --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "results" (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "studentId"     UUID NOT NULL UNIQUE REFERENCES "students" ("id") ON DELETE CASCADE,
  "totalMarks"    DOUBLE PRECISION NOT NULL,
  "obtainedMarks" DOUBLE PRECISION NOT NULL,
  "percentage"    DOUBLE PRECISION NOT NULL,
  "gpa"           DOUBLE PRECISION NOT NULL,
  "status"        "ResultStatus" NOT NULL,
  "generatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "results_status_idx" ON "results" ("status");
CREATE INDEX IF NOT EXISTS "results_percentage_idx" ON "results" ("percentage");

-- ============================================================================
-- Seed Data
-- ============================================================================

-- ---- Admin + HOD users ------------------------------------------------
-- Password hashes below are real bcrypt hashes (12 salt rounds) for:
--   admin / admin123
--   hod   / hod123
-- Generated with Node's bcrypt package — verified against these exact
-- plaintext passwords before being committed to this file.
INSERT INTO "users" ("username", "password", "role") VALUES
  ('admin', '$2b$12$iE9NNluNGuZK7r517sAqqO8M.w98aDAylyr9W32strL/MY5hW2EiS', 'ADMIN'),
  ('hod',   '$2b$12$Vjas9GsJcCvIX85OfhvnNe.3kDFUGXKjKHaQTIwodxxRTa0ytIUCK', 'HOD')
ON CONFLICT ("username") DO NOTHING;

-- ---- Departments ------------------------------------------------------
INSERT INTO "departments" ("name", "code") VALUES
  ('Computer Science', 'CS'),
  ('Electrical Engineering', 'EE'),
  ('Business Administration', 'BBA'),
  ('Mathematics', 'MATH')
ON CONFLICT ("name") DO NOTHING;

-- ---- Semesters ----------------------------------------------------------
INSERT INTO "semesters" ("number", "label") VALUES
  (1, 'Semester 1'),
  (2, 'Semester 2')
ON CONFLICT ("number") DO NOTHING;

-- ---- Subjects (5 per semester) ------------------------------------------
INSERT INTO "subjects" ("name", "totalMarks", "semesterId")
SELECT s.name, 100, sem.id
FROM (VALUES
  ('Programming Fundamentals', 1),
  ('Calculus I', 1),
  ('English Composition', 1),
  ('Physics', 1),
  ('Digital Logic Design', 1),
  ('Object Oriented Programming', 2),
  ('Discrete Mathematics', 2),
  ('Data Structures', 2),
  ('Linear Algebra', 2),
  ('Database Systems', 2)
) AS s(name, sem_number)
JOIN "semesters" sem ON sem."number" = s.sem_number
ON CONFLICT ("semesterId", "name") DO NOTHING;

-- ---- 10 Demo Students, with marks + computed results ---------------------
-- Percentage/GPA/status below are pre-computed using the project's grading
-- table (see lib/calculations.ts) so they match exactly what the app would
-- calculate for the same marks.
DO $$
DECLARE
  dept_cs UUID; dept_ee UUID; dept_bba UUID; dept_math UUID;
  sem_1 UUID; sem_2 UUID;
  new_student_id UUID;
  subj RECORD;
  marks_high INTEGER[] := ARRAY[92, 88, 95, 90, 87];
  marks_mid  INTEGER[] := ARRAY[78, 72, 68, 75, 70];
  marks_low  INTEGER[] := ARRAY[58, 62, 55, 60, 57];
  marks_fail INTEGER[] := ARRAY[40, 35, 45, 38, 42];
  student_row RECORD;
  idx INTEGER;
  pattern INTEGER[];
  total_marks NUMERIC;
  obtained_marks NUMERIC;
  pct NUMERIC;
  gpa_value NUMERIC;
  result_status "ResultStatus";
BEGIN
  SELECT id INTO dept_cs FROM "departments" WHERE "code" = 'CS';
  SELECT id INTO dept_ee FROM "departments" WHERE "code" = 'EE';
  SELECT id INTO dept_bba FROM "departments" WHERE "code" = 'BBA';
  SELECT id INTO dept_math FROM "departments" WHERE "code" = 'MATH';
  SELECT id INTO sem_1 FROM "semesters" WHERE "number" = 1;
  SELECT id INTO sem_2 FROM "semesters" WHERE "number" = 2;

  FOR student_row IN
    SELECT * FROM (VALUES
      ('Ayesha Khan',    'Imran Khan',     'CS-2024-001',   '42001-1000137-1', dept_cs,   sem_1, 'high'),
      ('Bilal Ahmed',    'Tariq Ahmed',    'CS-2024-002',   '42002-1000274-2', dept_cs,   sem_2, 'high'),
      ('Sana Malik',     'Farooq Malik',   'EE-2024-003',   '42003-1000411-3', dept_ee,   sem_1, 'mid'),
      ('Hassan Raza',    'Naveed Raza',    'EE-2024-004',   '42004-1000548-4', dept_ee,   sem_2, 'mid'),
      ('Zainab Ali',     'Asif Ali',       'BBA-2024-005',  '42005-1000685-5', dept_bba,  sem_1, 'high'),
      ('Usman Sheikh',   'Rashid Sheikh',  'BBA-2024-006',  '42006-1000822-6', dept_bba,  sem_2, 'low'),
      ('Mahnoor Iqbal',  'Zafar Iqbal',    'MATH-2024-007', '42007-1000959-7', dept_math, sem_1, 'mid'),
      ('Fahad Aziz',     'Shahid Aziz',    'MATH-2024-008', '42008-1001096-8', dept_math, sem_2, 'fail'),
      ('Iqra Yousaf',    'Amjad Yousaf',   'CS-2024-009',   '42009-1001233-9', dept_cs,   sem_1, 'mid'),
      ('Omar Farooqi',   'Kamran Farooqi', 'EE-2024-010',   '42010-1001370-0', dept_ee,   sem_2, 'high')
    ) AS t(name, father_name, roll_number, cnic, dept_id, sem_id, pattern_name)
  LOOP
    -- Skip if this student already exists (idempotent re-runs).
    IF EXISTS (SELECT 1 FROM "students" WHERE "rollNumber" = student_row.roll_number) THEN
      CONTINUE;
    END IF;

    INSERT INTO "students" ("name", "fatherName", "rollNumber", "cnic", "departmentId", "semesterId")
    VALUES (student_row.name, student_row.father_name, student_row.roll_number, student_row.cnic, student_row.dept_id, student_row.sem_id)
    RETURNING "id" INTO new_student_id;

    pattern := CASE student_row.pattern_name
      WHEN 'high' THEN marks_high
      WHEN 'mid' THEN marks_mid
      WHEN 'low' THEN marks_low
      ELSE marks_fail
    END;

    total_marks := 0;
    obtained_marks := 0;
    idx := 1;

    FOR subj IN
      SELECT "id", "totalMarks" FROM "subjects" WHERE "semesterId" = student_row.sem_id ORDER BY "name"
    LOOP
      INSERT INTO "marks" ("studentId", "subjectId", "obtainedMarks", "totalMarks")
      VALUES (new_student_id, subj."id", pattern[idx], subj."totalMarks");

      total_marks := total_marks + subj."totalMarks";
      obtained_marks := obtained_marks + pattern[idx];
      idx := idx + 1;
    END LOOP;

    pct := ROUND((obtained_marks / total_marks) * 100, 2);
    gpa_value := CASE
      WHEN pct >= 90 THEN 4.00 WHEN pct >= 85 THEN 3.70 WHEN pct >= 80 THEN 3.30
      WHEN pct >= 75 THEN 3.00 WHEN pct >= 70 THEN 2.70 WHEN pct >= 65 THEN 2.30
      WHEN pct >= 60 THEN 2.00 WHEN pct >= 55 THEN 1.70 WHEN pct >= 50 THEN 1.00
      ELSE 0.00
    END;
    result_status := CASE WHEN pct >= 50 THEN 'PASS' ELSE 'FAIL' END;

    INSERT INTO "results" ("studentId", "totalMarks", "obtainedMarks", "percentage", "gpa", "status")
    VALUES (new_student_id, total_marks, obtained_marks, pct, gpa_value, result_status);
  END LOOP;
END $$;

-- ============================================================================
-- End of file
-- ============================================================================
