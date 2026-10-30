import { useState } from "react";
import clsx from "clsx";
import { isAxiosError } from "axios";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Dialog } from "../../../components/ui/Dialog";
import { StateMessage } from "../../../components/ui/StateMessage";
import { formatDate } from "../admin.utils";
import {
  INVITE_STATUSES,
  INVITE_STATUS_TONE,
  apiRoleLabel,
  inviteStateDate,
  inviteStatusLabel,
  type InviteItem,
  type InviteStatus,
} from "../adminInvites.types";
import { useAdminInvites, useRevokeInvite } from "../hooks/useAdminInvites";
import { Pagination } from "./Pagination";

export const INVITES_PAGE_SIZE = 6;

type Filter = "all" | InviteStatus;
const FILTERS: Filter[] = ["all", ...INVITE_STATUSES];

const pill = (active: boolean) =>
  clsx(
    "rounded-lg px-3 py-1.5 text-sm font-medium focus-ring",
    active ? "bg-brand-100 text-brand-800" : "bg-surface-muted text-ink-muted hover:bg-grey-100",
  );

/** Invites sent from the server (GET /admin/teams/invites), filtered by status and paged. */
export function InvitesSection() {
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const { data, isPending, isError, error, refetch } = useAdminInvites({
    status: filter === "all" ? undefined : filter,
    page,
    limit: INVITES_PAGE_SIZE,
  });

  const revoke = useRevokeInvite();
  const [revoking, setRevoking] = useState<InviteItem | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const closeRevoke = () => {
    setRevoking(null);
    revoke.reset();
  };

  const confirmRevoke = () => {
    if (!revoking) return;
    const { email } = revoking;
    revoke.mutate(revoking.id, {
      onSuccess: () => {
        closeRevoke();
        setNotice(`Invite to ${email} revoked`);
      },
    });
  };

  const forbidden = isError && isAxiosError(error) && error.response?.status === 403;
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / INVITES_PAGE_SIZE));

  // Revoking or filtering can leave the current page past the last one.
  if (data && page > pageCount) setPage(pageCount);

  return (
    <section aria-labelledby="invites-heading" className="flex flex-col gap-4">
      <div>
        <h2 id="invites-heading" className="font-display text-xl font-semibold text-ink">
          Invites
        </h2>
        <p className="mt-0.5 text-sm text-ink-muted">Invitations sent to join the team.</p>
      </div>

      <div role="group" aria-label="Filter invites by status" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => {
              setFilter(f);
              setPage(1);
            }}
            className={pill(filter === f)}
          >
            {f === "all" ? "All" : inviteStatusLabel(f)}
          </button>
        ))}
      </div>

      {notice && (
        <p role="status" className="text-sm text-success-700">
          {notice}
        </p>
      )}

      <div className="overflow-hidden rounded-3xl border border-line-strong">
        {isPending ? (
          <StateMessage kind="loading" title="Loading invites" />
        ) : isError ? (
          <StateMessage
            kind="error"
            title={forbidden ? "Only admins can see invites" : "Couldn’t load invites"}
            body={forbidden ? undefined : "Check your connection and try again."}
            action={
              forbidden ? undefined : <Button onClick={() => void refetch()}>Try again</Button>
            }
          />
        ) : items.length === 0 ? (
          <StateMessage
            kind="empty"
            title="No invites here"
            body={
              filter === "all"
                ? "Invites you send will show up here."
                : `There are no ${inviteStatusLabel(filter).toLowerCase()} invites.`
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-surface-muted text-ink-muted">
                  <tr>
                    {["Email", "Role", "Status", "Invited by", "Sent", "Date"].map((h) => (
                      <th key={h} scope="col" className="px-6 py-4 font-medium">
                        {h}
                      </th>
                    ))}
                    <th scope="col" className="px-6 py-4">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {items.map((invite) => {
                    const state = inviteStateDate(invite);
                    return (
                      <tr key={invite.id}>
                        <td className="px-6 py-4 font-medium text-ink">{invite.email}</td>
                        <td className="px-6 py-4 text-ink">{apiRoleLabel(invite.role)}</td>
                        <td className="px-6 py-4">
                          <Badge tone={INVITE_STATUS_TONE[invite.status] ?? "neutral"}>
                            {inviteStatusLabel(invite.status)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-ink">{invite.invitedByName}</td>
                        <td className="px-6 py-4 text-ink">{formatDate(invite.createdAt)}</td>
                        <td className="px-6 py-4 text-ink">
                          {state.label} {formatDate(state.iso)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {invite.status === "PENDING" && (
                            <Button
                              isPrimary={false}
                              onClick={() => {
                                setNotice(null);
                                setRevoking(invite);
                              }}
                            >
                              Revoke
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              page={data?.page ?? page}
              pageCount={pageCount}
              shown={items.length}
              total={total}
              noun="invites"
              onPage={setPage}
            />
          </>
        )}
      </div>

      <Dialog
        open={revoking !== null}
        onOpenChange={(open) => !open && closeRevoke()}
        title={`Revoke invite for ${revoking?.email ?? ""}?`}
        description="They won’t be able to join with this invite. It stays in the list as revoked."
      >
        {revoke.isError && (
          <p role="alert" className="mt-4 text-sm text-danger-700">
            {revoke.error.message}
          </p>
        )}
        <div className="mt-6 flex gap-3">
          <Button
            className="!border-danger-700 !bg-danger-600"
            disabled={revoke.isPending}
            onClick={confirmRevoke}
          >
            {revoke.isPending ? "Revoking..." : "Revoke invite"}
          </Button>
          <Button isPrimary={false} onClick={closeRevoke}>
            Cancel
          </Button>
        </div>
      </Dialog>
    </section>
  );
}
