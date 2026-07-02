import { Award } from "lucide-react";
import { AuthLayout } from "@/components/shared/auth-layout";
import { LoginForm } from "@/components/shared/login-form";
import { ROUTES } from "@/constants/routes";

export default function HodLoginPage() {
  return (
    <AuthLayout
      icon={Award}
      title="HOD Login"
      subtitle="View students with passing percentages"
      accent="burgundy"
    >
      <LoginForm
        role="HOD"
        redirectTo={ROUTES.hodDashboard}
        accent="burgundy"
        demoUsername="hod"
        demoPassword="hod123"
      />
    </AuthLayout>
  );
}
