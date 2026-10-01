import { api } from "./axios";
import type { ApiTargetLevel, CareerField, CareerListItem } from "../../features/catalog/catalog.types";

export interface FetchCareersParams {
  level?: ApiTargetLevel;
  /** Field slug, e.g. "software-engineering". */
  interest?: string;
}

export async function fetchCareers(params: FetchCareersParams): Promise<CareerListItem[]> {
  const { data } = await api.get<CareerListItem[]>("/careers", { params });
  return data;
}

export async function fetchFields(): Promise<CareerField[]> {
  const { data } = await api.get<CareerField[]>("/fields");
  return data;
}
