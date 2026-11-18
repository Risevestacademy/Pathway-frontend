import { Link } from "@tanstack/react-router";
import { Popover } from "radix-ui";
import { useEffect, useRef, useState } from "react";
import { NotificationsPanel } from "../features/notifications/components/NotificationsPanel";
import type { AppNotification } from "../features/notifications/notifications.types";
import { countUnread } from "../features/notifications/notifications.utils";

// Long enough to cross the gap between the bell and the panel without it closing.
const HOVER_CLOSE_DELAY_MS = 150;

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

/**
 * The bell in the top nav. Hovering it opens the notifications list, and so does clicking it or
 * pressing Enter or Space, which is how touch and keyboard users get there.
 *
 * There's no notifications endpoint yet, so the app doesn't pass any: the list is empty until it does.
 */
export function NotificationsButton({
  notifications = [],
  onMarkAllRead,
}: {
  notifications?: AppNotification[];
  onMarkAllRead?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);
  // True while the panel is open only because of the pointer: it then closes when the pointer
  // leaves, and doesn't pull focus into itself. A click (or key press) makes it stay put.
  const openedByHover = useRef(false);
  const unread = countUnread(notifications);

  const cancelClose = () => window.clearTimeout(closeTimer.current);
  useEffect(() => cancelClose, []);

  const hoverOpen = (event: React.PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    cancelClose();
    if (!open) openedByHover.current = true;
    setOpen(true);
  };

  const hoverClose = (event: React.PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    cancelClose();
    if (!openedByHover.current) return;
    closeTimer.current = window.setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY_MS);
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        cancelClose();
        if (!next) openedByHover.current = false;
        setOpen(next);
      }}
    >
      <Popover.Trigger
        onPointerEnter={hoverOpen}
        onPointerLeave={hoverClose}
        onClick={(event) => {
          // A click on a list the hover just opened keeps it open rather than toggling it shut.
          if (open && openedByHover.current) {
            event.preventDefault();
            openedByHover.current = false;
          }
        }}
        className="focus-ring relative grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border border-grey-200 bg-surface text-grey-600 transition-colors duration-200 ease-out hover:bg-grey-50 motion-reduce:transition-none"
      >
        <BellIcon />
        <span className="sr-only">
          {unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        </span>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          onPointerEnter={hoverOpen}
          onPointerLeave={hoverClose}
          onOpenAutoFocus={(event) => {
            if (openedByHover.current) event.preventDefault();
          }}
          onCloseAutoFocus={(event) => {
            if (openedByHover.current) event.preventDefault();
            openedByHover.current = false;
          }}
          className="z-30 w-[27.5rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-grey-100 bg-surface shadow-[0_12px_32px_rgba(0,0,0,0.12)] outline-none"
        >
          <NotificationsPanel notifications={notifications} onMarkAllRead={onMarkAllRead} />
          <div className="border-t border-line px-6 py-4">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="focus-ring rounded text-base text-brand-600 underline underline-offset-2"
            >
              See all notifications
            </Link>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
