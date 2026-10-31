import { useState } from "react";
import { Button, LinkButton } from "../../../components/ui/Button";
import { StateMessage } from "../../../components/ui/StateMessage";
import { useAuthStore } from "../../../lib/stores/authStore";
import { useAcceptInvite } from "../hooks/useAcceptInvite";

const shell = "mx-auto flex w-full max-w-md flex-1 items-center px-page-mobile py-10 sm:px-page-tablet";

/** Shown while the session is checked, which can take a moment if the backend is waking up. */
export function AcceptInvitePending() {
  return (
    <main className={shell}>
      <section className="w-full rounded-3xl border border-line-strong">
        <StateMessage kind="loading" title="Loading your invite" />
      </section>
    </main>
  );
}

/** Accept a team invite from the emailed link (/accept-invite?token=…). */
export function AcceptInvitePage({
  token,
  onUseDifferentAccount,
}: {
  token: string | undefined;
  /** Signs out and sends them to log in again, then back to this link. */
  onUseDifferentAccount: () => Promise<void>;
}) {
  const email = useAuthStore((s) => s.user?.email);
  const accept = useAcceptInvite();
  const [switching, setSwitching] = useState(false);

  const switchAccount = async () => {
    setSwitching(true);
    try {
      await onUseDifferentAccount();
    } finally {
      setSwitching(false);
    }
  };

  return (
    <main className={shell}>
      <section className="w-full rounded-3xl border border-line-strong">
        {!token ? (
          <StateMessage
            kind="error"
            title="This invite link is incomplete"
            body="Open the link from your invite email again, or ask for a new invite."
            action={
              <LinkButton isPrimary={false} to="/">
                Go to Pathway
              </LinkButton>
            }
          />
        ) : accept.isSuccess ? (
          <StateMessage
            kind="empty"
            title="You’ve joined the team"
            body="Your invite is accepted. You can now open the admin area."
            action={<LinkButton to="/admin">Go to admin</LinkButton>}
          />
        ) : (
          <div className="flex flex-col gap-5 p-8">
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink">
                Join the Pathway team
              </h1>
              <p className="mt-2 text-sm text-ink-muted">
                You’ve been invited to help manage careers on Pathway. Accepting adds you to the
                team with the role you were invited as.
              </p>
              {email && (
                <p className="mt-3 text-sm text-ink-muted">
                  Signed in as <strong className="font-medium text-ink">{email}</strong>. The
                  invite only works for the email it was sent to.
                </p>
              )}
            </div>

            {accept.isError && (
              <p role="alert" className="text-sm text-danger-700">
                {accept.error.message}
              </p>
            )}

            <div className="flex flex-col gap-3">
              <Button disabled={accept.isPending || switching} onClick={() => accept.mutate(token)}>
                {accept.isPending ? "Accepting..." : "Accept invite"}
              </Button>
              <Button
                isPrimary={false}
                disabled={accept.isPending || switching}
                onClick={() => void switchAccount()}
              >
                {switching ? "Signing out..." : "Use a different account"}
              </Button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
