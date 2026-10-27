import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Dialog } from "../../../components/ui/Dialog";
import { useAdminCareers } from "../hooks/useAdminCareers";
import { useTeamMembers } from "../hooks/useTeamMembers";
import { isValidEmail, type CareerAccess, type Role } from "../admin.workflow";
import { TextField } from "./FormFields";
import { CareerAccessPicker, RoleCards } from "./TeamFormParts";

/**
 * Collects an email, roles and career access. Nothing is sent or added to the
 * team yet: that needs the "invite someone" endpoint. When it exists, call it
 * from the submit handler and let the new invite show up under Invites.
 */
export function InviteDialog({
  open,
  onOpenChange,
  onSubmitted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the email once the form passes validation. */
  onSubmitted?: (email: string) => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Invite someone"
      description="Add their email and pick one or more roles. Sending invites isn’t connected to the server yet, so nobody is added for now."
    >
      {/* Mounted only while open, so the form resets each time. */}
      {open && (
        <InviteForm
          onClose={() => onOpenChange(false)}
          onSubmitted={(email) => onSubmitted?.(email)}
        />
      )}
    </Dialog>
  );
}

function InviteForm({
  onClose,
  onSubmitted,
}: {
  onClose: () => void;
  onSubmitted: (email: string) => void;
}) {
  const { members } = useTeamMembers();
  const { rows } = useAdminCareers({ detailFor: [] });
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [access, setAccess] = useState<CareerAccess>("all");
  const [attempted, setAttempted] = useState(false);

  const trimmed = email.trim().toLowerCase();
  const emailError = !trimmed
    ? "Add their email. Required."
    : !isValidEmail(trimmed)
      ? "Enter a valid email address."
      : members.some((m) => m.email.toLowerCase() === trimmed)
        ? "This person is already on the team."
        : undefined;
  const rolesError = roles.length === 0 ? "Pick at least one role." : undefined;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (emailError || rolesError) return;
    onSubmitted(trimmed);
    onClose();
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
        <span className="font-medium text-ink">Roles</span>
        <RoleCards value={roles} onChange={setRoles} compact />
        {attempted && rolesError && (
          <span role="alert" className="text-sm text-danger-700">
            {rolesError}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-medium text-ink">Career access</span>
        <CareerAccessPicker
          value={access}
          careers={rows.map((r) => r.title)}
          onChange={setAccess}
        />
        <span className="text-sm text-ink-muted">
          Choose specific careers to limit what this person can edit.
        </span>
      </div>

      <div className="flex gap-3">
        <Button type="submit">Send invite</Button>
        <Button isPrimary={false} onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
