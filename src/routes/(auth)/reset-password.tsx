import { createFileRoute } from "@tanstack/react-router";
import ResetPasswordComponent from "@/features/auth/components/resetPassword";

export const Route = createFileRoute("/(auth)/reset-password")({
  component: ResetPasswordComponent,
});
