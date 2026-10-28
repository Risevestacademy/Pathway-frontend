import { isAxiosError } from "axios";

const MAX_RETRIES = 3;
// Client errors that can succeed on a later attempt.
const RETRYABLE_CLIENT_STATUSES = [408, 429];

// A 401, 403, 404 or other client error won't change on retry.
export function retryUnlessClientError(failureCount: number, error: unknown): boolean {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  if (
    status !== undefined &&
    status >= 400 &&
    status < 500 &&
    !RETRYABLE_CLIENT_STATUSES.includes(status)
  ) {
    return false;
  }
  return failureCount < MAX_RETRIES;
}
