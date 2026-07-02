import { UserCog } from "lucide-react";
import { AuthLayout } from "@/components/shared/auth-layout";
import { LoginForm } from "@/components/shared/login-form";
import { ROUTES } from "@/constants/routes";

export default function AdminLoginPage() {
  return (
    <AuthLayout
      icon={UserCog}
      title="Admin Login"
      subtitle="Manage students and upload results"
      accent="gold"
    >
      <LoginForm
        role="ADMIN"
        redirectTo={ROUTES.adminDashboard}
        accent="gold"
        demoUsername="admin"
        demoPassword="admin123"
      />
    </AuthLayout>
  );
}
