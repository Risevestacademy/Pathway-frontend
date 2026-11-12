import clsx from "clsx";
import type { ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { PathwaySummary } from "@/features/explore/hooks/useCareerPathway";
import type { Career } from "@/types/career.types";
import { COMPARE } from "../compare.copy";
import { commonSkills, stepCountLabel } from "../compare.utils";
import {
  ExamplesCell,
  FirstStepCell,
  OutlookCell,
  PayCell,
  SkillChips,
  bodyText,
} from "./CompareCells";
import StartAction from "./StartAction";

type PathwayQuery = UseQueryResult<PathwaySummary | null>;

interface CompareTableProps {
  first: Career;
  second: Career;
  firstPathway: PathwayQuery;
  secondPathway: PathwayQuery;
}

const R = COMPARE.result;

export const columns =
  "md:grid-cols-[9rem_minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[12rem_minmax(0,1fr)_minmax(0,1fr)]";
export const cardsPad = "md:px-[calc(1.5rem+1px)] lg:px-[calc(2rem+1px)]";
const rowPad = "px-4 sm:px-6 lg:px-8";

export default function CompareTable({
  first,
  second,
  firstPathway,
  secondPathway,
}: CompareTableProps) {
  const careers = [first, second];
  const shared = commonSkills(first.tags, second.tags);

  return (
    <div
      role="table"
      aria-label={`${R.tableLabel}: ${first.title} and ${second.title}`}
      className="overflow-hidden rounded-[28px] border border-grey-100 bg-surface"
    >
      <div role="rowgroup" className="sr-only">
        <div role="row">
          <span role="columnheader">Fact</span>
          {careers.map((career) => (
            <span key={career.id} role="columnheader">
              {career.title}
            </span>
          ))}
        </div>
      </div>

      <div role="rowgroup">
        <Row label={R.rows.whatYouDo}>
          {careers.map((career) => (
            <Cell key={career.id} career={career}>
              <p className={bodyText}>{career.roleSummary || R.notYet}</p>
            </Cell>
          ))}
        </Row>

        <Row label={R.rows.examples}>
          {careers.map((career) => (
            <Cell key={career.id} career={career}>
              <ExamplesCell career={career} />
            </Cell>
          ))}
        </Row>

        <Row label={R.rows.pay}>
          {careers.map((career) => (
            <Cell key={career.id} career={career}>
              <PayCell career={career} />
            </Cell>
          ))}
        </Row>

        <Row label={R.rows.outlook}>
          {careers.map((career) => (
            <Cell key={career.id} career={career}>
              <OutlookCell career={career} />
            </Cell>
          ))}
        </Row>

        <Row label={R.rows.skills}>
          {careers.map((career) => (
            <Cell key={career.id} career={career}>
              <SkillChips skills={career.tags} />
            </Cell>
          ))}
        </Row>

        <Row label={R.rows.common}>
          <div role="cell" className="col-span-2 min-w-0">
            <SkillChips skills={shared} tone="shared" emptyText={R.noCommonSkills} />
          </div>
        </Row>

        <Row label={R.rows.roadmap}>
          {careers.map((career) => (
            <Cell key={career.id} career={career}>
              <p className={bodyText}>{roadmapText(career)}</p>
            </Cell>
          ))}
        </Row>

        <Row label={R.rows.firstStep}>
          <Cell career={first}>
            <FirstStepCell pathway={firstPathway} />
          </Cell>
          <Cell career={second}>
            <FirstStepCell pathway={secondPathway} />
          </Cell>
        </Row>

        <Row label={R.rows.start} hideLabel>
          {careers.map((career) => (
            <Cell key={career.id} career={career}>
              <StartAction career={career} />
            </Cell>
          ))}
        </Row>
      </div>
    </div>
  );
}

function Row({
  label,
  hideLabel = false,
  children,
}: {
  label: string;
  hideLabel?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      role="row"
      className={clsx(
        "grid grid-cols-2 gap-x-4 gap-y-3 border-t border-grey-100 py-5 first:border-t-0 md:gap-x-6 md:py-6",
        rowPad,
        columns,
      )}
    >
      <div
        role="rowheader"
        className={clsx(
          "col-span-2 text-base leading-6 font-medium text-ink md:col-span-1",
          hideLabel && "sr-only",
        )}
      >
        {label}
      </div>
      {hideLabel && <div aria-hidden className="hidden md:block" />}
      {children}
    </div>
  );
}

function Cell({ career, children }: { career: Career; children: ReactNode }) {
  return (
    <div role="cell" className="min-w-0 wrap-anywhere">
      <span aria-hidden className="mb-1.5 block text-sm leading-5 font-medium text-ink md:hidden">
        {career.title}
      </span>
      {children}
    </div>
  );
}

function roadmapText(career: Career): string {
  if (!career.roadmapId) return R.roadmapSoon;
  return career.roadmapStepCount != null ? stepCountLabel(career.roadmapStepCount) : R.notYet;
}