import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Button, LinkButton } from "../../../components/ui/Button";
import { Dialog } from "../../../components/ui/Dialog";
import { StateMessage } from "../../../components/ui/StateMessage";
import { useAdminStore } from "../adminStore";
import { useAdminCareers } from "../hooks/useAdminCareers";
import {
  dayLabel,
  isLastAdmin,
  type CareerAccess,
  type Role,
  type TeamMember,
} from "../admin.workflow";
import { formatDate } from "../admin.utils";
import { Banner } from "./Banner";
import { CareerAccessPicker, RoleCards } from "./TeamFormParts";

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 rounded-3xl border border-line-strong p-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
        <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function BackButton() {
  return (
    <LinkButton isPrimary={false} to="/admin/team" className="self-start">
      <ChevronLeft className="size-4" aria-hidden />
      Back
    </LinkButton>
  );
}

export function MemberPage({ memberId }: { memberId: string }) {
  const member = useAdminStore((s) => s.members.find((m) => m.id === memberId));

  if (!member) {
    return (
      <main className="flex flex-1 flex-col gap-6 px-page-mobile py-6 sm:px-page-tablet lg:p-8">
        <BackButton />
        <StateMessage
          kind="no-match"
          title="Person not found"
          body="They may have been removed. Go back to the team list."
        />
      </main>
    );
  }

  return <MemberEditor key={member.id} member={member} />;
}

function MemberEditor({ member }: { member: TeamMember }) {
  const navigate = useNavigate();
  const members = useAdminStore((s) => s.members);
  const updateMember = useAdminStore((s) => s.updateMember);
  const removeMember = useAdminStore((s) => s.removeMember);
  const { rows } = useAdminCareers();

  const [roles, setRoles] = useState<Role[]>(member.roles);
  const [access, setAccess] = useState<CareerAccess>(member.careerAccess);
  const [attempted, setAttempted] = useState(false);
  const [removing, setRemoving] = useState(false);

  const firstName = member.name.split(" ")[0];
  const lastAdmin = isLastAdmin(members, member.id);
  const losesAdmin = lastAdmin && !roles.includes("admin");
  const error =
    roles.length === 0
      ? "Pick at least one role."
      : losesAdmin
        ? "Keep at least one Admin on the team."
        : null;

  const goBack = () => void navigate({ to: "/admin/team" });

  const save = () => {
    setAttempted(true);
    if (error) return;
    updateMember(member.id, { roles, careerAccess: access });
    goBack();
  };

  const confirmRemove = () => {
    removeMember(member.id);
    goBack();
  };

  const status =
    member.invitedAt && !member.lastActive
      ? `Invited ${formatDate(member.invitedAt)}`
      : `Last active ${member.lastActive ? dayLabel(member.lastActive).toLowerCase() : "never"}`;

  return (
    <main className="flex flex-1 flex-col gap-6 px-page-mobile py-6 sm:px-page-tablet lg:p-8">
      <BackButton />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {member.name}
          </h1>
          <p className="mt-2 text-ink-muted">
            {member.email} · {status}
          </p>
        </div>
        <div className="flex gap-3">
          <Button isPrimary={false} onClick={goBack}>
            Cancel
          </Button>
          <Button onClick={save}>Save changes</Button>
        </div>
      </div>

      {attempted && error && (
        <Banner tone="danger" title="We couldn’t save these changes">
          {error}
        </Banner>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[3fr_2fr]">
        <Card title="Roles" subtitle="A person can hold more than one role.">
          <RoleCards value={roles} onChange={setRoles} />
        </Card>

        <div className="flex flex-col gap-4">
          <Card title="Career access" subtitle="Limit which careers this person can edit.">
            <CareerAccessPicker
              value={access}
              careers={rows.map((r) => r.title)}
              onChange={setAccess}
            />
          </Card>

          <Card
            title="Remove from team"
            subtitle="They lose access straight away. Their past edits stay in each career’s history."
          >
            <Button
              className="self-start !border-danger-700 !bg-danger-600"
              onClick={() => setRemoving(true)}
            >
              Remove {member.name}
            </Button>
          </Card>
        </div>
      </div>

      {roles.includes("editor") && roles.includes("reviewer") && (
        <Banner tone="info" title="Reviewers can’t approve their own changes">
          {firstName} holds both Editor and Reviewer, so another reviewer must approve what{" "}
          {firstName} submits.
        </Banner>
      )}

      <Dialog
        open={removing}
        onOpenChange={setRemoving}
        title={`Remove ${member.name}?`}
        description="They lose access straight away. Their past edits stay in each career’s history."
      >
        {lastAdmin && (
          <p role="alert" className="mt-4 text-sm text-danger-700">
            {firstName} is the only Admin. Make someone else an Admin first.
          </p>
        )}
        <div className="mt-6 flex gap-3">
          <Button
            className="!border-danger-700 !bg-danger-600"
            disabled={lastAdmin}
            onClick={confirmRemove}
          >
            Remove {firstName}
          </Button>
          <Button isPrimary={false} onClick={() => setRemoving(false)}>
            Cancel
          </Button>
        </div>
      </Dialog>
    </main>
  );
}
