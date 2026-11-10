import { api } from "./axios";
import type {
  OpportunitySummary,
  FetchOpportunitiesParams,
} from "@/features/opportunities/opportunities.type";

export async function fetchOpportunities(
  params: FetchOpportunitiesParams,
): Promise<OpportunitySummary[]> {
  const { data } = await api.get<OpportunitySummary[]>("/opportunities", {
    params,
  });
  return data;
}
