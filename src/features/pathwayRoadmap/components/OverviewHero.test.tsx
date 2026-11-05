import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { OverviewHero } from "./OverviewHero";

afterEach(cleanup);

describe("OverviewHero", () => {
  it("is headed with the career's name", () => {
    render(<OverviewHero title="Product Designer" stepCount={16} />);

    expect(screen.getByRole("heading", { level: 1, name: "Product Designer" })).toBeTruthy();
  });

  it("says how many steps there are, and that the person marks each one complete", () => {
    render(<OverviewHero title="Product Designer" stepCount={16} />);

    expect(screen.getByText("16 steps. You mark each step complete yourself.")).toBeTruthy();
  });

  it("uses the singular for one step", () => {
    render(<OverviewHero title="Product Designer" stepCount={1} />);

    expect(screen.getByText("1 step. You mark each step complete yourself.")).toBeTruthy();
  });

  it("says so when there are no steps yet", () => {
    render(<OverviewHero title="Product Designer" stepCount={0} />);

    expect(screen.getByText("No steps yet. You mark each step complete yourself.")).toBeTruthy();
  });

  it("shows the step count on its own card", () => {
    render(<OverviewHero title="Product Designer" stepCount={16} />);

    const card = screen.getByRole("group", { name: "Roadmap size" });
    expect(within(card).getByText("Steps")).toBeTruthy();
    expect(within(card).getByText("16")).toBeTruthy();
  });

  describe("illustration", () => {
    it("is decorative, so it is hidden from screen readers", () => {
      const { container } = render(<OverviewHero title="Product Designer" stepCount={16} />);

      const art = container.querySelector("img") as HTMLImageElement;
      expect(art).toBeTruthy();
      expect(art.getAttribute("alt")).toBe("");
      expect(art.getAttribute("aria-hidden")).toBe("true");
    });

    it("sits in the banner's bottom-right corner at its own proportions", () => {
      const { container } = render(<OverviewHero title="Product Designer" stepCount={16} />);

      const art = container.querySelector("img") as HTMLImageElement;
      expect(art.className).toContain("right-0");
      expect(art.className).toContain("bottom-0");
      expect(art.className).toContain("h-auto");
      expect(art.style.width).toBe("421px");
    });

    it("sits behind the text and the card, which stay readable on top of it", () => {
      const { container } = render(<OverviewHero title="Product Designer" stepCount={16} />);

      const art = container.querySelector("img") as HTMLImageElement;
      expect(art.className).toContain("pointer-events-none");
      expect(screen.getByRole("heading", { level: 1 }).parentElement?.className).toContain("relative");
      expect(screen.getByRole("group", { name: "Roadmap size" }).className).toContain("relative");
    });

    it("is hidden on narrow screens, where it would only crowd the text", () => {
      const { container } = render(<OverviewHero title="Product Designer" stepCount={16} />);

      expect((container.querySelector("img") as HTMLImageElement).className).toContain("hidden");
      expect((container.querySelector("img") as HTMLImageElement).className).toContain("sm:block");
    });
  });

  it("makes no claim about stages or how long it takes, which the backend doesn't have", () => {
    render(<OverviewHero title="Product Designer" stepCount={16} />);

    expect(screen.queryByText(/Stages/)).toBeNull();
    expect(screen.queryByText(/months/)).toBeNull();
  });
});
