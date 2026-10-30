import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateCareerError } from "../../../lib/api/adminCareers.api";
import type { CreatedCareer } from "../adminCareers.types";
import { AddCareerDialog } from "./AddCareerDialog";

const mutate = vi.fn();
const addCareer = vi.fn();
let createState: { isPending: boolean; isError: boolean; error: Error | null };
let fieldsState: { isPending: boolean; isError: boolean; data?: { id: string; name: string }[] };

vi.mock("../hooks/useCreateCareer", () => ({
  useCreateCareer: () => ({ mutate, ...createState }),
}));
vi.mock("../../catalog/hooks/useFields", () => ({
  useFields: () => ({ refetch: vi.fn(), ...fieldsState }),
}));
vi.mock("../adminStore", () => ({
  useAdminStore: (select: (s: { addCareer: typeof addCareer }) => unknown) => select({ addCareer }),
}));
// Radix Select is awkward in jsdom, so the field list is a native select here.
vi.mock("./FormFields", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./FormFields")>()),
  SelectField: ({
    label,
    value,
    onChange,
    options,
    error,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    error?: string;
  }) => (
    <label>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Pick</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span role="alert">{error}</span>}
    </label>
  ),
}));

const career: CreatedCareer = {
  id: "career-1",
  slug: "devops-engineer",
  title: "DevOps Engineer",
  description: "Automates delivery.",
  roleSummary: "Builds pipelines.",
  fieldId: "field-1",
  targetLevels: ["RECENT_GRAD"],
  status: "DRAFT",
  version: 1,
  createdAt: "2026-10-28T10:30:00.000Z",
  revision: { id: "rev-1", status: "DRAFT", baseVersion: 1 },
};

beforeEach(() => {
  mutate.mockReset();
  addCareer.mockReset();
  createState = { isPending: false, isError: false, error: null };
  fieldsState = { isPending: false, isError: false, data: [{ id: "field-1", name: "Technology" }] };
});
afterEach(cleanup);

const open = (onOpenChange = vi.fn()) =>
  render(<AddCareerDialog open onOpenChange={onOpenChange} />);

async function fillForm() {
  await userEvent.type(screen.getByLabelText("Career name"), "DevOps Engineer");
  await userEvent.selectOptions(screen.getByLabelText("Field"), "field-1");
  await userEvent.type(screen.getByLabelText("One-line summary"), "Automates delivery.");
  await userEvent.type(screen.getByLabelText("What they do"), "Builds pipelines.");
  await userEvent.click(screen.getByRole("checkbox", { name: "Recent graduate" }));
}

describe("AddCareerDialog", () => {
  it("fills the slug from the name", async () => {
    open();

    await userEvent.type(screen.getByLabelText("Career name"), "DevOps Engineer");

    expect((screen.getByLabelText(/^Slug/) as HTMLInputElement).value).toBe("devops-engineer");
  });

  it("stops following the name once the slug is edited", async () => {
    open();

    await userEvent.type(screen.getByLabelText(/^Slug/), "Custom Slug");
    await userEvent.type(screen.getByLabelText("Career name"), "Something Else");

    expect((screen.getByLabelText(/^Slug/) as HTMLInputElement).value).toBe("custom-slug");
  });

  it("asks for what is missing before creating", async () => {
    open();

    await userEvent.click(screen.getByRole("button", { name: "Create draft" }));

    expect(mutate).not.toHaveBeenCalled();
    expect(screen.getByText("Add the career’s name.")).toBeTruthy();
    expect(screen.getByText("Pick a field.")).toBeTruthy();
    expect(screen.getByText("Pick at least one.")).toBeTruthy();
  });

  it("sends the career to the API", async () => {
    open();

    await fillForm();
    await userEvent.click(screen.getByRole("button", { name: "Create draft" }));

    expect(mutate).toHaveBeenCalledWith(
      {
        title: "DevOps Engineer",
        slug: "devops-engineer",
        fieldId: "field-1",
        description: "Automates delivery.",
        roleSummary: "Builds pipelines.",
        targetLevels: ["RECENT_GRAD"],
      },
      expect.anything(),
    );
  });

  it("shows the draft in the list and closes once it is created", async () => {
    const onOpenChange = vi.fn();
    mutate.mockImplementation((_input, options) => options.onSuccess(career));
    open(onOpenChange);

    await fillForm();
    await userEvent.click(screen.getByRole("button", { name: "Create draft" }));

    expect(addCareer).toHaveBeenCalledWith({
      id: "career-1",
      title: "DevOps Engineer",
      shortDescription: "Automates delivery.",
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it.each([
    ["CAREER_TITLE_TAKEN", "Another career already has this title."],
    ["CAREER_SLUG_TAKEN", "Another career already uses this slug."],
    ["FIELD_NOT_FOUND", "That field no longer exists. Pick another one."],
  ])("points a %s error at its field", async (code, message) => {
    const onOpenChange = vi.fn();
    const { rerender } = open(onOpenChange);
    await fillForm();

    createState = { isPending: false, isError: true, error: new CreateCareerError(message, code) };
    rerender(<AddCareerDialog open onOpenChange={onOpenChange} />);

    expect(screen.getByText(message)).toBeTruthy();
  });

  it("shows any other error above the buttons", () => {
    createState = {
      isPending: false,
      isError: true,
      error: new CreateCareerError("We couldn’t create this career. Please try again."),
    };
    open();

    expect(screen.getByText("We couldn’t create this career. Please try again.")).toBeTruthy();
  });

  it("disables the button while creating", () => {
    createState = { isPending: true, isError: false, error: null };
    open();

    expect((screen.getByRole("button", { name: "Creating..." }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });
});
