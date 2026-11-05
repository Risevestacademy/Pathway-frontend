import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import type { GroupedResource } from "../resourceGroups.utils";
import { PaidCoursesCard } from "./PaidCoursesCard";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params }: { children: React.ReactNode; to: string; params?: Record<string, string> }) => (
    <a href={Object.entries(params ?? {}).reduce((path, [k, v]) => path.replace(`$${k}`, v), to)}>{children}</a>
  ),
}));

afterEach(cleanup);

const paid = (id: string, over: Partial<GroupedResource> = {}): GroupedResource => ({
  id,
  title: `Course ${id}`,
  provider: "Google (Coursera)",
  kind: "course",
  url: `https://example.com/${id}`,
  costLabel: "Course: paid",
  description: "A full beginner programme.",
  lastChecked: "2026-09-12",
  ...over,
});

const card = (resources: GroupedResource[], hasFreeResources = true) =>
  render(<PaidCoursesCard careerId="c1" resources={resources} hasFreeResources={hasFreeResources} />);

describe("PaidCoursesCard", () => {
  it("shows nothing when the step has no paid resources", () => {
    const { container } = card([]);

    expect(container.firstChild).toBeNull();
  });

  it("is a section titled as optional, and says it is not part of the steps", () => {
    card([paid("a")]);

    const section = screen.getByRole("region", { name: /Optional: paid courses to go further/ });
    expect(within(section).getByText("Not part of your steps")).toBeTruthy();
  });

  it("explains that every step can be finished for free, and that progress never depends on these", () => {
    card([paid("a")]);

    expect(
      screen.getByText(
        "Every step above can be finished for free. These courses are extra if you want more depth and can afford them. Your progress never depends on them.",
      ),
    ).toBeTruthy();
  });

  it("doesn't claim the step can be finished for free when it has no free resource", () => {
    card([paid("a")], false);

    expect(screen.queryByText(/finished for free/)).toBeNull();
    expect(
      screen.getByText("These courses are extra if you want more depth and can afford them. Your progress never depends on them."),
    ).toBeTruthy();
  });

  it("shows each course with its price note, who it is by, and what it covers", () => {
    card([paid("a", { title: "Google UX Design Professional Certificate", kind: "certification" })]);

    const course = screen.getByRole("article", { name: "Google UX Design Professional Certificate" });
    expect(within(course).getByText("Paid")).toBeTruthy();
    expect(within(course).getByText("Certificate")).toBeTruthy();
    expect(within(course).getByText("by Google (Coursera)")).toBeTruthy();
    expect(within(course).getByText("A full beginner programme.")).toBeTruthy();
    expect(
      within(course).getByText("Price on the provider’s site · checked 12 Sep 2026"),
    ).toBeTruthy();
  });

  it("names the type of a course that isn't a certificate", () => {
    card([paid("b", { kind: "video" })]);

    expect(screen.getByText("Video")).toBeTruthy();
    expect(screen.queryByText("Certificate")).toBeNull();
  });

  it("leaves out what it covers when there is none", () => {
    card([paid("a", { description: null })]);

    expect(screen.queryByText("A full beginner programme.")).toBeNull();
  });

  it("opens a course's details from View course", () => {
    card([paid("a")]);

    expect(screen.getByRole("link", { name: "View course: Course a" }).getAttribute("href")).toBe(
      "/my-pathway/c1/resources/a",
    );
  });

  it("lists every paid course", () => {
    card([paid("a"), paid("b")]);

    expect(screen.getAllByRole("article")).toHaveLength(2);
  });

  it("says Pathway doesn't sell courses or take payment", () => {
    card([paid("a")]);

    expect(
      screen.getByText("Pathway does not sell courses or take payment. Prices are set by each provider."),
    ).toBeTruthy();
  });
});
