import { describe, expect, it } from "vitest";
import { formatMoney, getCareerInfo, groupByGeo } from "./careerDetail.utils";

describe("getCareerInfo", () => {
  it("returns published careers", () => {
    expect(getCareerInfo("frontend-developer")?.title).toBe(
      "Frontend Developer",
    );
  });

  it("does not return retired careers", () => {
    expect(getCareerInfo("flash-developer")).toBeNull();
  });
});

describe("groupByGeo", () => {
  it("keeps statistics from different geographies separate", () => {
    const career = getCareerInfo("frontend-developer");
    const grouped = groupByGeo(career?.stats ?? []);

    expect([...grouped.keys()]).toEqual(["United States", "Lagos, Nigeria"]);
    expect(
      grouped
        .get("United States")
        ?.every((stat) => stat.geography === "United States"),
    ).toBe(true);
    expect(
      grouped
        .get("Lagos, Nigeria")
        ?.every((stat) => stat.geography === "Lagos, Nigeria"),
    ).toBe(true);
  });
});

describe("formatMoney", () => {
  it("formats a whole-dollar amount without decimal places", () => {
    expect(formatMoney(92750, "USD")).toBe("$92,750");
  });
});
