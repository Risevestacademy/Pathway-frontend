import { api } from "./axios";
import type { CareerListItem, ApiTargetLevel } from "../../features/catalog/catelog.types";

export interface FetchCareersParams {
  level?: ApiTargetLevel;
  interest?: string;
}

export async function fetchCareers(params: FetchCareersParams): Promise<CareerListItem[]> {
  const { data } = await api.get<CareerListItem[]>("/careers", { params });
  return data;
}