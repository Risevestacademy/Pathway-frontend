import OpportunitiesFrame from "./OpportunitiesFrame";
import { BackLinkTo } from "@/features/skillCheck/components/BackLink";
import { Tag } from "@/components/ui/Tag";
import { getDaysLeft } from "../opportunities.util";
import { cn } from "cn";
import ApplicationClosed from "./ApplicationClosed";
import ApplicationOpen from "./ApplicationOpen";
import { getRouteApi } from "@tanstack/react-router";

export default function OpportunityPage() {
  const routeApi = getRouteApi("/_protected/opportunities/$opportunitiesId/");
  const opportunity = routeApi.useLoaderData();
  let daysLeft;

  if (opportunity.deadline) daysLeft = getDaysLeft(opportunity.deadline);

  const subtitles = [
    opportunity.organisation,
    opportunity.location,
    // opportunity.workMode,
    // opportunity.deliveryMode,
    opportunity.duration,
  ].filter(Boolean);

  return (
    <OpportunitiesFrame>
      <BackLinkTo label="Back" to="/opportunities" />
      <div className="mt-6">
        <div className="flex gap-2 mb-4">
          <Tag tone="brand" className="py-2 px-3 text-[14px]">
            {opportunity.type.charAt(0) +
              opportunity.type.slice(1).toLowerCase()}
          </Tag>
          {opportunity.status === "CLOSED" ? (
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
              {opportunity.status}
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

      {opportunity.status === "CLOSED" ? (
        <ApplicationClosed
          requirement={opportunity.responsibilities}
          deadline={opportunity.deadline}
        />
      ) : (
        <ApplicationOpen opportunity={opportunity} />
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
