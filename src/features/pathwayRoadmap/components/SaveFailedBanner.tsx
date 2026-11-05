import { Button } from "../../../components/ui/Button";

/** Shown above a step when the browser couldn't save a tick, with a way to try again. */
export function SaveFailedBanner({
  resourceTitle,
  onRetry,
}: {
  resourceTitle: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-4 rounded-2xl border border-danger-600/30 bg-danger-50 p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p className="text-base font-medium text-danger-700">We could not save your last change</p>
        <p className="text-sm text-ink">
          Your tick on “{resourceTitle}” is not saved yet. Check your connection and try again.
        </p>
      </div>
      <Button isPrimary={false} className="shrink-0" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
