import { api } from "./axios";
import type {
  Opportunity,
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

export async function fetchOpportunity(id: string): Promise<Opportunity> {
  const { data } = await api.get<Opportunity>(`/opportunities/${id}`);
  return data;
}
