import { auth } from "@/auth";
import { HodShell } from "@/components/hod/hod-shell";

export default async function HodShellLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return <HodShell username={session?.user?.name ?? "HOD"}>{children}</HodShell>;
}
