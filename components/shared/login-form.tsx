"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Lock, User } from "lucide-react";
import { credentialsSchema, type CredentialsInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/form-fields";
import { toast } from "@/components/ui/toaster";
import type { Role } from "@prisma/client";
import { cn } from "@/utils/cn";

interface LoginFormProps {
  role: Role;
  redirectTo: string;
  accent: "gold" | "burgundy";
  demoUsername: string;
  demoPassword: string;
}

export function LoginForm({ role, redirectTo, accent, demoUsername, demoPassword }: LoginFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CredentialsInput>({
    resolver: zodResolver(credentialsSchema),
  });

  const onSubmit = async (data: CredentialsInput) => {
    setIsSubmitting(true);
    try {
      const result = await signIn("credentials", {
        username: data.username,
        password: data.password,
        role,
        redirect: false,
      });

      if (!result || result.error) {
        toast.error("Invalid username or password.");
        return;
      }

      toast.success("Signed in successfully.");
      router.push(redirectTo);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const focusRing = accent === "gold" ? "focus:border-gold-400" : "focus:border-burgundy-500";
  const buttonVariant = accent === "gold" ? "secondary" : "danger";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <FormField label="Username" htmlFor="username" error={errors.username?.message}>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-950/35 dark:text-ink-100/35" />
          <Input
            id="username"
            autoComplete="username"
            placeholder={demoUsername}
            className={cn("pl-9", focusRing)}
            {...register("username")}
          />
        </div>
      </FormField>

      <FormField label="Password" htmlFor="password" error={errors.password?.message}>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-950/35 dark:text-ink-100/35" />
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className={cn("pl-9", focusRing)}
            {...register("password")}
          />
        </div>
      </FormField>

      <Button type="submit" variant={buttonVariant} className="w-full" isLoading={isSubmitting}>
        Sign in
      </Button>

      <p className="rounded-lg bg-ink-950/[0.04] dark:bg-white/[0.04] px-3.5 py-2.5 text-center font-data text-xs text-text-950/50 dark:text-ink-100/50">
        Demo credentials — {demoUsername} / {demoPassword}
      </p>
    </form>
  );
}
