import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CatalogueEmptyState } from "./CatalogueEmptyState";

afterEach(cleanup);

describe("CatalogueEmptyState", () => {
  it("explains a Recommended miss with the interest and level", () => {
    render(
      <CatalogueEmptyState
        view="recommended"
        interestLabel="Design"
        levelLabel="Early-career professional"
        onShowAll={() => {}}
      />,
    );

    expect(screen.getByText("No careers match your interest yet")).toBeTruthy();
    expect(
      screen.getByText(/We don’t have Design careers for early-career professionals yet/),
    ).toBeTruthy();
  });

  it("explains a level-only miss", () => {
    render(
      <CatalogueEmptyState
        view="level"
        interestLabel={null}
        levelLabel="Recent graduate"
        onShowAll={() => {}}
      />,
    );

    expect(screen.getByText("No careers for recent graduates yet")).toBeTruthy();
  });

  it.each(["recommended", "level"] as const)(
    "offers the full catalogue from the %s view",
    async (view) => {
      const onShowAll = vi.fn();
      render(
        <CatalogueEmptyState
          view={view}
          interestLabel="Design"
          levelLabel="Recent graduate"
          onShowAll={onShowAll}
        />,
      );

      await userEvent.click(screen.getByRole("button", { name: "See all careers" }));

      expect(onShowAll).toHaveBeenCalledOnce();
    },
  );

  it("shows the empty catalogue with no way out from All", () => {
    render(
      <CatalogueEmptyState
        view="all"
        interestLabel={null}
        levelLabel="Recent graduate"
        onShowAll={() => {}}
      />,
    );

    expect(screen.getByText("No careers available yet")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
