import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReviewItem } from "../admin.workflow";
import { ReviewDetailPage } from "./ReviewDetailPage";

let review: ReviewItem | undefined;

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a href="/">{children}</a>,
  useNavigate: () => vi.fn(),
}));
vi.mock("../adminStore", () => ({
  useAdminStore: (select: (s: unknown) => unknown) =>
    select({
      reviews: review ? [review] : [],
      decideReview: vi.fn(),
      setStatus: vi.fn(),
    }),
}));
vi.mock("../hooks/useCurrentMember", () => ({
  useCurrentMember: () => ({ displayName: "Ada L.", canReview: true }),
}));

const make = (over: Partial<ReviewItem> = {}): ReviewItem => ({
  id: "review-1",
  title: "UX Designer: salary range",
  summary: "Changed the range",
  type: "figures",
  submittedBy: "Chidi E.",
  submittedAt: "2026-10-28T10:00:00.000Z",
  status: "pending",
  changes: [],
  ...over,
});

afterEach(() => {
  cleanup();
  review = undefined;
});

describe("ReviewDetailPage links", () => {
  it("opens the full diff when the review has a revision behind it", () => {
    review = make({ revisionId: "rev-1", careerId: "career-1" });
    render(<ReviewDetailPage reviewId="review-1" />);

    expect(screen.getByRole("link", { name: "View full diff" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open in editor" })).toBeTruthy();
  });

  it("has no diff link for a review with no revision", () => {
    review = make({ careerId: "career-1" });
    render(<ReviewDetailPage reviewId="review-1" />);

    expect(screen.queryByRole("link", { name: "View full diff" })).toBeNull();
    expect(screen.getByRole("link", { name: "Open in editor" })).toBeTruthy();
  });

  it("offers only the diff when there is a revision but no career link", () => {
    review = make({ revisionId: "rev-1" });
    render(<ReviewDetailPage reviewId="review-1" />);

    expect(screen.getByRole("link", { name: "View full diff" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Open in editor" })).toBeNull();
  });
});
