"use server";

import { signOut } from "@/auth";

export async function logoutAction(redirectTo: string) {
  await signOut({ redirectTo });
}
