import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { StepCompleteDialog } from "./StepCompleteDialog";

afterEach(cleanup);

const resources = [
  { id: "r1", title: "Laws of UX", ticked: true },
  { id: "r2", title: "Don't Make Me Think", ticked: false },
];

const show = (over: Partial<Parameters<typeof StepCompleteDialog>[0]> = {}) => {
  const onOpenChange = vi.fn();
  const onNextStep = vi.fn();
  render(
    <StepCompleteDialog
      open
      onOpenChange={onOpenChange}
      step={{ number: 2, title: "How people think" }}
      resources={resources}
      progress={{ completed: 2, total: 16 }}
      nextStep={{ title: "Get comfortable in Figma" }}
      onNextStep={onNextStep}
      {...over}
    />,
  );
  return { onOpenChange, onNextStep };
};

describe("StepCompleteDialog", () => {
  it("congratulates them on the step, saying they marked it complete", () => {
    show();

    const dialog = screen.getByRole("dialog", { name: "Step 2 complete" });
    expect(dialog.textContent).toContain("How people think. You marked this step complete.");
  });

  it("shows nothing when it isn't open", () => {
    show({ open: false });

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("has a decorative picture, hidden from screen readers", () => {
    show();

    const art = screen.getByRole("dialog").querySelector("img") as HTMLImageElement;
    expect(art.getAttribute("alt")).toBe("");
    expect(art.getAttribute("aria-hidden")).toBe("true");
  });

  it("shows the picture, which brings its own tile, at the size of the design", () => {
    show();

    const art = screen.getByRole("dialog").querySelector("img") as HTMLImageElement;
    expect(art.className).toContain("size-24");
    expect(art.parentElement?.className ?? "").not.toContain("bg-success-50");
  });

  it("lists the step's resources, ticked or not", () => {
    show();

    const list = within(screen.getByRole("list", { name: "Resources in this step" }));
    expect(list.getAllByRole("listitem")).toHaveLength(2);
    expect(list.getByText("Resource: Laws of UX")).toBeTruthy();
    expect(list.getByText("Resource: Don't Make Me Think: not ticked. You can still do it later.")).toBeTruthy();
  });

  it("tells a screen reader which resources were ticked", () => {
    show();

    const [ticked, notTicked] = screen.getAllByRole("listitem");
    expect(within(ticked).getByText("Ticked")).toBeTruthy();
    expect(within(notTicked).queryByText("Ticked")).toBeNull();
  });

  it("shows how many steps they have completed overall, with a bar", () => {
    show();

    expect(screen.getByText("2 of 16 steps complete")).toBeTruthy();
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("2");
    expect(bar.getAttribute("aria-valuemax")).toBe("16");
  });

  it("leaves the overall progress out when it isn't known", () => {
    show({ progress: null });

    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("lets them stay where they are", () => {
    const { onOpenChange } = show();

    fireEvent.click(screen.getByRole("button", { name: "Stay here" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("offers the next step by name, and goes there", () => {
    const { onNextStep } = show();

    fireEvent.click(screen.getByRole("button", { name: "Next Step: Get comfortable in Figma" }));

    expect(onNextStep).toHaveBeenCalledOnce();
  });

  it("offers no next step after the last one", () => {
    show({ nextStep: null });

    expect(screen.queryByRole("button", { name: /Next Step/ })).toBeNull();
    expect(screen.getByRole("button", { name: "Stay here" })).toBeTruthy();
  });

  it("reminds them progress is self-reported and can be undone", () => {
    show();

    expect(screen.getByText("Progress is self-reported. You can undo this any time.")).toBeTruthy();
  });
});
