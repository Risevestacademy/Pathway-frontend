import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AnswerToggle } from "./AnswerToggle";

afterEach(cleanup);

describe("AnswerToggle", () => {
  it("labels the group with the skill name and starts with nothing selected", () => {
    render(
      <AnswerToggle skillId="html" skillName="HTML" value={undefined} onChange={() => {}} />,
    );
    expect(screen.getByRole("group", { name: "Your answer for HTML" })).toBeTruthy();
    const radios = screen.getAllByRole<HTMLInputElement>("radio");
    expect(radios).toHaveLength(3);
    expect(radios.every((radio) => !radio.checked)).toBe(true);
  });

  it("reports the chosen answer", async () => {
    const onChange = vi.fn();
    render(<AnswerToggle skillId="html" skillName="HTML" value={undefined} onChange={onChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "Not yet" }));
    expect(onChange).toHaveBeenCalledWith("NOT_YET");
  });

  it("shows the current value as checked", () => {
    render(<AnswerToggle skillId="html" skillName="HTML" value="HAVE" onChange={() => {}} />);
    expect(screen.getByRole<HTMLInputElement>("radio", { name: "Have" }).checked).toBe(true);
  });
});
