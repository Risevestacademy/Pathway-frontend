import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { UpNextCard, type UpNextCardProps } from "./UpNextCard";

const navigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
  useNavigate: () => navigate,
}));
vi.mock("../../progress/components/StartTrackingButton", () => ({
  default: ({
    label,
    careerId,
    careerTitle,
    activeCareerTitle,
    onStarted,
  }: {
    label: string;
    careerId: string;
    careerTitle: string;
    activeCareerTitle: string | null;
    onStarted?: () => void;
  }) => (
    <button type="button" data-career={careerId} data-title={careerTitle} data-replaces={activeCareerTitle ?? ""} onClick={onStarted}>
      {label}
    </button>
  ),
}));

afterEach(() => {
  cleanup();
  navigate.mockReset();
});

const card = (over: Partial<UpNextCardProps> = {}) =>
  render(
    <UpNextCard
      careerId="career-1"
      step={{ id: "step-1", number: 1, title: "What design is for", resourceCount: 1 }}
      started={false}
      {...over}
    />,
  );

describe("UpNextCard", () => {
  it("says it is the step to do next", () => {
    card();

    expect(screen.getByText("Up next")).toBeTruthy();
  });

  it("names the step with its number", () => {
    card();

    expect(
      screen.getByRole("heading", { level: 2, name: "Step 1 · What design is for" }),
    ).toBeTruthy();
  });

  it("is a section named after the step", () => {
    card();

    expect(screen.getByRole("region", { name: "Step 1 · What design is for" })).toBeTruthy();
  });

  it.each([
    [1, "1 resource"],
    [3, "3 resources"],
  ])("counts the step's resources (%i)", (resourceCount, text) => {
    card({ step: { id: "s", number: 2, title: "Core skills", resourceCount } });

    expect(screen.getByText(text)).toBeTruthy();
  });

  it("says nothing about resources when the step has none", () => {
    card({ step: { id: "s", number: 2, title: "Core skills", resourceCount: 0 } });

    expect(screen.queryByText(/resource/)).toBeNull();
  });

  it("offers to start the step when nothing has been done yet", () => {
    card({ started: false });

    const link = screen.getByRole("link", { name: "Start step 1" });
    expect(link.getAttribute("href")).toBe("/my-pathway/$careerId/resources");
  });

  it("offers to continue the step once they have started", () => {
    card({ started: true, step: { id: "s", number: 4, title: "Career readiness", resourceCount: 2 } });

    expect(screen.getByRole("link", { name: "Continue step 4" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: /Start step/ })).toBeNull();
  });

  describe("when starting must make the career their active pathway", () => {
    const withActivation = (activeCareerTitle: string | null = null, over: Partial<UpNextCardProps> = {}) =>
      card({ activation: { careerTitle: "Product Designer", activeCareerTitle }, ...over });

    it("is a button that starts tracking, not a plain link", () => {
      withActivation();

      expect(screen.getByRole("button", { name: "Start step 1" }).getAttribute("data-career")).toBe("career-1");
      expect(screen.queryByRole("link", { name: /Start step/ })).toBeNull();
    });

    it("says which career it makes active, and which pathway that replaces", () => {
      withActivation("Data Analyst");

      const button = screen.getByRole("button", { name: "Start step 1" });
      expect(button.getAttribute("data-title")).toBe("Product Designer");
      expect(button.getAttribute("data-replaces")).toBe("Data Analyst");
    });

    it("says Continue once they have started the pathway", () => {
      withActivation(null, { started: true });

      expect(screen.getByRole("button", { name: "Continue step 1" })).toBeTruthy();
    });

    it("opens the step once the career has been made active", () => {
      withActivation();

      fireEvent.click(screen.getByRole("button", { name: "Start step 1" }));

      expect(navigate).toHaveBeenCalledWith({
        to: "/my-pathway/$careerId/resources",
        params: { careerId: "career-1" },
      });
    });

    it("doesn't open the step before that", () => {
      withActivation();

      expect(navigate).not.toHaveBeenCalled();
    });
  });
});
