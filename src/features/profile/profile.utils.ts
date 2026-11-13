import { isAxiosError } from "axios";
import type { UserProfile } from "../../lib/api/users.api";

export const NAME_MAX_LENGTH = 100;

type NameParts = Pick<UserProfile, "firstName" | "lastName" | "fullName">;

export function splitName(profile: NameParts) {
  const firstName = profile.firstName?.trim() ?? "";
  const lastName = profile.lastName?.trim() ?? "";
  if (firstName || lastName) return { firstName, lastName };

  const [first = "", ...rest] = (profile.fullName ?? "").trim().split(/\s+/);
  return { firstName: first, lastName: rest.join(" ") };
}

export function displayName(profile: NameParts & Pick<UserProfile, "email">) {
  const { firstName, lastName } = splitName(profile);
  return profile.fullName?.trim() || [firstName, lastName].filter(Boolean).join(" ") || profile.email;
}

export function validateFirstName(value: string): string | null {
  const name = value.trim();
  if (!name) return "Enter your first name.";
  if (name.length > NAME_MAX_LENGTH) return `First name must be ${NAME_MAX_LENGTH} characters or fewer.`;
  return null;
}

export function validateLastName(value: string): string | null {
  return value.trim().length > NAME_MAX_LENGTH
    ? `Last name must be ${NAME_MAX_LENGTH} characters or fewer.`
    : null;
}

export function progressPercent(completed: number, total: number) {
  return total > 0 ? Math.round(Math.min(completed / total, 1) * 100) : 0;
}

export function stepsLabel(completed: number, total: number) {
  return `${completed} of ${total} ${total === 1 ? "step" : "steps"} complete`;
}

export function saveErrorMessage(error: unknown) {
  if (isAxiosError(error) && error.response?.status === 400) {
    return "We could not save that name. Check it and try again.";
  }
  return "We could not save your name. Check your connection and try again.";
}