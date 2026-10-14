import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getCatalogueTabs } from "../catalog.utils";
import { CatalogueTabs } from "./CatalogueTabs";

afterEach(cleanup);

const tabs = getCatalogueTabs("Recent graduate", true);
const pressed = (name: string) =>
  screen.getByRole("button", { name }).getAttribute("aria-pressed");

describe("CatalogueTabs", () => {
  it("marks only the active tab as pressed", () => {
    render(<CatalogueTabs tabs={tabs} value="level" onChange={() => {}} />);

    expect(pressed("Recent graduate")).toBe("true");
    expect(pressed("Recommended")).toBe("false");
    expect(pressed("All")).toBe("false");
  });

  it("reports the clicked tab", async () => {
    const onChange = vi.fn();
    render(<CatalogueTabs tabs={tabs} value="recommended" onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: "All" }));

    expect(onChange).toHaveBeenCalledWith("all");
  });

  it("is reachable and operable by keyboard", async () => {
    const onChange = vi.fn();
    render(<CatalogueTabs tabs={tabs} value="recommended" onChange={onChange} />);

    await userEvent.tab();
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith("level");
  });
});
