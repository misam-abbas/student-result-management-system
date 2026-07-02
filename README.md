# Student Result Management System

A full-stack academic results portal built with Next.js 15, Prisma, and PostgreSQL. Admins manage students and marks, Heads of Department review passing students read-only, and students look up their own results with no login required.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Prisma Setup](#prisma-setup)
- [Running Locally](#running-locally)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Demo Credentials](#demo-credentials)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Features

**Landing page** — role selection (Student / Admin / HOD), glassmorphism, gradient background, full dark/light mode, animated cards.

**Admin** (login required)
- Add / edit / delete students
- Enter marks per subject; percentage, GPA, and pass/fail are calculated automatically
- Search and filter students by name, roll number, CNIC, department, semester, status
- Dashboard: total/passed/failed students, average GPA, average/highest/lowest percentage, recently added students

**HOD** (login required, strictly read-only)
- View students with 60% or higher
- Search and filter — no create/edit/delete access anywhere in the UI or API

**Student** (no login)
- Enter CNIC + Roll Number to view a result
- Download a professional PDF or print directly
- All fields from the spec: subjects, marks, percentage, GPA, pass/fail, date generated

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (Neon, via Vercel Storage) |
| ORM | Prisma 6 |
| Auth | NextAuth v5 (Auth.js) — Credentials provider, JWT sessions |
| Forms | React Hook Form + Zod |
| PDF | jsPDF + jspdf-autotable |
| Icons | lucide-react |
| Toasts | sonner |

---

## Project Structure

```
app/
  admin/(shell)/         # Dashboard, students list, add/edit — wrapped in AdminShell
  admin/login/           # Admin login (outside the shell)
  hod/(shell)/           # HOD dashboard — wrapped in HodShell
  hod/login/             # HOD login
  student/               # Public result lookup
  api/                   # REST routes (see API Endpoints)
  layout.tsx, page.tsx   # Root layout + landing page
  error.tsx, not-found.tsx
components/
  admin/, hod/, student/ # Role-specific components
  landing/, shared/, ui/ # Shared building blocks
lib/
  auth/credentials.ts    # Shared login verification (used by NextAuth + /api/login)
  calculations.ts        # GPA/percentage/status — single source of truth
  pdf/                   # Client-side PDF generation
  prisma.ts              # Prisma client singleton
  validations.ts         # All Zod schemas
actions/                 # Server Actions (logout, delete student)
hooks/                   # useTheme, useDebounce
prisma/
  schema.prisma
  seed.ts
constants/routes.ts       # Route map + middleware path config
types/                    # Shared TypeScript types
auth.ts, auth.config.ts   # NextAuth config (split for Edge-runtime middleware)
middleware.ts              # Protects /admin/* and /hod/*
database.sql                # Standalone SQL import (see Database Setup)
```

---

## Installation

**Requirements:** Node.js 20+, npm, a PostgreSQL database (a free [Neon](https://neon.tech) database works well, and is what Vercel provisions automatically).

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
npm install
cp .env.example .env
```

Fill in `.env` — see [Environment Variables](#environment-variables) — then continue to [Database Setup](#database-setup).

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Pooled Postgres connection string. Used by the app at runtime. |
| `DIRECT_URL` | Direct (unpooled) Postgres connection string. Used only by Prisma Migrate. |
| `AUTH_SECRET` | Random secret for signing session JWTs. Generate with `openssl rand -base64 32`. |
| `AUTH_URL` | Only needed locally; defaults correctly on Vercel. E.g. `http://localhost:3000`. |

See `.env.example` for the full template.

> **Why two database URLs?** Neon (and most serverless Postgres providers) offer a connection pooler for many short-lived serverless requests, and a direct connection for schema changes. Prisma Migrate needs the direct one; the app needs the pooled one. This is standard practice for Prisma + Neon/Vercel — see the [Prisma + Neon guide](https://www.prisma.io/docs/orm/overview/databases/neon) if you want the full explanation.

---

## Database Setup

You have two options. **Prisma Migrate is recommended** — it's the source of truth for the schema and keeps your migration history intact.

### Option A — Prisma Migrate (recommended)

```bash
npx prisma migrate dev --name init
```

This creates the database tables from `prisma/schema.prisma` and (via the `prisma.seed` entry in `package.json`) automatically runs the seed script. Skip to [Running Locally](#running-locally).

### Option B — Direct SQL import

If you'd rather provision the database with raw SQL (e.g. via a GUI tool, or you don't want to run migrations locally):

```bash
psql "$DIRECT_URL" -f database.sql
```

`database.sql` mirrors `schema.prisma` exactly and includes the same seed data. It's idempotent — safe to run more than once. **If you use this path, still run `npx prisma generate`** afterward so the TypeScript client matches the schema; you just skip `migrate dev` itself since the tables already exist.

> Whichever option you choose, `prisma/schema.prisma` remains the source of truth going forward. If you hand-edit `database.sql` without a matching Prisma migration, the two will drift out of sync.

---

## Prisma Setup

```bash
npx prisma generate       # Regenerate the typed client after any schema change
npx prisma migrate dev    # Create + apply a new migration in development
npx prisma migrate deploy # Apply pending migrations in production (used in the Vercel build)
npx prisma studio         # Visual database browser
npm run db:seed           # Re-run the seed script manually
```

`postinstall` in `package.json` runs `prisma generate` automatically after every `npm install`, including on Vercel.

---

## Running Locally

```bash
npm run dev
```

Visit `http://localhost:3000`. The landing page lets you choose a role:

- **Student** → `/student` (no login)
- **Admin** → `/admin/login` → `admin` / `admin123`
- **HOD** → `/hod/login` → `hod` / `hod123`

Other useful scripts:

```bash
npm run build       # Production build
npm run start       # Serve the production build
npm run lint         # ESLint
npm run typecheck   # TypeScript, no emit
```

---

## Authentication

- **Admin** and **HOD** authenticate via NextAuth's Credentials provider. Passwords are hashed with bcrypt (12 salt rounds) and never stored in plaintext.
- Sessions are JWT-based (no session table needed).
- `middleware.ts` protects every `/admin/*` and `/hod/*` route, redirecting unauthenticated or wrong-role users to the matching login page. This check happens on the Edge runtime by reading the signed session cookie — see `auth.config.ts`.
- **Students never authenticate.** `/student` is a public route; the lookup requires an exact CNIC + Roll Number match, and the API returns the same generic error whether the CNIC, the roll number, or both are wrong — so a wrong guess can't be used to work out which part was incorrect.
- `POST /api/login` is a standalone, curl/Postman-testable endpoint that shares the exact same verification logic as the UI login forms (`lib/auth/credentials.ts`), so there's one source of truth for "is this a valid login" — but note that this REST endpoint itself does not set the browser session cookie (the UI login forms use NextAuth's `signIn()` for that).

---

## API Endpoints

All routes are under `/api`. Admin/HOD-only routes check the session server-side and return `401` if the role doesn't match — this is enforced independently of the UI, not just hidden by it.

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/login` | Public | Standalone credential check (see above) |
| GET / POST | `/api/students` | Admin | List (search/filter/paginate) / create a student |
| GET / PUT / DELETE | `/api/students/:id` | Admin | Read / update / delete one student |
| GET | `/api/student-result` | Public | `?cnic=&rollNumber=` — the student lookup |
| GET | `/api/hod/results` | HOD | Read-only, percentage ≥ 60 |
| GET | `/api/dashboard` | Admin | Aggregate statistics |
| GET / POST | `/api/departments` | Admin/HOD read, Admin write | |
| GET | `/api/semesters` | Admin/HOD | |
| GET / POST | `/api/subjects` | Admin/HOD read, Admin write | |
| * | `/api/auth/[...nextauth]` | — | NextAuth internals (session, sign-in, sign-out) |

---

## Demo Credentials

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| HOD | `hod` | `hod123` |

**Change these before using this project with real student data.** The seed script hashes them with bcrypt, so update `prisma/seed.ts` (and re-seed) or update the row directly in your database.

---

## Deployment

Full beginner-friendly walkthrough (GitHub → Vercel → Neon Postgres → env vars → migrate → seed) is in **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

---

## Troubleshooting

**`Error: P1001: Can't reach database server`**
Check `DATABASE_URL`/`DIRECT_URL` are correct and that your IP isn't blocked — Neon allows all IPs by default, but double check if you've changed that.

**`Error: @prisma/client did not initialize yet`**
Run `npx prisma generate`. This runs automatically via `postinstall`, but if you interrupted an install, it may not have completed.

**Login fails with correct demo credentials**
Confirm the database was actually seeded (`npm run db:seed`) — the `users` table needs the bcrypt-hashed admin/hod rows to exist.

**Vercel build fails on `prisma migrate deploy`**
Make sure `DIRECT_URL` is set in Vercel's environment variables — the pooled `DATABASE_URL` alone cannot run migrations.

**Students page shows no departments/semesters in the dropdowns**
The seed script populates these. If you used the raw `database.sql` import instead of `prisma migrate dev`, confirm it ran without errors.

**CNIC validation rejects a real CNIC**
The format is strictly `xxxxx-xxxxxxx-x` (5 digits, dash, 7 digits, dash, 1 digit) — the input field auto-formats as you type, so paste the 13 raw digits and let it format itself.
