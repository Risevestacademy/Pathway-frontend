import { api } from "./axios";
import type { OnboardingOptions } from "../../features/catalog/catalog.types";

export async function fetchOnboardingOptions(): Promise<OnboardingOptions> {
  const { data } = await api.get<OnboardingOptions>("/onboarding/options");
  return data;
}