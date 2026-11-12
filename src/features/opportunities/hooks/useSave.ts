import { useMutation } from "@tanstack/react-query";
import {
  setSavedOpportunity,
  removeSavedOpportunity,
} from "@/lib/api/opportunities.api";

export function useSaveOpportunity() {
  return useMutation({
    mutationFn: (opportunityId: string) => {
      return setSavedOpportunity(opportunityId);
    },
  });
}

export function useRemoveOpportunity() {
  return useMutation({
    mutationFn: (opportunityId: string) => {
      return removeSavedOpportunity(opportunityId);
    },
  });
}
