import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod/mini";
import ResetPasswordComponent from "@/features/auth/components/ResetPassword";
import ChangePasswordComponent from "@/features/auth/components/ChangePassword";

export const Route = createFileRoute("/(auth)/reset-password")({
  validateSearch: z.object({
    token: z.optional(z.string().check(z.minLength(1))),
  }),
  component: ResetPasswordRoute,
});

function ResetPasswordRoute() {
  const { token } = Route.useSearch();

  return token ? <ChangePasswordComponent /> : <ResetPasswordComponent />;
}
