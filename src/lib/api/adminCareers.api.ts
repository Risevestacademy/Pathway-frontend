import { isAxiosError } from "axios";
import { api } from "./axios";

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
