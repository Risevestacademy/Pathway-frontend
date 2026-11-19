import type { AppNotification } from "../notifications.types";
import { countUnread } from "../notifications.utils";
import { NotificationRow } from "./NotificationRow";

/** The list that drops down from the bell: newest first as given, unread ones tinted. */
export function NotificationsPanel({
  notifications,
  onMarkAllRead,
  now = new Date(),
}: {
  notifications: AppNotification[];
  /** Left out when nothing can mark them read, which hides the button. */
  onMarkAllRead?: () => void;
  now?: Date;
}) {
  const hasUnread = countUnread(notifications) > 0;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-4 px-6 py-5">
        <h2 className="text-xl font-medium text-ink">Notifications</h2>
        {onMarkAllRead && hasUnread && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="focus-ring rounded text-base text-brand-600 underline underline-offset-2"
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <ul aria-label="Notifications" className="max-h-[28rem] overflow-y-auto">
          {notifications.map((notification) => (
            <NotificationRow key={notification.id} notification={notification} now={now} />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-1 border-t border-line px-6 py-10 text-center">
          <p className="text-base font-medium text-ink">You are all caught up</p>
          <p className="text-sm text-ink-muted">New notifications will show up here.</p>
        </div>
      )}
    </div>
  );
}
