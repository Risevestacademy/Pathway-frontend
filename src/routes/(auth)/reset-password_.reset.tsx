import { createFileRoute } from "@tanstack/react-router";
import ChangePasswordComponent from "@/features/auth/components/changePassword";
import { z } from "zod";

export const Route = createFileRoute("/(auth)/reset-password_/reset")({
  validateSearch: z.object({
    token: z.string().min(1).optional(),
  }),
  component: ChangePasswordComponent,
});
