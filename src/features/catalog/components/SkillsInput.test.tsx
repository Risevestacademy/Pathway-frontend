import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkillsInput } from "./SkillsInput";

const options = [
  { value: "a", label: "Figma" },
  { value: "b", label: "SQL" },
  { value: "c", label: "Git" },
];

afterEach(cleanup);

describe("SkillsInput", () => {
  it("shows a chip with the skill name for every selected value", () => {
    render(
      <SkillsInput values={["a", "b"]} options={options} max={5} onChange={vi.fn()} />,
    );
    expect(screen.getByRole("button", { name: "Remove Figma" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Remove SQL" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Remove Git" })).toBeNull();
  });

  it("removes a skill when its chip button is clicked", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <SkillsInput values={["a", "b"]} options={options} max={5} onChange={onChange} />,
    );
    await user.click(screen.getByRole("button", { name: "Remove Figma" }));
    expect(onChange).toHaveBeenCalledWith(["b"]);
  });

  it("does not count saved values that are not in the options toward the limit", () => {
    render(
      <SkillsInput values={["x", "y", "z"]} options={options} max={3} onChange={vi.fn()} />,
    );
    expect(screen.getByText("You can add up to 3 skills")).toBeTruthy();
  });

  it("drops saved values that are not in the options when a skill is removed", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <SkillsInput values={["a", "gone"]} options={options} max={5} onChange={onChange} />,
    );
    await user.click(screen.getByRole("button", { name: "Remove Figma" }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("explains how many skills can be added", () => {
    render(
      <SkillsInput values={["a"]} options={options} max={5} onChange={vi.fn()} />,
    );
    expect(screen.getByText("You can add up to 5 skills")).toBeTruthy();
  });

  it("says when the limit is reached", () => {
    render(
      <SkillsInput values={["a", "b", "c"]} options={options} max={3} onChange={vi.fn()} />,
    );
    expect(screen.getByText("Limit reached: 3 of 3 skills")).toBeTruthy();
  });

  it("ignores saved values that are not in the options", () => {
    render(
      <SkillsInput values={["gone"]} options={options} max={5} onChange={vi.fn()} />,
    );
    expect(screen.queryByRole("button", { name: /^Remove/ })).toBeNull();
  });

  it("disables the picker when disabled", () => {
    render(
      <SkillsInput values={[]} options={options} max={5} onChange={vi.fn()} disabled />,
    );
    const trigger = screen.getByRole("button", {
      name: "Select skills",
    }) as HTMLButtonElement;
    expect(trigger.disabled).toBe(true);
  });
});