import { api } from "./axios";

/** PATCH /users/me. Stores whether the backend may send analytics events for this account. */
export async function updateAnalyticsEnabled(analyticsEnabled: boolean): Promise<void> {
  await api.patch("/users/me", { analyticsEnabled });
}
