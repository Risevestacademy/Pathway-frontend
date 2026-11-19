import { describe, expect, it } from "vitest";
import {
  CAREERS,
  FAQS,
  FAQ_SECTION,
  NAV_LINKS,
  STEPS,
  FEATURE_CARDS,
} from "./landing.copy";

const uniqueIds = (items: readonly { id: string }[]) =>
  new Set(items.map((item) => item.id)).size === items.length;

describe("landing copy", () => {
  it("has four feature cards, steps, careers and FAQs", () => {
    expect(FEATURE_CARDS).toHaveLength(4);
    expect(STEPS).toHaveLength(4);
    expect(CAREERS).toHaveLength(4);
    expect(FAQS).toHaveLength(4);
  });

  it("uses unique ids so they can key lists and accordion items", () => {
    expect(uniqueIds(FEATURE_CARDS)).toBe(true);
    expect(uniqueIds(STEPS)).toBe(true);
    expect(uniqueIds(CAREERS)).toBe(true);
    expect(uniqueIds(FAQS)).toBe(true);
  });

  it("opens an FAQ that exists by default", () => {
    expect(FAQS.map((faq) => faq.id)).toContain(FAQ_SECTION.defaultOpen);
  });

  it("gives every career exactly three chips", () => {
    for (const career of CAREERS) {
      expect(career.chips).toHaveLength(3);
    }
  });

  it("marks only Opportunities and Mentors as coming soon", () => {
    const comingSoon = NAV_LINKS.filter((link) => "comingSoon" in link).map((l) => l.label);
    expect(comingSoon).toEqual(["Opportunities", "Mentors"]);
  });
});
