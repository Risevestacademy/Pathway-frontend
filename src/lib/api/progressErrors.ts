import { isAxiosError } from "axios";

/** The HTTP status of a failed request, or undefined when there was no response. */
export function httpStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}

/** True when the request never got an answer (a dropped connection, a timeout). */
export const isNetworkError = (error: unknown): boolean =>
  isAxiosError(error) && !error.response;

/** Which call failed, so the message can say what to do. */
export type ProgressAction =
  | "pathways"
  | "active-pathway"
  | "set-active-pathway"
  | "step"
  | "starting-point";

const FALLBACK: Record<ProgressAction, string> = {
  pathways: "We couldn’t load your pathways. Please try again.",
  "active-pathway": "We couldn’t load your active pathway. Please try again.",
  "set-active-pathway": "We couldn’t set this pathway. Please try again.",
  step: "We couldn’t update this step. Please try again.",
  "starting-point": "We couldn’t save your starting point. Please try again.",
};

const BY_STATUS: Partial<Record<ProgressAction, Record<number, string>>> = {
  "set-active-pathway": {
    404: "This career isn’t available to follow right now.",
    409: "This career doesn’t have a pathway yet.",
  },
  step: {
    404: "This step isn’t available any more.",
    409: "Save this career to your pathways before tracking progress on it.",
  },
  "starting-point": {
    400: "That step isn’t part of this pathway.",
    404: "Save this pathway before choosing where to start.",
  },
};

/** A plain-language message for a failed progress call. */
export function progressErrorMessage(error: unknown, action: ProgressAction): string {
  const status = httpStatus(error);
  if (status === 401) return "Your session has expired. Sign in again to continue.";
  if (isNetworkError(error)) {
    return "We couldn’t reach the server. Check your connection and try again.";
  }
  return (status !== undefined && BY_STATUS[action]?.[status]) || FALLBACK[action];
}
