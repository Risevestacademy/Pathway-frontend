import clsx from "clsx";
import type { ReactNode } from "react";
import {
  type CareerDetailsForm,
  type DetailsErrors,
} from "../admin.editor";

function Field({
  label,
  hint,
  error,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2 font-medium text-ink">
      {label}
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        className={clsx(
          "field-control font-normal placeholder:text-ink-placeholder",
          error && "!border-danger-600",
        )}
      />
      {error ? (
        <span role="alert" className="text-sm font-normal text-danger-700">
          {error}
        </span>
      ) : (
        hint && <span className="text-sm font-normal text-ink-muted">{hint}</span>
      )}
    </label>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 rounded-3xl border border-line-strong p-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

interface DetailsTabProps {
  details: CareerDetailsForm;
  errors: DetailsErrors;
  checkedAt: string | null;
  onChange: (patch: Partial<CareerDetailsForm>) => void;
}

export function DetailsTab({ details, errors, checkedAt, onChange }: DetailsTabProps) {
  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <Card title="Details">
        <Field
          label="Career name"
          value={details.name}
          error={errors.name}
          onChange={(name) => onChange({ name })}
        />
        <Field
          label="One-line summary"
          value={details.summary}
          error={errors.summary}
          placeholder="Add a one-line summary"
          onChange={(summary) => onChange({ summary })}
        />
        <Field
          label="Who it suits"
          value={details.whoItSuits}
          error={errors.whoItSuits}
          placeholder="University student, Early career professional"
          onChange={(whoItSuits) => onChange({ whoItSuits })}
        />
        <Field
          label="Category"
          value={details.category}
          error={errors.category}
          onChange={(category) => onChange({ category })}
        />
      </Card>

      <Card title="Salary and outlook" subtitle="Every figure needs a source">
        <Field
          label="Typical starting salary (monthly)"
          value={details.salary}
          error={errors.salary}
          placeholder="₦250,000 - ₦450,000"
          onChange={(salary) => onChange({ salary })}
        />
        <Field
          label="Salary source"
          value={details.salarySource}
          error={errors.salarySource}
          placeholder="Add the source for this figure"
          hint={checkedAt ? `Checked ${checkedAt}` : undefined}
          onChange={(salarySource) => onChange({ salarySource })}
        />
        <Field
          label="Demand outlook"
          value={details.demandOutlook}
          error={errors.demandOutlook}
          onChange={(demandOutlook) => onChange({ demandOutlook })}
        />
      </Card>
    </div>
  );
}
