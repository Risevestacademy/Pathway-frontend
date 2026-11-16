/** The bell from the design: a dome with a flat rim and a short line beneath it. */
function BellIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6"
    >
      <path d="M5.5 16.5v-5a6.5 6.5 0 0 1 13 0v5a1 1 0 0 1 1 1h-15a1 1 0 0 1 1-1Z" />
      <path d="M10 21h4" />
    </svg>
  );
}

/** There's no notifications endpoint yet, so the bell is shown but can't be used. */
export function NotificationsButton() {
  return (
    <button
      type="button"
      aria-disabled="true"
      title="Coming soon"
      className="focus-ring grid size-10 shrink-0 cursor-not-allowed place-items-center rounded-full border border-grey-200 bg-surface text-grey-600"
    >
      <BellIcon />
      <span className="sr-only">Notifications (coming soon)</span>
    </button>
  );
}
