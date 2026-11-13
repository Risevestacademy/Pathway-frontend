import { useMutation } from "@tanstack/react-query";
import {
  setSavedOpportunity,
  removeSavedOpportunity,
} from "@/lib/api/opportunities.api";

export function useSaveOpportunity(onSuccess: () => void) {
  return useMutation({
    mutationFn: (opportunityId: string) => {
      return setSavedOpportunity(opportunityId);
    },
    onSuccess,
  });
}

export function useRemoveOpportunity(onSuccess: () => void) {
  return useMutation({
    mutationFn: (opportunityId: string) => {
      return removeSavedOpportunity(opportunityId);
    },
    onSuccess,
  });
}
