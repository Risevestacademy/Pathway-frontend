import { api } from "./axios";

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export interface UpdateProfileInput {
  firstName: string;
  lastName: string | null;
}

export async function fetchProfile(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>("/auth/me");
  return data;
}

export async function updateProfile(input: UpdateProfileInput): Promise<UserProfile> {
  const { data } = await api.patch<UserProfile>("/users/me", input);
  return data;
}

/** PATCH /users/me. Stores whether the backend may send analytics events for this account. */
export async function updateAnalyticsEnabled(analyticsEnabled: boolean): Promise<void> {
  await api.patch("/users/me", { analyticsEnabled });
}
