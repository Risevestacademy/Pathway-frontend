import { api } from "./axios";
import type {
  CareerField,
  CareerListItem,
  CareerListResponse,
} from "../../features/catalog/catalog.types";
import type {
  FetchCareersParams,
  PublicCareerDetailDto,
} from "../../features/careerDetail/career.types";

export async function fetchCareers(
  params: FetchCareersParams,
): Promise<CareerListItem[]> {
  const { data } = await api.get<CareerListResponse>("/careers", { params });
  return data.items;
}

export async function fetchFields(): Promise<CareerField[]> {
  const { data } = await api.get<CareerField[]>("/fields");
  return data;
}

export async function fetchCareer(
  careerId: string,
): Promise<PublicCareerDetailDto> {
  const { data } = await api.get<PublicCareerDetailDto>(`/careers/${careerId}`);
  return data;
}
