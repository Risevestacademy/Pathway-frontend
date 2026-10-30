import { useState } from "react";
import clsx from "clsx";
import { Check, Info, Minus } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Button, LinkButton } from "../../../components/ui/Button";
import { useCurrentMember } from "../hooks/useCurrentMember";
import { useTeamMembers } from "../hooks/useTeamMembers";
import {
  PERMISSIONS,
  ROLES,
  ROLE_LABEL,
  careerAccessLabel,
  dayLabel,
  initials,
  type Role,
} from "../admin.workflow";
import { paginate } from "../admin.utils";
import { Banner } from "./Banner";
import { PageHeader } from "./AdminLayout";
import { InviteDialog } from "./InviteDialog";
import { InvitesSection } from "./InvitesSection";
import { Pagination } from "./Pagination";

const PAGE_SIZE = 6;

const ROLE_TONE: Record<Role, "info" | "warning" | "success" | "brand"> = {
  editor: "info",
  reviewer: "warning",
  publisher: "success",
  admin: "brand",
};

const TABS = ["Members", "Roles and permissions"] as const;
type Tab = (typeof TABS)[number];

export function TeamPage() {
  const [tab, setTab] = useState<Tab>("Members");
  const [inviting, setInviting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const { isAdmin } = useCurrentMember();

  return (
    <main className="flex flex-1 flex-col gap-6 px-page-mobile py-6 sm:px-page-tablet lg:p-8">
      <PageHeader
        title="Team"
        subtitle="Who can edit, review and publish content."
        action={
          isAdmin ? (
            <Button onClick={() => {
                setNotice(null);
                setInviting(true);
              }}>Invite someone</Button>
          ) : undefined
        }
      />

      <div role="tablist" aria-label="Team sections" className="flex flex-wrap gap-x-6 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={clsx(
              "-mb-px border-b-2 px-0.5 py-3 text-base focus-ring",
              tab === t
                ? "border-brand-600 font-medium text-brand-700"
                : "border-transparent text-ink-muted hover:text-ink",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {notice && (
        <p role="status" className="text-sm text-ink">
          {notice}
        </p>
      )}

      {tab === "Members" ? (
        <>
          <MembersTab canManage={isAdmin} />
          {isAdmin && <InvitesSection />}
        </>
      ) : (
        <RolesTab />
      )}

      <InviteDialog
        open={inviting}
        onOpenChange={setInviting}
        onSent={(invite) =>
          setNotice(
            invite.emailSent
              ? `Invite sent to ${invite.email}.`
              : `Invite created for ${invite.email}, but the email couldn’t be sent. Invite them again to retry.`,
          )
        }
      />
    </main>
  );
}

/** People on the team: the local list plus everyone who accepted an invite. */
function MembersTab({ canManage }: { canManage: boolean }) {
  const { members, invitesFailed, refetchInvites } = useTeamMembers(canManage);
  const [page, setPage] = useState(1);

  const current = paginate(members, page, PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      {invitesFailed && (
        <p role="alert" className="flex flex-wrap items-center gap-3 text-sm text-danger-700">
          Couldn’t load people who accepted invites.
          <Button isPrimary={false} onClick={() => void refetchInvites()}>
            Try again
          </Button>
        </p>
      )}
      <section className="overflow-hidden rounded-3xl border border-line-strong">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-surface-muted text-ink-muted">
              <tr>
                {["Person", "Roles", "Career access", "Last active"].map((h) => (
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
              {current.items.map((m) => {
                return (
                  <tr key={m.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden
                          className="grid size-12 shrink-0 place-items-center rounded-xl bg-pink-100 font-semibold text-pink-600"
                        >
                          {initials(m.name)}
                        </span>
                        <div>
                          <p className="font-medium text-ink">{m.name}</p>
                          <p className="text-ink-muted">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {m.roles.map((r) => (
                          <Badge key={r} tone={ROLE_TONE[r]}>
                            {ROLE_LABEL[r]}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-ink">{careerAccessLabel(m.careerAccess)}</td>
                    <td className="px-6 py-4 text-ink">
                      {m.lastActive ? dayLabel(m.lastActive) : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Roles of people who joined by invite come from the server. */}
                      {canManage && !m.serverManaged && (
                        <LinkButton
                          isPrimary={false}
                          to="/admin/team/$memberId"
                          params={{ memberId: m.id }}
                        >
                          Manage
                        </LinkButton>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 px-6 py-4 text-sm text-ink-subtle">
            <Info className="size-4 shrink-0" aria-hidden />
            {members.length} {members.length === 1 ? "person" : "people"}. People appear here once
            they accept an invite. Admins manage the team and roles.
          </p>
        </div>
        <Pagination
          page={current.page}
          pageCount={current.pageCount}
          shown={current.items.length}
          total={members.length}
          noun="members"
          onPage={setPage}
        />
      </section>
    </div>
  );
}

function RolesTab() {
  return (
    <div className="flex flex-col gap-6">
      <section className="overflow-hidden rounded-3xl border border-line-strong">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-surface-muted text-ink-muted">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">
                  What they can do
                </th>
                {ROLES.map((r) => (
                  <th key={r.id} scope="col" className="px-6 py-4 font-medium">
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {PERMISSIONS.map((p) => (
                <tr key={p.label}>
                  <td className="px-6 py-4">
                    <p className="text-ink">{p.label}</p>
                    {p.note && <p className="text-sm text-ink-muted">{p.note}</p>}
                  </td>
                  {ROLES.map((r) => {
                    const allowed = p.roles.includes(r.id);
                    return (
                      <td key={r.id} className="px-6 py-4">
                        <span
                          className="grid size-7 place-items-center rounded-md border border-line-strong text-ink-muted"
                          role="img"
                          aria-label={`${r.label}: ${allowed ? "allowed" : "not allowed"}`}
                        >
                          {allowed ? (
                            <Check className="size-4" aria-hidden />
                          ) : (
                            <Minus className="size-4" aria-hidden />
                          )}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="flex items-center gap-2 border-t border-line px-6 py-4 text-sm text-ink-subtle">
          <Info className="size-4 shrink-0" aria-hidden />A person can hold more than one role.
          Admins hold every permission.
        </p>
      </section>

      <Banner tone="info" title="Roles are assigned per person">
        Open a person under Members and choose their roles and which careers they can edit.
      </Banner>
    </div>
  );
}
