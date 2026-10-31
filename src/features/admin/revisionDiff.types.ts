/** Response shape of GET /admin/revisions/{revisionId}/diff. */

/** A raw field value: decimals arrive as strings ("230000.00"), lists as arrays. */
export type DiffValue = string | number | boolean | null | DiffValue[];

/** One field whose value differs between the live career and the revision. */
export interface DiffChange {
  field: string;
  label: string;
  before: DiffValue;
  after: DiffValue;
  /** For a foreign key, `before` and `after` are raw ids and these are the readable names. */
  beforeLabel?: string | null;
  afterLabel?: string | null;
}

/** An item that was added, removed or moved. Its fields vary by section. */
export interface DiffItem {
  label?: string;
  [key: string]: unknown;
}

export interface DiffSection {
  changed: DiffChange[];
  added: DiffItem[];
  removed: DiffItem[];
  moved: DiffItem[];
}

export const DIFF_SECTION_NAMES = [
  "career",
  "pathway",
  "steps",
  "skills",
  "outlook",
  "resources",
] as const;

export type DiffSectionName = (typeof DIFF_SECTION_NAMES)[number];

/** A blocker or advisory: plain text, or an object with a message. */
export type DiffNotice = string | { message: string; code?: string; [key: string]: unknown };

export interface RevisionDiff {
  revisionId: string;
  title: string;
  submittedBy: string;
  /** Already worded by the server, e.g. "5 hours ago". */
  submittedAt: string;
  baseVersion: number;
  liveVersion: number;
  /** The live career changed after this revision was created: ask for a rebase before approving. */
  stale: boolean;
  /** Hard stops: publishing would fail while any remain. */
  blockers: DiffNotice[];
  /** Soft warnings. They do not block approval. */
  advisories: DiffNotice[];
  /** Only the sections that changed are present. */
  sections: Partial<Record<DiffSectionName | (string & {}), DiffSection>>;
}

export const noticeText = (notice: DiffNotice): string =>
  typeof notice === "string" ? notice : notice.message;

const MONEY_FIELDS = new Set(["median", "percentile25", "percentile75", "certificationCost"]);

const money = new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** "230000.00" -> "230,000.00". Anything that isn't a plain number is returned as it is. */
export function formatMoney(value: string | number): string {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && String(value).trim() !== "" ? money.format(n) : String(value);
}

/**
 * A diff value as text for a reviewer: the readable label for a foreign key,
 * money with thousands separators, lists joined, and a dash for nothing.
 */
export function formatDiffValue(
  field: string,
  value: DiffValue,
  label?: string | null,
): string {
  if (label) return label;
  if (value === null || value === "") return "—";
  if (Array.isArray(value)) {
    return value.length === 0 ? "—" : value.map((v) => formatDiffValue(field, v)).join(", ");
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (MONEY_FIELDS.has(field) && (typeof value === "string" || typeof value === "number")) {
    return formatMoney(value);
  }
  return String(value);
}

/** The sections that have something to show, in a fixed order. */
export function changedSections(
  diff: RevisionDiff,
): { name: string; section: DiffSection }[] {
  const names = [
    ...DIFF_SECTION_NAMES,
    ...Object.keys(diff.sections).filter(
      (n) => !(DIFF_SECTION_NAMES as readonly string[]).includes(n),
    ),
  ];
  return names.flatMap((name) => {
    const section = diff.sections[name];
    if (!section) return [];
    const count =
      section.changed.length + section.added.length + section.removed.length + section.moved.length;
    return count > 0 ? [{ name, section }] : [];
  });
}

/** What each section of a diff is called on screen. */
export const SECTION_LABEL: Record<string, string> = {
  career: "Career details",
  pathway: "Roadmap",
  steps: "Roadmap steps",
  skills: "Skills",
  outlook: "Outlook and salary",
  resources: "Resources",
};

export const sectionLabel = (name: string) =>
  SECTION_LABEL[name] ?? name.charAt(0).toUpperCase() + name.slice(1);

const NAME_KEYS = ["label", "title", "name", "text", "field"];

/** A short name for an added, removed or moved item, whatever shape the section gives it. */
export function describeDiffItem(item: DiffItem): string {
  for (const key of NAME_KEYS) {
    const value = item[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  const first = Object.values(item).find((v) => typeof v === "string" && v.trim());
  return typeof first === "string" ? first : "Unnamed item";
}
