import type { NextAuthConfig } from "next-auth";
import {
  ADMIN_LOGIN_PATH,
  ADMIN_PROTECTED_PREFIX,
  HOD_LOGIN_PATH,
  HOD_PROTECTED_PREFIX,
} from "@/constants/routes";

/**
 * Edge-safe configuration. This file must NEVER import Prisma or bcrypt —
 * it is loaded by middleware.ts, which runs on the Edge runtime. The
 * Credentials provider (which does need Prisma/bcrypt) is added on top of
 * this config in auth.ts, which only runs in the Node.js runtime.
 */
export const authConfig = {
  pages: {
    signIn: ADMIN_LOGIN_PATH,
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const { pathname } = nextUrl;

      const isAdminRoute =
        pathname.startsWith(ADMIN_PROTECTED_PREFIX) && !pathname.startsWith(ADMIN_LOGIN_PATH);
      const isHodRoute =
        pathname.startsWith(HOD_PROTECTED_PREFIX) && !pathname.startsWith(HOD_LOGIN_PATH);

      if (isAdminRoute) {
        if (!isLoggedIn || role !== "ADMIN") {
          return Response.redirect(new URL(ADMIN_LOGIN_PATH, nextUrl));
        }
        return true;
      }

      if (isHodRoute) {
        if (!isLoggedIn || role !== "HOD") {
          return Response.redirect(new URL(HOD_LOGIN_PATH, nextUrl));
        }
        return true;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
