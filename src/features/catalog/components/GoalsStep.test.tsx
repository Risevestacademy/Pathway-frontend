import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSession } from "@/lib/stores/session";
import GoalsStep from "./GoalsStep";

const navigate = vi.hoisted(() => vi.fn());

vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  useNavigate: () => navigate,
}));

beforeEach(() => {
  navigate.mockClear();
  useSession.getState().clearOptional();
  useSession.getState().clearFilters();
});

afterEach(cleanup);

describe("GoalsStep", () => {
  it("is step 3 of 3", () => {
    render(<GoalsStep />);
    expect(screen.getByText("Step 3 of 3")).toBeTruthy();
  });

  it("selects and un-selects a skill chip and saves it", async () => {
    const user = userEvent.setup();
    render(<GoalsStep />);
    const chip = screen.getByRole("checkbox", {
      name: "Creative thinking",
    }) as HTMLInputElement;

    await user.click(chip);
    expect(chip.checked).toBe(true);
    expect(useSession.getState().strengths).toEqual(["CREATIVE_THINKING"]);

    await user.click(chip);
    expect(chip.checked).toBe(false);
    expect(useSession.getState().strengths).toEqual([]);
  });

  it("skip clears only this screen's answers and opens the careers list", async () => {
    const user = userEvent.setup();
    const state = useSession.getState();
    state.setSkills(["skill-1"]);
    state.setStrengths(["CSS"]);
    state.setGoal("FIRST_JOB");
    state.setTimeCommitment("UNDER_5");
    render(<GoalsStep />);

    await user.click(screen.getByRole("button", { name: "Skip for now" }));

    const next = useSession.getState();
    expect(next.skills).toEqual(["skill-1"]);
    expect(next.strengths).toEqual([]);
    expect(next.goal).toBeNull();
    expect(next.timeCommitment).toBeNull();
    expect(navigate).toHaveBeenCalledWith({ to: "/careers" });
  });

  it("show careers keeps the answers and opens the careers list", async () => {
    const user = userEvent.setup();
    useSession.getState().setStrengths(["CSS"]);
    render(<GoalsStep />);

    await user.click(screen.getByRole("button", { name: "Show careers" }));

    expect(useSession.getState().strengths).toEqual(["CSS"]);
    expect(navigate).toHaveBeenCalledWith({ to: "/careers" });
  });
});