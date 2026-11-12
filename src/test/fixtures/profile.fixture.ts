import type { UserProfile } from "../../lib/api/users.api";

export const profileMe = {
  id: "u1",
  email: "ada@example.com",
  role: "USER",
  firstName: "Ada",
  lastName: "Obi",
  fullName: "Ada Obi",
  emailVerified: true,
  createdAt: "2026-11-09T17:55:57.407Z",
} satisfies UserProfile;

export const profileActivePathway = {
  career: { id: "c1", slug: "product-designer", title: "Product Designer", roleSummary: "", retired: false },
  pathway: { id: "p1", title: "Product Designer" },
  progress: { completed: 5, total: 16, percentage: 31, nextStepId: "s6", selfReported: true, startStepId: null },
  steps: [],
};