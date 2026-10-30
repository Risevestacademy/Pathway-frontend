import clsx from "clsx";
import { Check } from "lucide-react";
import { ROLES, type CareerAccess, type Role } from "../admin.workflow";

/** Checkbox cards for picking one or more roles. */
export function RoleCards({
  value,
  onChange,
  compact,
}: {
  value: Role[];
  onChange: (roles: Role[]) => void;
  compact?: boolean;
}) {
  const toggle = (role: Role) =>
    onChange(value.includes(role) ? value.filter((r) => r !== role) : [...value, role]);

  return (
    <div role="group" aria-label="Roles" className="flex flex-col gap-3">
      {ROLES.map((role) => {
        const checked = value.includes(role.id);
        return (
          <label
            key={role.id}
            className={clsx(
              "flex cursor-pointer gap-3 rounded-xl border px-4 py-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500",
              checked ? "border-brand-500 bg-brand-50" : "border-line-strong hover:border-brand-300",
              compact && "py-2.5",
            )}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(role.id)}
              className="peer sr-only"
            />
            <span
              aria-hidden
              className={clsx(
                "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border",
                checked ? "border-brand-600 bg-brand-600 text-white" : "border-line-strong bg-surface",
              )}
            >
              {checked && <Check className="size-3.5" />}
            </span>
            <span>
              <span className="block font-medium text-ink">{role.label}</span>
              <span className="block text-sm text-ink-muted">{role.description}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}

const chip = (active: boolean) =>
  clsx(
    "rounded-lg px-3 py-1.5 text-sm font-medium focus-ring",
    active ? "bg-brand-600 text-white" : "bg-surface-muted text-ink-muted hover:bg-grey-100",
  );

/** "All careers" or a set of specific careers, as toggle chips. */
export function CareerAccessPicker({
  value,
  careers,
  onChange,
}: {
  value: CareerAccess;
  careers: string[];
  onChange: (access: CareerAccess) => void;
}) {
  const toggle = (title: string) => {
    if (value === "all") return onChange([title]);
    const next = value.includes(title) ? value.filter((t) => t !== title) : [...value, title];
    // With nothing selected, fall back to everything rather than no access.
    onChange(next.length === 0 ? "all" : next);
  };

  return (
    <div role="group" aria-label="Career access" className="flex flex-wrap gap-2">
      <button
        type="button"
        aria-pressed={value === "all"}
        onClick={() => onChange("all")}
        className={chip(value === "all")}
      >
        All careers
      </button>
      {careers.map((title) => {
        const active = value !== "all" && value.includes(title);
        return (
          <button
            key={title}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(title)}
            className={chip(active)}
          >
            {title}
          </button>
        );
      })}
    </div>
  );
}

/** Radio cards for picking exactly one role. */
export function RoleRadioCards({
  value,
  onChange,
  name = "role",
}: {
  value: Role | null;
  onChange: (role: Role) => void;
  name?: string;
}) {
  return (
    <div role="radiogroup" aria-label="Role" className="flex flex-col gap-3">
      {ROLES.map((role) => {
        const checked = value === role.id;
        return (
          <label
            key={role.id}
            className={clsx(
              "flex cursor-pointer gap-3 rounded-xl border px-4 py-2.5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500",
              checked ? "border-brand-500 bg-brand-50" : "border-line-strong hover:border-brand-300",
            )}
          >
            <input
              type="radio"
              name={name}
              checked={checked}
              onChange={() => onChange(role.id)}
              className="sr-only"
            />
            <span
              aria-hidden
              className={clsx(
                "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border",
                checked ? "border-brand-600 bg-brand-600 text-white" : "border-line-strong bg-surface",
              )}
            >
              {checked && <Check className="size-3.5" />}
            </span>
            <span>
              <span className="block font-medium text-ink">{role.label}</span>
              <span className="block text-sm text-ink-muted">{role.description}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
