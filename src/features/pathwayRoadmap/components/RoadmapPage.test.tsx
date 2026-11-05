import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { PathwayCardsState } from "../hooks/usePathwayCards";
import { RoadmapPage } from "./RoadmapPage";

const usePathwayCards = vi.fn();

vi.mock("../hooks/usePathwayCards", () => ({ usePathwayCards: () => usePathwayCards() }));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

afterEach(() => {
  cleanup();
  usePathwayCards.mockReset();
});

const have = (state: PathwayCardsState, retry = vi.fn()) => {
  usePathwayCards.mockReturnValue({ state, retry });
  return retry;
};

describe("RoadmapPage", () => {
  it("shows a card for each of the person's saved pathways", () => {
    have({
      kind: "ready",
      cards: [
        {
          careerId: "c1",
          title: "Frontend Developer",
          isActive: true,
          currentStep: { title: "HTML", description: "Structure pages." },
          xp: 0,
        },
      ],
    });

    render(<RoadmapPage />);

    expect(screen.getByRole("heading", { level: 2, name: /Frontend Developer/ })).toBeTruthy();
    expect(screen.getByText("Active")).toBeTruthy();
  });

  it("retries loading when asked to", () => {
    const retry = have({ kind: "error" });

    render(<RoadmapPage />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(retry).toHaveBeenCalledOnce();
  });
});
