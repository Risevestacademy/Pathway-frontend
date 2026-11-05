import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import type { ResourceGroup } from "../resourceGroups.utils";
import { ResourceStepCard } from "./ResourceStepCard";

vi.mock("../../resources/components/ResourceCard", () => ({
  default: ({ resource, context }: { resource: { title: string }; context?: { stepTitle: string } }) => (
    <article aria-label={resource.title}>
      {resource.title}
      <span data-testid="context">{context?.stepTitle}</span>
    </article>
  ),
}));
vi.mock("../../progress/components/StepCompletionButton", () => ({
  default: ({ stepId, status }: { stepId: string; status: string }) => (
    <button type="button">{`complete ${stepId} (${status})`}</button>
  ),
}));

afterEach(cleanup);

const group: ResourceGroup = {
  stepId: "s2",
  number: 2,
  title: "How people think",
  resources: [
    { id: "r1", title: "Laws of UX", provider: "Jon Yablonski", kind: "article", url: "https://a" },
    { id: "r2", title: "Don't Make Me Think", provider: "Steve Krug", kind: "book", url: "https://b" },
  ],
};

const card = (status: Parameters<typeof ResourceStepCard>[0]["status"] = null, over: Partial<ResourceGroup> = {}) =>
  render(
    <ResourceStepCard careerId="c1" careerTitle="Product Designer" group={{ ...group, ...over }} status={status} />,
  );

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

  it("lists each resource, telling it which step it is under", () => {
    card();

    const section = screen.getByRole("region");
    expect(within(section).getByRole("article", { name: "Laws of UX" })).toBeTruthy();
    expect(within(section).getByRole("article", { name: "Don't Make Me Think" })).toBeTruthy();
    expect(screen.getAllByTestId("context").map((el) => el.textContent)).toEqual([
      "How people think",
      "How people think",
    ]);
  });

  it.each([
    ["NOT_STARTED", "Not started"],
    ["IN_PROGRESS", "In Progress"],
    ["COMPLETED", "Done"],
  ] as const)("shows a %s step as %s, with a way to change it", (status, label) => {
    card(status);

    expect(screen.getByText(label)).toBeTruthy();
    expect(screen.getByRole("button", { name: `complete s2 (${status})` })).toBeTruthy();
  });

  it("shows no status or button when the person isn't tracking this pathway", () => {
    card(null);

    expect(screen.queryByText("Not started")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
