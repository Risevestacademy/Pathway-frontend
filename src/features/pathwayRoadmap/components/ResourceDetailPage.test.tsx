import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ResourceDetailState } from "../hooks/useResourceDetail";
import { ResourceDetailPage } from "./ResourceDetailPage";

const useResourceDetail = vi.fn();

vi.mock("../hooks/useResourceDetail", () => ({
  useResourceDetail: (careerId: string, resourceId: string) => useResourceDetail(careerId, resourceId),
}));
vi.mock("../../skillCheck/components/BackLink", () => ({
  BackLinkTo: ({ label, to }: { label: string; to: string }) => <a href={to}>{label}</a>,
}));
vi.mock("./ResourceDetailScreen", () => ({
  ResourceDetailScreen: ({ detail }: { detail: { resource: { title: string } } }) => (
    <p>{`Detail: ${detail.resource.title}`}</p>
  ),
}));

afterEach(() => {
  cleanup();
  useResourceDetail.mockReset();
});

const have = (state: ResourceDetailState, retry = vi.fn()) => {
  useResourceDetail.mockReturnValue({ state, retry });
  return retry;
};

describe("ResourceDetailPage", () => {
  it("asks for the resource it is given, in its career", () => {
    have({ kind: "loading" });

    render(<ResourceDetailPage careerId="c1" resourceId="r1" />);

    expect(useResourceDetail).toHaveBeenCalledWith("c1", "r1");
  });

  it("says it is loading, with a way back to the resources", () => {
    have({ kind: "loading" });

    render(<ResourceDetailPage careerId="c1" resourceId="r1" />);

    expect(screen.getByRole("status").textContent).toContain("Loading this resource");
    expect(screen.getByRole("link", { name: "Back" }).getAttribute("href")).toBe(
      "/my-pathway/$careerId/resources",
    );
  });

  it("offers a retry when the resource can't be loaded", () => {
    const retry = have({ kind: "error" });

    render(<ResourceDetailPage careerId="c1" resourceId="r1" />);

    expect(screen.getByRole("alert").textContent).toContain("We couldn’t load this resource");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it("says so when the career has no roadmap yet", () => {
    have({ kind: "unavailable" });

    render(<ResourceDetailPage careerId="c1" resourceId="r1" />);

    expect(screen.getByText("Roadmap coming soon")).toBeTruthy();
  });

  it("says so when the resource can't be found in the roadmap", () => {
    have({ kind: "not-found" });

    render(<ResourceDetailPage careerId="c1" resourceId="r1" />);

    expect(screen.getByText("We couldn’t find that resource")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Back" })).toBeTruthy();
  });

  it("shows the resource once loaded", () => {
    have({
      kind: "ready",
      careerTitle: "Product Designer",
      detail: {
        step: { id: "s1", number: 1, title: "Step 1" },
        resource: { id: "r1", title: "Laws of UX", provider: "Jon", kind: "article", url: "https://a" },
        description: null,
        curationRationale: "",
        lastChecked: "2026-09-12",
        skills: [],
      },
    });

    render(<ResourceDetailPage careerId="c1" resourceId="r1" />);

    expect(screen.getByText("Detail: Laws of UX")).toBeTruthy();
  });
});
