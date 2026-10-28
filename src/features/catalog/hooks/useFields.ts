import { useQuery } from "@tanstack/react-query";
import { fetchFields } from "../../../lib/api/careers.api";
import { queryKeys } from "../../../lib/queryKeys";

export function useFields() {
  return useQuery({
    queryKey: queryKeys.fields,
    queryFn: fetchFields,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
