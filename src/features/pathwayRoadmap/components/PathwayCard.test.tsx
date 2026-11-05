import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { PathwayCard, type PathwayCardProps } from "./PathwayCard";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

afterEach(cleanup);

const card = (over: Partial<PathwayCardProps> = {}) =>
  render(
    <PathwayCard
      careerId="career-1"
      title="Frontend Developer"
      isActive
      icon={{ src: "/frontend.png", tint: "bg-blue-100" }}
      currentStep={{ title: "HTML", description: "Structure pages with the right elements." }}
      xp={0}
      {...over}
    />,
  );

describe("PathwayCard", () => {
  it("names the pathway with a heading", () => {
    card();

    expect(screen.getByRole("heading", { level: 2, name: /Frontend Developer/ })).toBeTruthy();
  });

  it("marks the active pathway", () => {
    card({ isActive: true });

    expect(screen.getByText("Active")).toBeTruthy();
  });

  it("doesn't mark a pathway that isn't active", () => {
    card({ isActive: false, title: "UX Designer" });

    expect(screen.queryByText("Active")).toBeNull();
  });

  it("shows where they are: the step's name and what it covers", () => {
    card();

    const panel = screen.getByRole("group", { name: "Currently at" });
    expect(within(panel).getByText("Currently at:")).toBeTruthy();
    expect(within(panel).getByText("HTML")).toBeTruthy();
    expect(within(panel).getByText("Structure pages with the right elements.")).toBeTruthy();
  });

  it("shows the XP for the step", () => {
    card({ xp: 100 });

    expect(within(screen.getByRole("group", { name: "Currently at" })).getByText("100 XP")).toBeTruthy();
  });

  it("shows 0 XP when there is none to show", () => {
    card({ xp: 0 });

    expect(screen.getByText("0 XP")).toBeTruthy();
  });

  it("says so when there is no step to show", () => {
    card({ currentStep: null });

    expect(screen.getByText("No steps to show yet")).toBeTruthy();
  });

  it("opens the pathway's roadmap", () => {
    card();

    const link = screen.getByRole("link", { name: /Continue roadmap/ });
    expect(link.getAttribute("href")).toBe("/careers/$careerId/roadmap");
  });

  it("puts the career's icon on a tinted tile, hidden from screen readers", () => {
    const { container } = card({ icon: { src: "/ux.png", tint: "bg-pink-100" } });

    const img = container.querySelector("img") as HTMLImageElement;
    expect(img.getAttribute("src")).toBe("/ux.png");
    expect(img.getAttribute("alt")).toBe("");
    expect(img.getAttribute("aria-hidden")).toBe("true");
    expect(img.parentElement?.className).toContain("bg-pink-100");
  });

  it("works without an icon", () => {
    const { container } = card({ icon: undefined });

    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByRole("heading", { level: 2 })).toBeTruthy();
  });
});
