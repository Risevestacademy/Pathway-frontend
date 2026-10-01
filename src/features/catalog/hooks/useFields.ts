import { useQuery } from "@tanstack/react-query";
import { fetchFields } from "../../../lib/api/careers.api";

export function useFields() {
  return useQuery({
    queryKey: ["fields"],
    queryFn: fetchFields,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
