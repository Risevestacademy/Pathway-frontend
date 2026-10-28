import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { FAQS } from "../landing.copy";
import FaqSection from "./FaqSection";

afterEach(cleanup);

describe("FaqSection", () => {
  it("opens the first question by default", () => {
    render(<FaqSection />);
    expect(screen.getByText(FAQS[0].answer)).not.toBeNull();
    expect(screen.queryByText(FAQS[1].answer)).toBeNull();
  });

  it("keeps a single item open and lets the open one collapse", async () => {
    const user = userEvent.setup();
    render(<FaqSection />);

    await user.click(screen.getByRole("button", { name: FAQS[1].question }));
    expect(screen.getByText(FAQS[1].answer)).not.toBeNull();
    expect(screen.queryByText(FAQS[0].answer)).toBeNull();

    await user.click(screen.getByRole("button", { name: FAQS[1].question }));
    expect(screen.queryByText(FAQS[1].answer)).toBeNull();
  });
});
