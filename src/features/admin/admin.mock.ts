/**
 * Placeholder figures for admin widgets that have no backend endpoint yet
 * (review queue, link checks, learner reports, activity feed). Replace each
 * with real data as the endpoints land.
 */
export const overviewStats = {
  waitingForReview: { count: 3, note: "Oldest waiting 2 days" },
  brokenLinks: { count: 5, note: "Found by the last weekly check" },
  learnerReports: { count: 4, note: "1 new since yesterday" },
};

export type AttentionTone = "warning" | "danger" | "info";

export interface AttentionItem {
  id: string;
  title: string;
  area: string;
  badge: string;
  tone: AttentionTone;
}

export const attentionItems: AttentionItem[] = [
  {
    id: "links",
    title: "5 resource links failed the last check",
    area: "Careers · Resources",
    badge: "Broken",
    tone: "danger",
  },
  {
    id: "review",
    title: "Data Analyst roadmap is waiting for review",
    area: "Inbox · Reviews",
    badge: "In review",
    tone: "info",
  },
];

export const recentActivity = [
  { id: "a1", title: "Chidi E. published UX Designer", when: "Today, 09:14" },
  { id: "a2", title: "Amaka O. edited Backend Developer roadmap", when: "Yesterday, 16:40" },
  { id: "a3", title: "Link check finished: 5 failed", when: "Mon, 06:00" },
];
