import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * Route protection for /admin/* and /hod/* runs entirely on the Edge
 * runtime via the `authorized` callback in auth.config.ts. It only reads
 * the signed JWT session cookie — it never touches Prisma or bcrypt.
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*", "/hod/:path*"],
};
