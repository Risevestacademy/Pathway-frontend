export function StepNumberList({ steps }: { steps: string[] }) {
  return (
    <ol className="flex flex-col gap-4 rounded-2xl border border-grey-50 p-4">
      {steps.map((step, index) => (
        <li key={step} className="flex items-center gap-3">
          <span
            aria-hidden
            className="grid size-7 shrink-0 place-items-center rounded-lg border border-brand-200 bg-brand-100 text-sm leading-4 font-medium text-brand-700"
          >
            {index + 1}
          </span>
          <span className="text-base leading-5 text-ink">{step}</span>
        </li>
      ))}
    </ol>
  );
}
