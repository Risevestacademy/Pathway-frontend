import { Button, LinkButton } from "../../../components/ui/Button";
import { StateMessage } from "../../../components/ui/StateMessage";
import { useAuthStore } from "../../../lib/stores/authStore";
import { useAcceptInvite } from "../hooks/useAcceptInvite";

/** Accept a team invite from the emailed link (/accept-invite?token=…). */
export function AcceptInvitePage({ token }: { token: string | undefined }) {
  const email = useAuthStore((s) => s.user?.email);
  const accept = useAcceptInvite();

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 items-center px-page-mobile py-10 sm:px-page-tablet">
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

            <Button disabled={accept.isPending} onClick={() => accept.mutate(token)}>
              {accept.isPending ? "Accepting..." : "Accept invite"}
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
