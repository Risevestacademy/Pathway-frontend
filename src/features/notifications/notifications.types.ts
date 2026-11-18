/**
 * The kinds of notification the design shows. There is no notifications endpoint yet, so these
 * names are ours: rename them to match the backend's once it exists.
 */
export type NotificationKind =
  | "OPENING"
  | "ROADMAP_UPDATED"
  | "STREAK"
  | "FEEDBACK_REPLY"
  | "LINK_WITHDRAWN";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  /** ISO timestamp of when it was sent. */
  createdAt: string;
  read: boolean;
}
