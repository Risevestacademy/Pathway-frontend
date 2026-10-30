import { isAxiosError } from "axios";
import { api } from "./axios";
import type { RevisionDiff } from "../../features/admin/revisionDiff.types";

function getDiffError(error: unknown): Error {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  switch (status) {
    case 401:
      return new Error("Your session has expired. Sign in again to see this change.");
    case 403:
      return new Error(
        "You can’t view this change. Editors can only see their own; reviewers can see any.",
      );
    case 400:
    case 404:
      return new Error("This change no longer exists.");
    default:
      return new Error(
        isAxiosError(error) && !error.response
          ? "We couldn’t reach the server. Check your connection and try again."
          : "We couldn’t load this change. Please try again.",
      );
  }
}

/**
 * GET /admin/revisions/{revisionId}/diff. Read-only. Reviewers and above can
 * view any revision; an editor only their own (an admin does not get around
 * that for someone else's draft). The server builds it from the same plan that
 * submit, review and publish use, so what a reviewer sees is what publish does.
 */
export async function fetchRevisionDiff(revisionId: string): Promise<RevisionDiff> {
  try {
    const { data } = await api.get<RevisionDiff | { data: RevisionDiff }>(
      `/admin/revisions/${revisionId}/diff`,
    );
    const body = "data" in data ? data.data : data;
    return {
      ...body,
      blockers: Array.isArray(body.blockers) ? body.blockers : [],
      advisories: Array.isArray(body.advisories) ? body.advisories : [],
      sections: body.sections ?? {},
    };
  } catch (error) {
    throw getDiffError(error);
  }
}
