import { isAxiosError } from "axios";
import { api } from "./axios";

/** An error from discarding a draft revision, with the server's code when it sends one. */
export class DeleteRevisionError extends Error {
  /** e.g. INVALID_REVISION_STATE. */
  readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "DeleteRevisionError";
    this.code = code;
  }
}

function getDeleteRevisionError(error: unknown): DeleteRevisionError {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  const body = (isAxiosError(error) ? error.response?.data : undefined) as
    | { code?: unknown }
    | undefined;
  const code = typeof body?.code === "string" ? body.code : undefined;

  switch (status) {
    case 400:
    case 404:
      return new DeleteRevisionError("This draft no longer exists.", code);
    case 401:
      return new DeleteRevisionError("Your session has expired. Sign in again to continue.", code);
    case 403:
      return new DeleteRevisionError("Only editors and above can discard drafts.", code);
    case 409:
      // Only the documented code gets a specific message; anything else is generic.
      if (code === "INVALID_REVISION_STATE") {
        return new DeleteRevisionError(
          "Only a draft can be discarded. This change is already in review or has been decided.",
          code,
        );
      }
      return new DeleteRevisionError("We couldn’t discard this draft. Please try again.", code);
    default:
      return new DeleteRevisionError(
        isAxiosError(error) && !error.response
          ? "We couldn’t reach the server. Check your connection and try again."
          : "We couldn’t discard this draft. Please try again.",
        code,
      );
  }
}

/**
 * DELETE /admin/revisions/{revisionId}. Editors and above. Discards a DRAFT
 * revision. The career stays, even one that was never published: deleting a
 * career is a separate admin action. A revision in review or already decided
 * can't be discarded (409).
 */
export async function deleteRevision(revisionId: string): Promise<void> {
  try {
    await api.delete(`/admin/revisions/${encodeURIComponent(revisionId)}`);
  } catch (error) {
    throw getDeleteRevisionError(error);
  }
}
