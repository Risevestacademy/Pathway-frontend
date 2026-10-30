import { isAxiosError } from "axios";
import { api } from "./axios";
import type {
  CareerRevisionSnapshot,
  SavedRevision,
} from "../../features/admin/careerRevision.types";

function getDeleteError(error: unknown): Error {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  switch (status) {
    case 400:
    case 404:
      return new Error("This career no longer exists.");
    case 403:
      return new Error("Only admins can delete careers.");
    case 409:
      return new Error(
        "Only a draft that was never published and hasn’t been saved by anyone can be deleted.",
      );
    default:
      return new Error(
        isAxiosError(error) && !error.response
          ? "We couldn’t reach the server. Check your connection and try again."
          : "We couldn’t delete this career. Please try again.",
      );
  }
}

/**
 * DELETE /admin/careers/{id}. Admins only. Deletes a draft career that was
 * never published and that no user has saved, along with its pathway, skills,
 * outlook and revisions. Anything else is a 409.
 */
export async function deleteAdminCareer(id: string): Promise<void> {
  try {
    await api.delete(`/admin/careers/${id}`);
  } catch (error) {
    throw getDeleteError(error);
  }
}

/** An error from saving a revision, with what the server said about a bad snapshot. */
export class RevisionSaveError extends Error {
  /** The server's code, e.g. INVALID_SNAPSHOT, REVISION_IN_REVIEW or CAREER_RETIRED. */
  readonly code?: string;
  /** For INVALID_SNAPSHOT: what is wrong with the snapshot. */
  readonly problems: string[];
  /** For REVISION_IN_REVIEW: the revision that has to be recalled first. */
  readonly revisionId?: string;

  constructor(
    message: string,
    extra: { code?: string; problems?: string[]; revisionId?: string } = {},
  ) {
    super(message);
    this.name = "RevisionSaveError";
    this.code = extra.code;
    this.problems = extra.problems ?? [];
    this.revisionId = extra.revisionId;
  }
}

function getRevisionError(error: unknown): RevisionSaveError {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  const body = (isAxiosError(error) ? error.response?.data : undefined) as
    | { code?: unknown; details?: { problems?: unknown; revisionId?: unknown } }
    | undefined;
  const code = typeof body?.code === "string" ? body.code : undefined;
  const problems = Array.isArray(body?.details?.problems)
    ? body.details.problems.filter((p): p is string => typeof p === "string")
    : [];
  const revisionId =
    typeof body?.details?.revisionId === "string" ? body.details.revisionId : undefined;

  switch (status) {
    case 400:
      return new RevisionSaveError(
        code === "INVALID_SNAPSHOT"
          ? "Some parts of this career don’t add up. Fix them and save again."
          : "Check the career details and try again.",
        { code, problems },
      );
    case 401:
      return new RevisionSaveError("Your session has expired. Sign in again to save.", { code });
    case 403:
      return new RevisionSaveError("Only editors and above can save changes.", { code });
    case 404:
      return new RevisionSaveError("This career no longer exists.", { code });
    case 409:
      return new RevisionSaveError(
        code === "CAREER_RETIRED"
          ? "This career is retired, so it can’t be changed."
          : "These changes are in review. Recall them before editing.",
        { code, revisionId },
      );
    default:
      return new RevisionSaveError(
        isAxiosError(error) && !error.response
          ? "We couldn’t reach the server. Check your connection and try again."
          : "We couldn’t save this career. Please try again.",
        { code },
      );
  }
}

/**
 * PUT /admin/careers/{careerId}/revision. Editors and above. `snapshot` is the
 * whole proposed career and replaces the stored one. It updates the open DRAFT
 * revision, or opens one based on the live version. A revision in review is not
 * edited (409): recall it first.
 */
export async function saveCareerRevision(
  careerId: string,
  snapshot: CareerRevisionSnapshot,
): Promise<SavedRevision> {
  try {
    const { data } = await api.put<SavedRevision | { data: SavedRevision }>(
      `/admin/careers/${careerId}/revision`,
      snapshot,
    );
    return "data" in data ? data.data : data;
  } catch (error) {
    throw getRevisionError(error);
  }
}
