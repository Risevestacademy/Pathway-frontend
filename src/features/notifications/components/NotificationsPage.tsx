import { Tabs } from "radix-ui";
import clsx from "clsx";
import { useId } from "react";
import { Button } from "../../../components/ui/Button";
import feedbackIcon from "../../../assets/images/notifications/feedback.png";
import type { AppNotification } from "../notifications.types";
import { countUnread, groupNotifications } from "../notifications.utils";
import { NotificationRow } from "./NotificationRow";

const tabClass =
  "focus-ring -mb-px flex cursor-pointer items-center gap-2 border-b-2 border-transparent px-3 py-3 text-base font-medium text-ink-muted transition-colors duration-200 ease-out motion-reduce:transition-none data-[state=active]:border-brand-600 data-[state=active]:text-brand-600";

/** There's no settings page yet, so the button is shown but can't be used. */
function SettingsButton({ isPrimary, className }: { isPrimary: boolean; className?: string }) {
  return (
    <Button isPrimary={isPrimary} disabled title="Coming soon" className={className}>
      Notification settings
    </Button>
  );
}

function AllCaughtUp() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-line bg-surface px-6 py-16 text-center">
      <span aria-hidden className="grid size-14 place-items-center rounded-2xl bg-brand-100">
        <img src={feedbackIcon} alt="" draggable={false} className="size-8" />
      </span>
      <h2 className="font-display text-2xl font-medium text-ink">You are all caught up</h2>
      <p className="max-w-md text-base text-ink-muted">
        New notifications show up here. You can choose what we tell you in settings.
      </p>
      <SettingsButton isPrimary className="mt-2" />
    </div>
  );
}

function GroupedList({ notifications, now }: { notifications: AppNotification[]; now?: Date }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-surface">
      {groupNotifications(notifications, now).map((group) => (
        <GroupSection key={group.label} label={group.label}>
          {group.items.map((notification) => (
            <NotificationRow key={notification.id} notification={notification} now={now} />
          ))}
        </GroupSection>
      ))}
    </div>
  );
}

function GroupSection({ label, children }: { label: string; children: React.ReactNode }) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="bg-grey-50 px-6 py-3 text-base text-ink-muted">
        {label}
      </h2>
      <ul>{children}</ul>
    </section>
  );
}

function FlatList({ notifications, now }: { notifications: AppNotification[]; now?: Date }) {
  return (
    <ul
      aria-label="Unread notifications"
      className="overflow-hidden rounded-3xl border border-line bg-surface [&>li:first-child]:border-t-0"
    >
      {notifications.map((notification) => (
        <NotificationRow key={notification.id} notification={notification} now={now} />
      ))}
    </ul>
  );
}

/** Every notification, grouped by when it came, with a tab for just the unread ones. */
export function NotificationsPage({
  notifications = [],
  onMarkAllRead,
  now,
}: {
  notifications?: AppNotification[];
  /** Left out when nothing can mark them read, which hides the button. */
  onMarkAllRead?: () => void;
  now?: Date;
}) {
  const unread = notifications.filter((notification) => !notification.read);
  const unreadCount = countUnread(notifications);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-4xl font-medium text-ink">Notifications</h1>
          <p className="text-base text-ink-muted">
            Updates about your pathway, openings and feedback.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {notifications.length > 0 && <SettingsButton isPrimary={false} />}
          {onMarkAllRead && unreadCount > 0 && <Button onClick={onMarkAllRead}>Mark all read</Button>}
        </div>
      </div>

      <Tabs.Root defaultValue="all" className="flex flex-col gap-6">
        <Tabs.List aria-label="Filter notifications" className="flex gap-4 border-b border-line">
          <Tabs.Trigger value="all" className={tabClass}>
            All
          </Tabs.Trigger>
          <Tabs.Trigger value="unread" className={tabClass}>
            Unread{" "}
            {unreadCount > 0 && (
              <span
                className={clsx(
                  "rounded-md bg-brand-100 px-2 py-0.5 text-sm font-medium text-brand-700",
                )}
              >
                {unreadCount}
              </span>
            )}
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="all" className="outline-none">
          {notifications.length > 0 ? <GroupedList notifications={notifications} now={now} /> : <AllCaughtUp />}
        </Tabs.Content>
        <Tabs.Content value="unread" className="outline-none">
          {unread.length > 0 ? <FlatList notifications={unread} now={now} /> : <AllCaughtUp />}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
