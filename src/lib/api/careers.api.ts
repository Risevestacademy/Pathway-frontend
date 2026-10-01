import { api } from "./axios";
import type {
  ApiCareerLevel,
  CareerField,
  CareerSummary,
} from "../../types/career.types";

export interface CareerFilters {
  level?: ApiCareerLevel;
  /** Field slug, e.g. "software-engineering". */
  interest?: string;
}

export async function fetchCareers(
  filters: CareerFilters = {},
): Promise<CareerSummary[]> {
  const { data } = await api.get<CareerSummary[]>("/api/v1/careers", {
    params: filters,
  });
  return data;
}

export async function fetchFields(): Promise<CareerField[]> {
  const { data } = await api.get<CareerField[]>("/api/v1/fields");
  return data;
}
