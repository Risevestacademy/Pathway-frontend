import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { StartStepButton } from "./StartStepButton";

const navigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params }: { children: React.ReactNode; to: string; params?: Record<string, string> }) => (
    <a href={Object.entries(params ?? {}).reduce((path, [k, v]) => path.replace(`$${k}`, v), to)}>{children}</a>
  ),
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

describe("StartStepButton", () => {
  it("is a link to the resources tab when the career is already their active pathway", () => {
    render(<StartStepButton careerId="c1" stepNumber={3} started={false} />);

    expect(screen.getByRole("link", { name: "Start step 3" }).getAttribute("href")).toBe(
      "/my-pathway/c1/resources",
    );
  });

  it("says Continue once they have started", () => {
    render(<StartStepButton careerId="c1" stepNumber={6} started />);

    expect(screen.getByRole("link", { name: "Continue step 6" })).toBeTruthy();
  });

  it("makes the career active first when it isn't yet, naming the pathway it replaces", () => {
    render(
      <StartStepButton
        careerId="c1"
        stepNumber={1}
        started={false}
        activation={{ careerTitle: "Product Designer", activeCareerTitle: "Data Analyst" }}
      />,
    );

    const button = screen.getByRole("button", { name: "Start step 1" });
    expect(button.getAttribute("data-career")).toBe("c1");
    expect(button.getAttribute("data-title")).toBe("Product Designer");
    expect(button.getAttribute("data-replaces")).toBe("Data Analyst");
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("opens the resources tab once the career has been made active", () => {
    render(
      <StartStepButton
        careerId="c1"
        stepNumber={1}
        started={false}
        activation={{ careerTitle: "Product Designer", activeCareerTitle: null }}
      />,
    );
    expect(navigate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Start step 1" }));

    expect(navigate).toHaveBeenCalledWith({ to: "/my-pathway/$careerId/resources", params: { careerId: "c1" } });
  });
});
