import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Role } from "@prisma/client";
import { authConfig } from "./auth.config";
import { verifyCredentials } from "@/lib/auth/credentials";
import { loginSchema } from "@/lib/validations";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { username, password, role } = parsed.data;
        const user = await verifyCredentials(username, password, role);
        if (!user) return null;

        return {
          id: user.id,
          name: user.username,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        // NextAuth v5's ambient User/AdapterUser union doesn't reliably
        // carry our module-augmented `role` field through this callback's
        // inferred type, so we assert the shape we know authorize() above
        // actually returns rather than fighting the library's generics.
        const authorizedUser = user as { id: string; name?: string | null; role: Role };
        token.role = authorizedUser.role;
        token.username = authorizedUser.name ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const t = token as { sub?: string; role?: Role; username?: string };
        session.user.id = t.sub ?? "";
        session.user.role = t.role ?? "ADMIN";
        session.user.name = t.username ?? session.user.name;
      }
      return session;
    },
  },
});
