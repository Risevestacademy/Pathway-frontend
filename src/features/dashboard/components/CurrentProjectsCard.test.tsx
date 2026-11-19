import { afterEach, describe, expect, it } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import { renderWithRouter } from "../../../test/renderWithRouter";
import { CurrentProjectsCard } from "./CurrentProjectsCard";

afterEach(cleanup);

describe("CurrentProjectsCard", () => {
  it("says there are no projects yet and points to Explore careers", async () => {
    await renderWithRouter(() => <CurrentProjectsCard />);

    expect(screen.getByRole("heading", { name: "Current Projects" })).toBeTruthy();
    expect(screen.getByText("No projects yet")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Explore careers" }).getAttribute("href")).toBe("/careers");
  });
});
