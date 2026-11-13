import { api } from "./axios";
import type {
  Opportunity,
  OpportunitySummary,
  FetchOpportunitiesParams,
} from "@/features/opportunities/opportunities.type";

export interface SaveOpportunityResponse {
  opportunityId: string;
  savedAt: string;
}

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

export async function setSavedOpportunity(
  id: string,
): Promise<SaveOpportunityResponse> {
  const { data } = await api.put<SaveOpportunityResponse>(
    `/opportunities/${id}/save`,
  );
  return data;
}

export async function removeSavedOpportunity(id: string) {
  await api.delete(`/opportunities/${id}/save`);
}
