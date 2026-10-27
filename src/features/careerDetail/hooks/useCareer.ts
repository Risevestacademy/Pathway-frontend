import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { fetchCareer } from "../../../lib/api/careers.api";
import { toCareer } from "../careerDetail.utils";

/** Client errors (bad id, not found) won't change on retry; network and 5xx errors still retry. */
const retryUnlessClientError = (failureCount: number, error: unknown) => {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  if (status !== undefined && status >= 400 && status < 500) return false;
  return failureCount < 3;
};

export function useCareer(careerId: string) {
  return useQuery({
    queryKey: ["career", careerId],
    queryFn: () => fetchCareer(careerId),
    select: toCareer,
    retry: retryUnlessClientError,
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
