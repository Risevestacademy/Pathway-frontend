// zod/mini: the login route validates its search in the entry chunk, and the
// classic build would add ~75 KB there.
import { z } from "zod/mini";

export const loginSearchSchema = z.object({
  redirect: z.optional(z.string()),
});

const emailSchema = z.email("Invalid email address");

export function validateEmail(email: string) {
  const result = emailSchema.safeParse(email);
  if (!result.success) {
    return result.error.issues[0].message;
  }
  return null;
}

export function validatePasswordMatch(
  password: string,
  confirmPassword: string,
): string | null {
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }

  return null;
}
