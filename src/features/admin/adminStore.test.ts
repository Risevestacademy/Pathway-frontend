import { beforeEach, describe, expect, it } from "vitest";
import { useAdminStore } from "./adminStore";

beforeEach(() => useAdminStore.getState().reset());

const review = (careerId?: string) => ({
  title: "A review",
  summary: "",
  type: "details" as const,
  submittedBy: "Ada L.",
  submittedAt: "2026-10-28T10:00:00.000Z",
  careerId,
  changes: [],
});

describe("removeCareer", () => {
  it("keeps the reviews submitted for that career but marks them deleted", () => {
    const { addReview, removeCareer } = useAdminStore.getState();
    const before = useAdminStore.getState().reviews.length;
    addReview(review("career-1"));
    addReview(review("career-2"));

    removeCareer("career-1");

    const reviews = useAdminStore.getState().reviews;
    expect(reviews).toHaveLength(before + 2);
    expect(reviews.find((r) => r.careerId === "career-1")?.careerDeletedAt).toBeTruthy();
    expect(reviews.find((r) => r.careerId === "career-2")?.careerDeletedAt).toBeUndefined();
  });

  it("also forgets the career's saved draft and status change", () => {
    const { setStatus, removeCareer } = useAdminStore.getState();
    setStatus("career-1", "published");

    removeCareer("career-1");

    expect(useAdminStore.getState().statusOverrides["career-1"]).toBeUndefined();
  });
});
