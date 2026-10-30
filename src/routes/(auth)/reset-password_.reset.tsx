import { createFileRoute } from "@tanstack/react-router";
import ChangePasswordComponent from "@/features/auth/components/ChangePassword";
import { z } from "zod/mini";

export const Route = createFileRoute("/(auth)/reset-password_/reset")({
  validateSearch: z.object({
    token: z.optional(z.string().check(z.minLength(1))),
  }),
  component: ChangePasswordComponent,
});
