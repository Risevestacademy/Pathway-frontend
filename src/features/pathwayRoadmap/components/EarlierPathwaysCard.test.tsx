import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { EarlierPathwaysCard } from "./EarlierPathwaysCard";

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

afterEach(cleanup);

const pathways = [
  { careerId: "c1", title: "Frontend Developer", completed: 7, total: 18 },
  { careerId: "c2", title: "Data Analyst", completed: 3, total: 15 },
];

const card = (over: Partial<Parameters<typeof EarlierPathwaysCard>[0]> = {}) => {
  const onSwitched = vi.fn();
  render(
    <EarlierPathwaysCard
      pathways={pathways}
      activeCareerTitle="Product Designer"
      onSwitched={onSwitched}
      {...over}
    />,
  );
  return onSwitched;
};

describe("EarlierPathwaysCard", () => {
  it("shows nothing when they haven't switched away from any pathway", () => {
    const { container } = render(
      <EarlierPathwaysCard pathways={[]} activeCareerTitle="Product Designer" onSwitched={() => {}} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("is a titled section that says their progress on each is kept", () => {
    card();

    const section = screen.getByRole("region", { name: "Earlier pathways" });
    expect(
      within(section).getByText(
        "You switched away from these. Your progress on each is kept, so switching back picks up where you left off.",
      ),
    ).toBeTruthy();
  });

  it("lists each pathway, marked as paused, with how many steps are complete", () => {
    card();

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText("Frontend Developer")).toBeTruthy();
    expect(within(items[0]).getByText("Paused")).toBeTruthy();
    expect(within(items[0]).getByText("7 of 18 steps complete")).toBeTruthy();
    expect(within(items[1]).getByText("3 of 15 steps complete")).toBeTruthy();
  });

  it("has a bar for each, with the same numbers", () => {
    card();

    const bars = screen.getAllByRole("progressbar");
    expect(bars.map((bar) => [bar.getAttribute("aria-valuenow"), bar.getAttribute("aria-valuemax")])).toEqual([
      ["7", "18"],
      ["3", "15"],
    ]);
  });

  it("offers to switch back to each, naming the pathway that would be replaced", () => {
    card();

    const [first] = screen.getAllByRole("button", { name: "Switch back" });
    expect(first.getAttribute("data-career")).toBe("c1");
    expect(first.getAttribute("data-title")).toBe("Frontend Developer");
    expect(first.getAttribute("data-replaces")).toBe("Product Designer");
  });

  it("says which pathway was switched back to, once it has been", () => {
    const onSwitched = card();

    fireEvent.click(screen.getAllByRole("button", { name: "Switch back" })[1]);

    expect(onSwitched).toHaveBeenCalledWith("c2");
  });
});
