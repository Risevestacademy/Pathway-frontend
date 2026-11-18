import clsx from "clsx";
import { NOTIFICATION_ICONS } from "../notificationIcons";
import type { AppNotification } from "../notifications.types";
import { formatRelativeTime } from "../notifications.utils";

/** One notification: icon, title, text and how long ago it came. Unread ones are tinted and dotted. */
export function NotificationRow({
  notification,
  now,
}: {
  notification: AppNotification;
  now?: Date;
}) {
  const icon = NOTIFICATION_ICONS[notification.kind];

  return (
    <li
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
        <p className="text-xs text-ink-subtle">{formatRelativeTime(notification.createdAt, now)}</p>
      </div>
      {!notification.read && (
        <>
          <span aria-hidden className="absolute top-5 right-6 size-2.5 rounded-full bg-brand-500" />
          <span className="sr-only">Unread</span>
        </>
      )}
    </li>
  );
}
