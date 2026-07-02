# Deployment Guide

A complete, beginner-friendly walkthrough from a folder on your computer to a live app on Vercel with a working PostgreSQL database. Every step is something you click or type — no assumed knowledge.

**Time required:** ~20 minutes.

---

## Before you start

You'll need free accounts on:
- [GitHub](https://github.com) — hosts your code
- [Vercel](https://vercel.com) — hosts your app (you can sign up with your GitHub account, which simplifies step 3-4)

---

## 1. Create a GitHub repository

1. Go to [github.com/new](https://github.com/new)
2. **Repository name:** e.g. `student-result-management-system`
3. Keep it **Public** or **Private** — either works with Vercel's free tier
4. **Do not** check "Add a README" or "Add .gitignore" — this project already has both
5. Click **Create repository**
6. Keep this page open — GitHub will show you commands for the next step

---

## 2. Upload the project

Open a terminal in the project folder (the one containing `package.json`) and run:

```bash
git init
git add .
git commit -m "Initial commit — Student Result Management System"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

Replace `<your-username>` and `<your-repo-name>` with your actual GitHub username and the repository name from step 1. Refresh the GitHub page — your files should now be there.

> **Note:** `.env` is deliberately excluded by `.gitignore` — you will never accidentally commit your database password. Only `.env.example` (with no real secrets) is uploaded.

---

## 3. Create a Vercel account

1. Go to [vercel.com/signup](https://vercel.com/signup)
2. Choose **Continue with GitHub** — this is the simplest option since it also handles step 4 automatically
3. Authorize Vercel to access your GitHub account when prompted

---

## 4. Import the GitHub repository into Vercel

1. From the [Vercel dashboard](https://vercel.com/dashboard), click **Add New** → **Project**
2. Find your repository in the list (search if needed) and click **Import**
3. Vercel auto-detects **Next.js** as the framework — leave Framework Preset, Build Command, and Root Directory at their defaults
4. **Do not click Deploy yet** — go to step 5 first. (If you already clicked Deploy and it failed, that's expected — you're missing environment variables. Just come back and redeploy after step 7.)

---

## 5. Create a Postgres database (Neon, via Vercel)

Vercel's own "Vercel Postgres" product has been folded into a native **Neon** integration, accessed through the Storage tab.

1. In your new project, click the **Storage** tab
2. Click **Create Database** (or **Browse Marketplace** if that's what you see)
3. Select **Neon** (Serverless Postgres)
4. Click **Continue**, then **Create New Neon Account** (simplest option — this creates a free Neon account for you automatically, billed through Vercel, no separate signup)
5. Accept the terms, choose a region close to you, and name your database (e.g. `srms-db`)
6. Click **Create**

You'll land on a Storage page showing your new database's status and connection details.

---

## 6. Connect Prisma to your Neon database

1. Still on the database's page in Vercel, click **Connect Project**
2. Choose your project, and check all three environments: **Production**, **Preview**, **Development**
3. Click **Connect**

This automatically injects two environment variables into your Vercel project: `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct). Prisma Migrate needs a variable specifically named `DIRECT_URL` — so there's one small manual step to bridge the naming:

1. Go to **Project Settings → Environment Variables**
2. Find `DATABASE_URL_UNPOOLED` and copy its value
3. Add a **new** variable: Name = `DIRECT_URL`, Value = *(the value you just copied)*, apply to all environments
4. Save

---

## 7. Set all environment variables

While you're on **Project Settings → Environment Variables**, add the remaining one:

| Name | Value | Environments |
|---|---|---|
| `AUTH_SECRET` | Output of `openssl rand -base64 32` (run this in any terminal) | Production, Preview, Development |

You should now have **three** variables set: `DATABASE_URL` and `DATABASE_URL_UNPOOLED` (auto-added by Neon), plus `DIRECT_URL` and `AUTH_SECRET` (added manually) — four total. `AUTH_URL` is not needed on Vercel; it's only for local development.

---

## 8. Running Prisma migrations

This project's `build` script is already configured to run migrations automatically:

```json
"build": "prisma migrate deploy && next build"
```

So you don't need a separate manual migration step — **every deployment applies any pending migrations before building.** This is what actually creates your tables the first time you deploy.

*(If you ever need to run a migration manually against production — for advanced changes — install the Vercel CLI, run `vercel env pull .env`, then `npx prisma migrate deploy` locally.)*

---

## 9. Running the seed file

Seeding (creating the admin/HOD users, departments, semesters, subjects, and 10 demo students) is a one-time step, run **after** your first successful deployment so the tables already exist:

```bash
npm install -g vercel        # if you don't have the Vercel CLI yet
vercel login
vercel link                  # run inside your project folder, link to the project you imported
vercel env pull .env         # pulls DATABASE_URL / DIRECT_URL / AUTH_SECRET from Vercel into a local .env
npm run db:seed
```

You should see `✅ Seed complete.` in the output.

> Prefer not to install the Vercel CLI? Copy the `DATABASE_URL` and `DIRECT_URL` values manually from Project Settings → Environment Variables into a local `.env` file instead, then run `npm run db:seed`.

---

## 10. Deploying the project

1. Go back to the **Deployments** tab of your Vercel project
2. Click **Redeploy** on the most recent deployment (or push a new commit — either triggers a build)
3. Watch the build logs — you should see `prisma migrate deploy` run, then `next build` complete successfully
4. Once it says **Ready**, click **Visit** to open your live URL

---

## 11. Testing authentication

1. Visit your live URL → click **Admin Login**
2. Sign in with `admin` / `admin123` → you should land on the Admin Dashboard
3. Sign out, then click **HOD Login** on the homepage
4. Sign in with `hod` / `hod123` → you should land on the read-only HOD dashboard
5. Try visiting `/admin/dashboard` in a fresh private/incognito window (no session) — you should be redirected to `/admin/login`

---

## 12. Testing the APIs

With your Admin session open, open a new tab and test the public endpoints directly:

```bash
curl "https://<your-app>.vercel.app/api/student-result?cnic=42001-1000137-1&rollNumber=CS-2024-001"
```

You should get back Ayesha Khan's full result as JSON (one of the 10 seeded demo students). A wrong CNIC/roll number combination should return a 404 with a generic error message.

---

## 13. Testing the Student Result page

1. From the homepage, click **Continue as Student**
2. Enter CNIC `42001-1000137-1` and Roll Number `CS-2024-001`
3. You should see Ayesha Khan's full result — subjects, marks, 90.4%, GPA 4.00, PASS
4. Try **Download as PDF** — a PDF should download with the same information
5. Try **Print Result** — the browser print dialog should show a clean, form-only layout

---

## 14. Testing the HOD Dashboard

1. Sign in as HOD (`hod` / `hod123`)
2. You should see only students with 60% or above — `Fahad Aziz` (40%, FAIL) should **not** appear
3. Confirm there are no edit/delete buttons anywhere on this page — HOD access is read-only by design, enforced both in the UI and by the `/api/hod/results` route itself (try a PUT/DELETE against `/api/students/:id` while logged in as HOD — it should return `401`)

---

## 15. Testing the Admin Dashboard

1. Sign in as Admin
2. Confirm the dashboard shows: 10 total students, a pass/fail split, average GPA/percentage, and highest/lowest percentage
3. Go to **Students** → try the search box, department filter, and semester filter
4. Click **Add Student**, fill in the form (marks auto-calculate percentage/GPA/status live as you type), and save
5. Edit that student, then delete them — confirm the confirmation dialog appears before deletion

---

## Appendix: Importing `database.sql` directly (alternative to Prisma Migrate)

If you ever need to provision a fresh Postgres database without going through `prisma migrate deploy` (e.g. restoring to a brand-new instance), you can import the SQL file directly:

```bash
psql "$DIRECT_URL" -f database.sql
```

This creates every table, index, and constraint, and inserts the same seed data as `npm run db:seed`. It's idempotent, so re-running it is safe. After using this path, still run `npx prisma generate` locally so your Prisma Client matches the schema — you just skip `migrate dev`/`deploy` themselves since the tables already exist directly from the SQL.

**Recommended workflow going forward:** treat `prisma/schema.prisma` as the source of truth. Make schema changes there, run `npx prisma migrate dev --name <description>` locally to generate a new migration file, commit it, and push — Vercel will apply it automatically on the next deploy via the `build` script. Only reach for `database.sql` as a one-off recovery/import tool, not as your regular workflow, since hand-edits to it won't be reflected in Prisma's migration history.
