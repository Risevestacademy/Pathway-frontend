import type { CareerDetailsForm, EditableCareer } from "./admin.editor.types";

export type DetailsErrors = Partial<Record<keyof CareerDetailsForm, string>>;

const NAME_MAX = 80;
const SUMMARY_MIN = 10;
const SUMMARY_MAX = 200;

/** Every field is required; a career isn't ready to submit until this is empty. */
export function validateDetails(d: CareerDetailsForm): DetailsErrors {
  const errors: DetailsErrors = {};
  const name = d.name.trim();
  const summary = d.summary.trim();

  if (!name) errors.name = "Every career needs a name. Required.";
  else if (name.length < 2) errors.name = "Use at least 2 characters.";
  else if (name.length > NAME_MAX) errors.name = `Keep the name under ${NAME_MAX} characters.`;

  if (!summary) errors.summary = "Learners see this on the Explore card. Required.";
  else if (summary.length < SUMMARY_MIN) {
    errors.summary = `Write at least ${SUMMARY_MIN} characters so learners get the point.`;
  } else if (summary.length > SUMMARY_MAX) {
    errors.summary = `Keep the summary under ${SUMMARY_MAX} characters.`;
  }

  if (!d.whoItSuits.trim()) errors.whoItSuits = "Say who this career suits. Required.";
  if (!d.category.trim()) errors.category = "Choose a category. Required.";

  if (!d.salary.trim()) errors.salary = "Add the typical starting salary. Required.";
  else if (!/\d/.test(d.salary)) errors.salary = "Enter the salary as a number or range.";

  if (!d.salarySource.trim()) {
    errors.salarySource = d.salary.trim()
      ? "A figure without a source can’t be published."
      : "Add the source for this figure. Required.";
  }

  if (!d.demandOutlook.trim()) errors.demandOutlook = "Add the demand outlook. Required.";
  return errors;
}

const ERROR_FIX_LABEL: Record<keyof DetailsErrors, string> = {
  name: "the career name",
  summary: "the one-line summary",
  whoItSuits: "who it suits",
  category: "the category",
  salary: "the salary",
  salarySource: "the salary source",
  demandOutlook: "the demand outlook",
};

export function describeFixes(errors: DetailsErrors): string {
  const labels = (Object.keys(errors) as (keyof DetailsErrors)[]).map(
    (k) => ERROR_FIX_LABEL[k],
  );
  if (labels.length <= 1) return `Add ${labels[0] ?? "the missing details"}`;
  return `Add ${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

/** Problems outside the Details tab that also block submitting. */
export function getOtherBlockers(career: EditableCareer): string[] {
  const blockers: string[] = [];
  const noSource = career.skills.filter((s) => !s.source.trim()).length;
  if (noSource > 0) {
    blockers.push(`${noSource} skill${noSource > 1 ? "s need" : " needs"} a source`);
  }
  for (const s of career.sources.filter((x) => !x.link.trim())) {
    blockers.push(`“${s.title}” has no link`);
  }
  return blockers;
}

export function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
