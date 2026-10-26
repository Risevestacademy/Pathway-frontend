import type { Career } from "@/types/career.types";

const card = "flex flex-col gap-4 rounded-[20px] border border-grey-100 bg-surface p-6";

export default function CareerOverview({ career }: { career: Career }) {
  const skills = career.tags;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <section aria-labelledby="would-do-title" className={card}>
        <h2 id="would-do-title" className="font-display text-2xl leading-7 font-medium text-ink">
          What you would do
        </h2>
        <p className="text-base leading-5 text-grey-600">{career.roleSummary}</p>
      </section>

      {skills.length > 0 && (
        <section aria-labelledby="skills-title" className={card}>
          <div className="flex flex-col gap-2">
            <h2 id="skills-title" className="font-display text-2xl leading-7 font-medium text-ink">
              Skills this career looks for
            </h2>
            <p className="text-sm leading-5 text-grey-500">
              {skills.length} skills, reviewed by our content team.
            </p>
          </div>
          <ul className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <li
                key={skill}
                className="rounded-lg border border-grey-100 bg-grey-50 px-4 py-2.5 text-sm leading-5 text-ink"
              >
                {skill}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
