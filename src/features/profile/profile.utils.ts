import { isAxiosError } from "axios";
import type { UserProfile } from "../../lib/api/users.api";

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

export function validateName(value: string, label: string): string | null {
  return value.trim() ? null : `Enter your ${label}.`;
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