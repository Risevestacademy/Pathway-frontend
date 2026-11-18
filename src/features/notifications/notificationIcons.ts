import opening from "../../assets/images/notifications/opening.png";
import roadmap from "../../assets/images/notifications/roadmap.png";
import streak from "../../assets/images/notifications/streak.png";
import feedback from "../../assets/images/notifications/feedback.png";
import warning from "../../assets/images/notifications/warning.png";
import type { NotificationKind } from "./notifications.types";

/** The icon for each kind, and the tint of the square behind it. */
export const NOTIFICATION_ICONS: Record<NotificationKind, { src: string; tint: string }> = {
  OPENING: { src: opening, tint: "bg-success-50" },
  ROADMAP_UPDATED: { src: roadmap, tint: "bg-info-50" },
  STREAK: { src: streak, tint: "bg-accent-50" },
  FEEDBACK_REPLY: { src: feedback, tint: "bg-brand-100" },
  LINK_WITHDRAWN: { src: warning, tint: "bg-warning-50" },
};
