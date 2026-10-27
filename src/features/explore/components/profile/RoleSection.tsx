import clsx from "clsx";
import type { Career } from "@/types/career.types";
import { CAREER_PROFILE } from "../../explore.copy";
import { innerCard, panel, panelTitle } from "./profile.styles";

export default function RoleSection({ career }: { career: Career }) {
  return (
    <section aria-labelledby="role-heading" className={panel}>
      <h2 id="role-heading" className={panelTitle}>
        {CAREER_PROFILE.role}
      </h2>
      <p className="mt-2 font-landing-body text-base leading-6 text-grey-600">{career.roleSummary}</p>

      {career.workActivities.length > 0 && (
        <>
          <hr className="my-6 border-grey-100" />
          <h3 className={panelTitle}>{CAREER_PROFILE.activities}</h3>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {career.workActivities.map((activity, index) => (
              <li key={activity} className={clsx(innerCard, "flex flex-col gap-3")}>
                <span className="inline-flex h-7 w-fit items-center rounded-[6px] bg-brand-50 px-2 font-landing-body text-[14px] text-brand-600">
                  {CAREER_PROFILE.activityLabel} {index + 1}
                </span>
                <p className="font-landing-body text-[17px] leading-6 font-medium text-ink">{activity}</p>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
