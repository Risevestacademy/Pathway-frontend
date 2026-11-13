import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Dialog } from "./Dialog";

afterEach(cleanup);

const open = (props: Partial<Parameters<typeof Dialog>[0]> = {}) =>
  render(
    <Dialog open onOpenChange={() => {}} title="Step 2 complete" description="How people think." {...props}>
      <p>Body</p>
    </Dialog>,
  );

describe("Dialog", () => {
  it("shows its title, description and content in a labelled dialog", () => {
    open();

    const dialog = screen.getByRole("dialog", { name: "Step 2 complete" });
    expect(dialog.textContent).toContain("How people think.");
    expect(dialog.textContent).toContain("Body");
  });

  it("is left-aligned unless asked to be centered", () => {
    open();

    expect(screen.getByRole("dialog").className).not.toContain("text-center");
  });

  it("can be centered", () => {
    open({ centered: true });

    expect(screen.getByRole("dialog").className).toContain("text-center");
  });

  it("can show something above the title, such as an icon", () => {
    open({ media: <img alt="" data-testid="art" /> });

    const art = screen.getByTestId("art");
    const title = screen.getByText("Step 2 complete");
    expect(art.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("shows nothing above the title when there is no media", () => {
    open();

    expect(screen.queryByTestId("art")).toBeNull();
  });
});
