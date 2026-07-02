import { auth } from "@/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return <AdminShell username={session?.user?.name ?? "Admin"}>{children}</AdminShell>;
}
