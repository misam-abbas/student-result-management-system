import bcrypt from "bcrypt";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface VerifiedUser {
  id: string;
  username: string;
  role: Role;
}

/**
 * Single source of truth for validating Admin/HOD credentials. Used by
 * both the NextAuth Credentials provider (session/cookie login) and the
 * standalone POST /api/login REST endpoint.
 */
export async function verifyCredentials(
  username: string,
  password: string,
  role: Role
): Promise<VerifiedUser | null> {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return null;
  if (user.role !== role) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  return { id: user.id, username: user.username, role: user.role };
}

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}
