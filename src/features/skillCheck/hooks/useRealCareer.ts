import { useCareers } from "../../catalog/hooks/useCareers";

const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

export function useRealCareerId(title: string | null): string | null {
  const { data } = useCareers({});
  if (!title || !data) return null;
  const key = normalise(title);
  return data.find((career) => normalise(career.title) === key)?.id ?? null;
}
