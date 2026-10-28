import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Dialog } from "../../../components/ui/Dialog";
import { ROLE_TO_API, type CreatedInvite } from "../adminInvites.types";
import { useCreateInvite } from "../hooks/useAdminInvites";
import { useTeamMembers } from "../hooks/useTeamMembers";
import { isValidEmail, type Role } from "../admin.workflow";
import { TextField } from "./FormFields";
import { RoleRadioCards } from "./TeamFormParts";

/**
 * Invites someone by email with one role (POST /admin/teams/invites). The
 * invite then appears under Invites; they join the Members list once they
 * accept it.
 */
export function InviteDialog({
  open,
  onOpenChange,
  onSent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the created invite. `emailSent` is false if the email failed. */
  onSent?: (invite: CreatedInvite) => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Invite someone"
      description="They get an email with a link to join, which works for 24 hours. Pick the role they’ll have."
    >
      {/* Mounted only while open, so the form resets each time. */}
      {open && (
        <InviteForm
          onClose={() => onOpenChange(false)}
          onSent={(invite) => onSent?.(invite)}
        />
      )}
    </Dialog>
  );
}

function InviteForm({
  onClose,
  onSent,
}: {
  onClose: () => void;
  onSent: (invite: CreatedInvite) => void;
}) {
  const { members } = useTeamMembers();
  const create = useCreateInvite();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [attempted, setAttempted] = useState(false);

  const trimmed = email.trim().toLowerCase();
  const emailError = !trimmed
    ? "Add their email. Required."
    : !isValidEmail(trimmed)
      ? "Enter a valid email address."
      : members.some((m) => m.email.toLowerCase() === trimmed)
        ? "This person is already on the team."
        : undefined;
  const roleError = role === null ? "Pick a role." : undefined;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (emailError || role === null) return;
    create.mutate(
      { email: trimmed, role: ROLE_TO_API[role] },
      {
        onSuccess: (invite) => {
          onSent(invite);
          onClose();
        },
      },
    );
  };

  return (
    <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-5">
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="tunde@pathway.app"
        error={attempted ? emailError : undefined}
      />

      <div className="flex flex-col gap-2">
        <span className="font-medium text-ink">Role</span>
        <RoleRadioCards value={role} onChange={setRole} />
        {attempted && roleError && (
          <span role="alert" className="text-sm text-danger-700">
            {roleError}
          </span>
        )}
      </div>

      {create.isError && (
        <p role="alert" className="text-sm text-danger-700">
          {create.error.message}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? "Sending..." : "Send invite"}
        </Button>
        <Button isPrimary={false} onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
