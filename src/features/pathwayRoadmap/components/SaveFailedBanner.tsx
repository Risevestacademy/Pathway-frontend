import { Button } from "../../../components/ui/Button";

/**
 * Shown above a step when a tick couldn't be saved. Normally that is a failed
 * request, with a way to try again. When the person isn't tracking the pathway,
 * trying again can't help, so it says to start tracking instead.
 */
export function SaveFailedBanner({
  resourceTitle,
  onRetry,
  notTracking = false,
}: {
  resourceTitle: string;
  onRetry: () => void;
  notTracking?: boolean;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-4 rounded-2xl border border-danger-600/30 bg-danger-50 p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p className="text-base font-medium text-danger-700">We could not save your last change</p>
        <p className="text-sm text-ink">
          {notTracking
            ? "Start tracking this pathway to save your progress."
            : `Your tick on “${resourceTitle}” is not saved yet. Check your connection and try again.`}
        </p>
      </div>
      {!notTracking && (
        <Button isPrimary={false} className="shrink-0" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
