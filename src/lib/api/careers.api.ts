import { api } from "./axios";
import type {
  CareerField,
  CareerListItem,
} from "../../features/catalog/catalog.types";
import type {
  ApiCareerDetail,
  FetchCareersParams,
} from "../../features/careerDetail/career.types";

export async function fetchCareers(
  params: FetchCareersParams,
): Promise<CareerListItem[]> {
  const { data } = await api.get<CareerListItem[]>("/careers", { params });
  return data;
}

export async function fetchFields(): Promise<CareerField[]> {
  const { data } = await api.get<CareerField[]>("/fields");
  return data;
}

export async function fetchCareer(careerId: string): Promise<ApiCareerDetail> {
  const { data } = await api.get<ApiCareerDetail>(`/careers/${careerId}`);
  return data;
}
