import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { ResourceGroup } from "../resourceGroups.utils";
import { ResourceStepCard } from "./ResourceStepCard";

const toggle = vi.fn();
let tickedIds: string[] = [];
let unsavedIds: string[] = [];

vi.mock("../hooks/useResourceTicks", () => ({
  useResourceTicks: () => ({
    isTicked: (id: string) => tickedIds.includes(id),
    isUnsaved: (id: string) => unsavedIds.includes(id),
    countTicked: (ids: string[]) => ids.filter((id) => tickedIds.includes(id)).length,
    toggle: (id: string) => toggle(id),
  }),
}));
vi.mock("./ResourceRow", () => ({
  ResourceRow: ({ resource, ticked, unsaved, onToggle }: { resource: { id: string; title: string }; ticked: boolean; unsaved: boolean; onToggle: () => void }) => (
    <button type="button" aria-label={`row ${resource.id}`} aria-pressed={ticked} data-unsaved={unsaved} onClick={onToggle}>
      {resource.title}
    </button>
  ),
}));
vi.mock("../../progress/components/StepCompletionButton", () => ({
  default: ({ stepId, status }: { stepId: string; status: string }) => (
    <button type="button">{`complete ${stepId} (${status})`}</button>
  ),
}));

afterEach(() => {
  cleanup();
  toggle.mockReset();
  tickedIds = [];
  unsavedIds = [];
});

const group: ResourceGroup = {
  stepId: "s2",
  number: 2,
  title: "How people think",
  paid: [],
  resources: [
    { id: "r1", title: "Laws of UX", provider: "Jon Yablonski", kind: "article", url: "https://a", description: null, lastChecked: "2026-09-12" },
    { id: "r2", title: "Don't Make Me Think", provider: "Steve Krug", kind: "book", url: "https://b", description: null, lastChecked: "2026-09-12" },
  ],
};

const card = (status: Parameters<typeof ResourceStepCard>[0]["status"] = null, over: Partial<ResourceGroup> = {}) =>
  render(
    <ResourceStepCard careerId="c1" group={{ ...group, ...over }} status={status} />,
  );

const PROMPT = "Everything in this step is ticked. Mark the step complete when you feel done.";

describe("ResourceStepCard", () => {
  it("is a section named after its step, with the step's number", () => {
    card();

    expect(screen.getByRole("region", { name: "Step 2 · How people think" })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: "Step 2 · How people think" })).toBeTruthy();
  });

  it("counts the step's resources", () => {
    card();

    expect(screen.getByText("2 resources")).toBeTruthy();
  });

  it("uses the singular for one resource", () => {
    card(null, { resources: [group.resources[0]] });

    expect(screen.getByText("1 resource")).toBeTruthy();
  });

  it("lists a row for each resource, in order", () => {
    card();

    const section = screen.getByRole("region");
    expect(within(section).getAllByRole("button", { name: /^row / }).map((b) => b.textContent)).toEqual([
      "Laws of UX",
      "Don't Make Me Think",
    ]);
  });

  it("shows each row ticked or not, and passes a tick through", () => {
    tickedIds = ["r2"];
    card();

    expect(screen.getByRole("button", { name: "row r1" }).getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByRole("button", { name: "row r2" }).getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "row r1" }));
    expect(toggle).toHaveBeenCalledWith("r1");
  });

  it("tells each row whether its tick is unsaved", () => {
    tickedIds = ["r1"];
    unsavedIds = ["r1"];
    card();

    expect(screen.getByRole("button", { name: "row r1" }).getAttribute("data-unsaved")).toBe("true");
    expect(screen.getByRole("button", { name: "row r2" }).getAttribute("data-unsaved")).toBe("false");
  });

  describe("the chip", () => {
    it.each([
      ["NOT_STARTED", "Not started"],
      ["IN_PROGRESS", "In Progress"],
    ] as const)("says a %s step with nothing ticked is %s", (status, label) => {
      card(status);

      expect(screen.getByText(label)).toBeTruthy();
    });

    it("says how many are ticked once some are", () => {
      tickedIds = ["r1"];
      card("NOT_STARTED");

      expect(screen.getByText("1 of 2 ticked")).toBeTruthy();
      expect(screen.queryByText("Not started")).toBeNull();
    });

    it("says Done for a step they marked complete, whatever is ticked", () => {
      tickedIds = ["r1"];
      card("COMPLETED");

      expect(screen.getByText("Done")).toBeTruthy();
      expect(screen.queryByText("1 of 2 ticked")).toBeNull();
    });

    it("shows how many are ticked even when they aren't tracking this pathway", () => {
      tickedIds = ["r1"];
      card(null);

      expect(screen.getByText("1 of 2 ticked")).toBeTruthy();
    });

    it("shows no chip when they aren't tracking this pathway and nothing is ticked", () => {
      card(null);

      expect(screen.queryByText(/ticked|Not started|Done|In Progress/)).toBeNull();
    });
  });

  describe("marking the step complete", () => {
    it("offers it once every resource is ticked", () => {
      tickedIds = ["r1", "r2"];
      card("IN_PROGRESS");

      expect(screen.getByText(PROMPT)).toBeTruthy();
      expect(screen.getByRole("button", { name: "complete s2 (IN_PROGRESS)" })).toBeTruthy();
    });

    it("doesn't offer it while some are not ticked", () => {
      tickedIds = ["r1"];
      card("NOT_STARTED");

      expect(screen.queryByText(PROMPT)).toBeNull();
      expect(screen.queryByRole("button", { name: /complete s2/ })).toBeNull();
    });

    it("lets them undo a step they marked complete, without the prompt", () => {
      card("COMPLETED");

      expect(screen.queryByText(PROMPT)).toBeNull();
      expect(screen.getByRole("button", { name: "complete s2 (COMPLETED)" })).toBeTruthy();
    });

    it("never offers it when they aren't tracking this pathway", () => {
      tickedIds = ["r1", "r2"];
      card(null);

      expect(screen.queryByText(PROMPT)).toBeNull();
      expect(screen.queryByRole("button", { name: /complete s2/ })).toBeNull();
    });
  });
});
