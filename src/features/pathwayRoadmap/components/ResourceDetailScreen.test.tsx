import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { ResourceDetail } from "../resourceDetail.utils";
import { ResourceDetailScreen } from "./ResourceDetailScreen";

const resourceOpened = vi.fn();
const toggle = vi.fn();
let tickedIds: string[] = [];
let unsavedIds: string[] = [];

vi.mock("@/lib/monitoring/events", () => ({
  analytics: { trackFeature: { resourceOpened: (...args: unknown[]) => resourceOpened(...args) } },
}));
vi.mock("../hooks/useResourceTicks", () => ({
  useResourceTicks: () => ({
    isTicked: (id: string) => tickedIds.includes(id),
    isUnsaved: (id: string) => unsavedIds.includes(id),
    toggle: (id: string) => toggle(id),
  }),
}));
vi.mock("../../skillCheck/components/BackLink", () => ({
  BackLinkTo: ({ label, to }: { label: string; to: string }) => <a href={to}>{label}</a>,
}));
vi.mock("../../feedback/components/ReportIssueLink", () => ({
  ReportIssueLink: ({ label, subject, careerId }: { label: string; subject: string; careerId: string }) => (
    <button type="button">{`${label} | ${subject} | ${careerId}`}</button>
  ),
}));

afterEach(() => {
  cleanup();
  resourceOpened.mockReset();
  toggle.mockReset();
  tickedIds = [];
  unsavedIds = [];
});

const detail: ResourceDetail = {
  step: { id: "s2", number: 2, title: "How people think" },
  resource: {
    id: "r1",
    title: "Laws of UX",
    provider: "Jon Yablonski",
    kind: "article",
    url: "https://lawsofux.com",
    costLabel: "Course: free",
  },
  description: "A collection of the main psychological principles.",
  curationRationale: "Read two or three laws at a time.",
  lastChecked: "2026-09-12",
  skills: ["UX laws", "Visual hierarchy"],
};

const screenOf = (over: Partial<ResourceDetail> = {}, resource: Partial<ResourceDetail["resource"]> = {}) =>
  render(
    <ResourceDetailScreen
      careerId="c1"
      careerTitle="Product Designer"
      detail={{ ...detail, ...over, resource: { ...detail.resource, ...resource } }}
    />,
  );

describe("ResourceDetailScreen", () => {
  it("has a way back to the resources list", () => {
    screenOf();

    expect(screen.getByRole("link", { name: "Back" }).getAttribute("href")).toBe(
      "/my-pathway/$careerId/resources",
    );
  });

  it("names the step above the resource's title, and who it is by", () => {
    screenOf();

    expect(screen.getByText("Step 2 · How people think")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1, name: "Laws of UX" })).toBeTruthy();
    expect(screen.getByText("by Jon Yablonski")).toBeTruthy();
  });

  it("says what it covers", () => {
    screenOf();

    const card = screen.getByRole("region", { name: "What it covers" });
    expect(within(card).getByText("A collection of the main psychological principles.")).toBeTruthy();
  });

  it("lists the skills it builds, numbered", () => {
    screenOf();

    const card = screen.getByRole("region", { name: "Skills you'll practise" });
    expect(within(card).getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "1UX laws",
      "2Visual hierarchy",
    ]);
  });

  it("says how to use it", () => {
    screenOf();

    const card = screen.getByRole("region", { name: "How to use it" });
    expect(within(card).getByText("Read two or three laws at a time.")).toBeTruthy();
  });

  it("leaves out a card when the backend has nothing for it", () => {
    screenOf({ description: null, skills: [], curationRationale: " " });

    expect(screen.queryByRole("region", { name: "What it covers" })).toBeNull();
    expect(screen.queryByRole("region", { name: "Skills you'll practise" })).toBeNull();
    expect(screen.queryByRole("region", { name: "How to use it" })).toBeNull();
  });

  it("shows its type and cost", () => {
    screenOf();

    expect(screen.getByText("Article")).toBeTruthy();
    expect(screen.getByText("Free")).toBeTruthy();
  });

  it("shows the certification cost too, when there is one", () => {
    screenOf({}, { certificationLabel: "Certification: $49" });

    expect(screen.getByText("Certification: $49")).toBeTruthy();
  });

  it("opens the resource on the provider's site in a new tab, named for its type", () => {
    screenOf();

    const link = screen.getByRole("link", { name: /Open article/ });
    expect(link.getAttribute("href")).toBe("https://lawsofux.com");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("styles the open button as a primary button", () => {
    screenOf();

    const link = screen.getByRole("link", { name: /Open article/ });
    expect(link.className).toContain("border-b-4");
    expect(link.className).toContain("border-brand-700");
    expect(link.className).toContain("bg-brand-600");
    expect(link.className).toContain("text-white");
    expect(link.className).not.toContain("bg-surface");
  });

  it("names the button for the kind of resource", () => {
    screenOf({}, { kind: "course" });

    expect(screen.getByRole("link", { name: /Open course/ })).toBeTruthy();
  });

  it("records that it was opened", () => {
    screenOf();

    fireEvent.click(screen.getByRole("link", { name: /Open article/ }));

    expect(resourceOpened).toHaveBeenCalledWith("r1", "Laws of UX", "Jon Yablonski", "article");
  });

  it("says opening it does not mark anything done, and when it was last checked", () => {
    screenOf();

    expect(screen.getByText("Opens on the provider’s site. Opening it does not mark it done.")).toBeTruthy();
    expect(screen.getByText("Last checked 12 Sep 2026")).toBeTruthy();
  });

  it("lets them report a problem with the resource", () => {
    screenOf();

    expect(
      screen.getByRole("button", { name: "Report a problem with this resource | Laws of UX | c1" }),
    ).toBeTruthy();
  });

  describe("the tick box", () => {
    it("lets them say they have done the resource, and that the tick is only theirs", () => {
      screenOf();

      const box = screen.getByRole("checkbox", { name: /I have done this resource/ }) as HTMLInputElement;
      expect(box.checked).toBe(false);
      expect(screen.getByText("Your own tick. Only you see it.")).toBeTruthy();
    });

    it("shows the tick when the resource has been ticked, on the list or here", () => {
      tickedIds = ["r1"];
      screenOf();

      expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(true);
    });

    it("ticks and unticks the resource when it is clicked", () => {
      screenOf();

      fireEvent.click(screen.getByRole("checkbox"));

      expect(toggle).toHaveBeenCalledWith("r1");
    });

    it("says when the browser couldn't save the tick", () => {
      tickedIds = ["r1"];
      unsavedIds = ["r1"];
      screenOf();

      expect(screen.getByText("Not saved")).toBeTruthy();
    });

    it("says nothing of the kind when it is saved", () => {
      tickedIds = ["r1"];
      screenOf();

      expect(screen.queryByText("Not saved")).toBeNull();
    });
  });
});
