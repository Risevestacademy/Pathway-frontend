import OpportunitiesFrame from "./OpportunitiesFrame";
import { BackLinkTo } from "@/features/skillCheck/components/BackLink";
import { Tag } from "@/components/ui/Tag";
// import type { Opportunity } from "../opportunities.type";
import { getDaysLeft } from "../opportunities.util";
import { opportunities } from "../opportunities.data";
import { cn } from "cn";
import ApplicationClosed from "./ApplicationClosed";
import ApplicationOpen from "./ApplicationOpen";

export default function OpportunityPage() {
  const opportunity = opportunities[2];
  let daysLeft;

  if (opportunity.deadline) daysLeft = getDaysLeft(opportunity.deadline);

  const subtitles = [
    opportunity.organisation,
    opportunity.location,
    opportunity.workMode,
    opportunity.deliveryMode,
    opportunity.duration,
  ].filter(Boolean);

  return (
    <OpportunitiesFrame>
      <BackLinkTo label="Back" to="/opportunities" />
      <div className="mt-6">
        <div className="flex gap-2 mb-4">
          <Tag tone="brand" className="py-2 px-3 text-[14px]">
            {opportunity.category}
          </Tag>
          {opportunity.status === "Closed" ? (
            <Tag tone="neutral" className="py-2 px-3 text-[14px]">
              Closed
            </Tag>
          ) : daysLeft && daysLeft < 10 ? (
            <Tag
              tone="warning"
              className="py-2 px-3 text-[14px]"
            >{`Closes in ${daysLeft} ${daysLeft > 1 ? "days" : "day"}`}</Tag>
          ) : (
            <Tag tone="success" className="py-2 px-3 text-[14px]">
              Open
            </Tag>
          )}
        </div>

        <div className="flex flex-col gap-1 mb-10">
          <h1 className="font-semibold text-[36px] leading-[100%] tracking-tight">
            {opportunity.title}
          </h1>
          <p className="text-[18px] font-medium leading-[100%] text-grey-500">
            {subtitles.length > 0 &&
              subtitles.map((each, idx) => (idx === 0 ? each : ` · ${each}`))}
          </p>
        </div>
      </div>

      {opportunity.status === "Open" ? (
        <ApplicationOpen opportunity={opportunity} />
      ) : (
        <ApplicationClosed
          requirement={opportunity.requirements}
          deadline={opportunity.deadline}
        />
      )}
    </OpportunitiesFrame>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "bg-surface border border-line rounded-lg p-6 flex flex-col gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
