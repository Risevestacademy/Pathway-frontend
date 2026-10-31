import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReviewItem } from "../admin.workflow";
import { ReviewsPage } from "./ReviewsPage";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a href="/">{children}</a>,
}));

let reviews: ReviewItem[] = [];

vi.mock("../adminStore", () => ({
  useAdminStore: (select: (s: { reviews: ReviewItem[] }) => unknown) => select({ reviews }),
}));

vi.mock("./AdminLayout", () => ({
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

const review = (id: string, over: Partial<ReviewItem> = {}): ReviewItem => ({
  id,
  title: `Review ${id}`,
  summary: "Changed things",
  type: "details",
  submittedBy: "Ada L.",
  submittedAt: "2026-10-28T10:00:00.000Z",
  status: "pending",
  changes: [],
  ...over,
});

afterEach(cleanup);

describe("ReviewsPage", () => {
  it("lets a reviewer open a pending review", () => {
    reviews = [review("a")];
    render(<ReviewsPage />);

    expect(screen.getByRole("link", { name: "Review" })).toBeTruthy();
    expect(screen.getByText(/1 change waiting/)).toBeTruthy();
  });

  it("keeps a review of a deleted career visible but not openable", () => {
    reviews = [review("a"), review("b", { careerDeletedAt: "2026-10-29T09:00:00.000Z" })];
    render(<ReviewsPage />);

    expect(screen.getByText("Review b")).toBeTruthy();
    expect(screen.getByText("Career deleted")).toBeTruthy();
    expect(screen.getByText("Unavailable")).toBeTruthy();
    // Only the live review has a link.
    expect(screen.getAllByRole("link", { name: "Review" })).toHaveLength(1);
  });

  it("counts only the changes that can still be acted on", () => {
    reviews = [
      review("a", { careerDeletedAt: "2026-10-29T09:00:00.000Z" }),
      review("b", { careerDeletedAt: "2026-10-29T09:00:00.000Z" }),
    ];
    render(<ReviewsPage />);

    expect(screen.getByText(/0 changes waiting/)).toBeTruthy();
  });
});
