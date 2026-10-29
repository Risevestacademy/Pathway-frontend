import { isAxiosError } from "axios";
import { api } from "./axios";
import type {
  CreateInviteInput,
  CreatedInvite,
  InviteItem,
  InvitePage,
  InviteStatus,
} from "../../features/admin/adminInvites.types";

export interface FetchInvitesParams {
  /** Omit for every status. */
  status?: InviteStatus;
  page: number;
  limit: number;
}

/** GET /admin/teams/invites. Admins only: 401 without a session, 403 for other roles. */
export async function fetchAdminInvites({
  status,
  page,
  limit,
}: FetchInvitesParams): Promise<InvitePage> {
  const { data } = await api.get<unknown>("/admin/teams/invites", {
    params: { page, limit, ...(status ? { status } : {}) },
  });
  const body = (
    data && typeof data === "object" && "data" in data ? (data as { data: unknown }).data : data
  ) as Partial<InvitePage> | null;

  const items: InviteItem[] = Array.isArray(body?.items) ? body.items : [];
  return {
    items,
    total: typeof body?.total === "number" ? body.total : items.length,
    page: typeof body?.page === "number" ? body.page : page,
    limit: typeof body?.limit === "number" ? body.limit : limit,
  };
}

function getRevokeError(error: unknown): Error {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  switch (status) {
    case 400:
    case 404:
      return new Error("This invite no longer exists.");
    case 403:
      return new Error("Only admins can revoke invites.");
    case 409:
      return new Error("This invite was already accepted, has expired or was already revoked.");
    default:
      return new Error(
        isAxiosError(error) && !error.response
          ? "We couldn’t reach the server. Check your connection and try again."
          : "We couldn’t revoke this invite. Please try again.",
      );
  }
}

/**
 * DELETE /admin/teams/invites/{id}. Admins only. The invite stays in the list
 * with `revokedAt` set; a 409 means it was already accepted, expired or revoked.
 */
export async function revokeAdminInvite(id: string): Promise<void> {
  try {
    await api.delete(`/admin/teams/invites/${id}`);
  } catch (error) {
    throw getRevokeError(error);
  }
}

const ALL_PAGE_SIZE = 100;
/** Safety stop in case the server keeps answering with pages. */
const MAX_PAGES = 100;

/** Every invite with `status`, following pages until `total` are collected. */
export async function fetchAllAdminInvites(status: InviteStatus): Promise<InviteItem[]> {
  const all = new Map<string, InviteItem>();

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const current = await fetchAdminInvites({ status, page, limit: ALL_PAGE_SIZE });

    const before = all.size;
    for (const invite of current.items) all.set(invite.id, invite);
    // An empty page, a repeated page or reaching `total` all mean we are done.
    if (current.items.length === 0 || all.size === before || all.size >= current.total) break;
  }

  return [...all.values()];
}

function getCreateError(error: unknown): Error {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  switch (status) {
    case 400:
      return new Error("Check the email address and role, then try again.");
    case 403:
      return new Error("Only admins can invite people.");
    default:
      return new Error(
        isAxiosError(error) && !error.response
          ? "We couldn’t reach the server. Check your connection and try again."
          : "We couldn’t send this invite. Please try again.",
      );
  }
}

/**
 * POST /admin/teams/invites. Admins only. Creates a single-use invite that
 * expires after 24 hours and emails an accept link; inviting the same email
 * again replaces its pending invite. If the email can't be sent the invite
 * still exists (`emailSent: false`) and re-inviting retries it.
 */
export async function createAdminInvite(input: CreateInviteInput): Promise<CreatedInvite> {
  try {
    const { data } = await api.post<unknown>("/admin/teams/invites", input);
    const body = (
      data && typeof data === "object" && "data" in data ? (data as { data: unknown }).data : data
    ) as Partial<CreatedInvite> | null;

    return {
      id: String(body?.id ?? ""),
      email: body?.email ?? input.email,
      role: body?.role ?? input.role,
      expiresAt: body?.expiresAt ?? "",
      // Only an explicit false counts as a failure to send.
      emailSent: body?.emailSent !== false,
      message: body?.message,
    };
  } catch (error) {
    throw getCreateError(error);
  }
}
