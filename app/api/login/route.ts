import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations";
import { verifyCredentials } from "@/lib/auth/credentials";

/**
 * POST /api/login
 *
 * A standalone, directly-testable REST endpoint (curl/Postman friendly)
 * that validates Admin/HOD credentials against the database. It returns
 * a plain success/failure JSON response and does NOT itself establish a
 * browser session — the login pages in the UI use NextAuth's `signIn()`
 * client function for that, which handles session cookies correctly.
 * Both paths share the same `verifyCredentials` logic, so there is a
 * single source of truth for "is this a valid login".
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { username, password, role } = parsed.data;
  const user = await verifyCredentials(username, password, role);

  if (!user) {
    return NextResponse.json({ error: "Invalid username, password, or role" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    user: { id: user.id, username: user.username, role: user.role },
  });
}
