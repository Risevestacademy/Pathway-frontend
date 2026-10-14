import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSession } from "@/lib/stores/session";
import AboutYou from "./AboutYou";

const navigate = vi.hoisted(() => vi.fn());
const options = vi.hoisted(() => ({
  data: undefined as unknown,
  isPending: false,
  isError: false,
  refetch: vi.fn(),
}));

vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  useNavigate: () => navigate,
}));

vi.mock("../hooks/useOnboardingOptions", () => ({
  useOnboardingOptions: () => options,
}));

const loaded = {
  educationLevels: [{ value: "BACHELOR", label: "Bachelor's degree" }],
  internshipOptions: [],
  experienceOptions: [{ value: "ZERO", label: "None yet" }],
  skills: [{ id: "s1", name: "Figma", description: null }],
  fields: [{ id: "f1", name: "Design", slug: "design" }],
};

beforeEach(() => {
  navigate.mockClear();
  options.refetch.mockClear();
  options.data = loaded;
  options.isPending = false;
  options.isError = false;
  useSession.getState().clearOptional();
  useSession.getState().clearFilters();
});

afterEach(cleanup);

describe("AboutYou", () => {
  it("is step 2 of 3", () => {
    render(<AboutYou />);
    expect(screen.getByText("Step 2 of 3")).toBeTruthy();
  });

  it("adds experience rows up to the maximum", async () => {
    const user = userEvent.setup();
    render(<AboutYou />);
    const add = screen.getByRole("button", {
      name: "Add another experience",
    }) as HTMLButtonElement;

    await user.click(add);
    await user.click(add);

    expect(useSession.getState().experience).toHaveLength(3);
    expect(add.disabled).toBe(true);
    expect(screen.getByText("You can add up to 3 experiences")).toBeTruthy();
  });

  it("removes an experience row", async () => {
    const user = userEvent.setup();
    render(<AboutYou />);

    await user.click(
      screen.getByRole("button", { name: "Add another experience" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Remove experience entry 2" }),
    );

    expect(useSession.getState().experience).toHaveLength(1);
  });

  it("shows a message when import cv is clicked", async () => {
    const user = userEvent.setup();
    render(<AboutYou />);

    await user.click(screen.getByRole("button", { name: "import cv" }));

    expect(screen.getByText(/CV import isn.t available yet/)).toBeTruthy();
  });

  it("shows an alert with a retry button when the options fail to load", async () => {
    const user = userEvent.setup();
    options.data = undefined;
    options.isError = true;
    render(<AboutYou />);

    expect(screen.getByRole("alert")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(options.refetch).toHaveBeenCalledTimes(1);
  });

  it("skip clears the answers and opens the careers list", async () => {
    const user = userEvent.setup();
    useSession.getState().setDegree("BACHELOR");
    render(<AboutYou />);

    await user.click(screen.getByRole("button", { name: "Skip for now" }));

    expect(useSession.getState().degree).toBeNull();
    expect(navigate).toHaveBeenCalledWith({ to: "/careers" });
  });

  it("next keeps the answers and opens the goals screen", async () => {
    const user = userEvent.setup();
    useSession.getState().setDegree("BACHELOR");
    render(<AboutYou />);

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(useSession.getState().degree).toBe("BACHELOR");
    expect(navigate).toHaveBeenCalledWith({
      to: "/careers/onboarding/goals",
    });
  });
});