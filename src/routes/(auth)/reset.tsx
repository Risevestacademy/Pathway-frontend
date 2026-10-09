import { createFileRoute } from "@tanstack/react-router";
import ChangePasswordComponent from "@/features/auth/components/changePassword";

export const Route = createFileRoute("/(auth)/reset")({
  component: ChangePasswordComponent,
});
