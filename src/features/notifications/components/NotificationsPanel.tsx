import clsx from "clsx";
import { NOTIFICATION_ICONS } from "../notificationIcons";
import type { AppNotification } from "../notifications.types";
import { countUnread, formatRelativeTime } from "../notifications.utils";

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
          {notifications.map((notification) => {
            const icon = NOTIFICATION_ICONS[notification.kind];
            return (
              <li
                key={notification.id}
                className={clsx(
                  "relative flex gap-4 border-t border-line px-6 py-4",
                  !notification.read && "bg-brand-50",
                )}
              >
                <span
                  aria-hidden
                  className={clsx("grid size-12 shrink-0 place-items-center rounded-xl", icon.tint)}
                >
                  <img src={icon.src} alt="" draggable={false} className="size-6" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1 pr-4">
                  <p className="text-base font-medium text-ink">{notification.title}</p>
                  <p className="text-sm text-ink-muted">{notification.body}</p>
                  <p className="text-xs text-ink-subtle">
                    {formatRelativeTime(notification.createdAt, now)}
                  </p>
                </div>
                {!notification.read && (
                  <>
                    <span
                      aria-hidden
                      className="absolute top-5 right-6 size-2.5 rounded-full bg-brand-500"
                    />
                    <span className="sr-only">Unread</span>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-1 border-t border-line px-6 py-10 text-center">
          <p className="text-base font-medium text-ink">You&apos;re all caught up</p>
          <p className="text-sm text-ink-muted">New notifications will show up here.</p>
        </div>
      )}
    </div>
  );
}
