import { z } from "zod";

export const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

const emailSchema = z.email("Invalid email address");

export function validateEmail(email: string) {
  const result = emailSchema.safeParse(email);
  if (!result.success) {
    return result.error.issues[0].message;
  }
  return null;
}
