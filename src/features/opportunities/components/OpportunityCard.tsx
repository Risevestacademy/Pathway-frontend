import type { OpportunitySummary } from "../opportunities.type";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { getDaysLeft } from "../opportunities.util";
import OpportunityIcon from "./OpportunityIcon";

export default function OpportunityCard({
  opportunity,
}: {
  opportunity: OpportunitySummary;
}) {
  const navigate = useNavigate();
  const subtitles = [
    opportunity.organization,
    opportunity.location,
    opportunity.workMode,
    opportunity.deliveryMode,
  ].filter(Boolean);

  let daysLeft;

  if (opportunity.deadline) daysLeft = getDaysLeft(opportunity.deadline);

  const handleButtonClick = () => {
    navigate({
      to: "/opportunities/$opportunitiesId",
      params: { opportunitiesId: opportunity.id },
    });
  };

  return (
    <div className="h-full rounded-2xl border p-6 border-grey-100">
      <div className="h-full flex flex-col gap-4">
        <div className="flex justify-between pb-3">
          <div className="w-10 h-10 flex justify-center items-center border-[0.36px] rounded-[10px] p-2">
            <OpportunityIcon
              type={opportunity.type}
              className="stroke-grey-500 w-5 h-5"
            />
          </div>

          {opportunity.status === "CLOSED" ? (
            <Tag tone="neutral">Closed</Tag>
          ) : daysLeft && daysLeft < 10 ? (
            <Tag tone="warning">{`Closes in ${daysLeft} ${daysLeft > 1 ? "days" : "day"}`}</Tag>
          ) : (
            <Tag tone="success">Open</Tag>
          )}
        </div>

        <div>
          <p className="pb-2 text-grey-500 text-[12px] tracking-tight">
            {opportunity.type}
          </p>
          <h3 className="pb-1 text-[18px] font-medium leading-[120%] tracking-tight">
            {opportunity.title}
          </h3>
          <p className="text-[14px] font-normal leading-[120%] text-grey-500">
            {subtitles.length > 0 &&
              subtitles.map((each, idx) => (idx === 0 ? each : ` · ${each}`))}
          </p>
        </div>
        <p className="leading-5 tracking-tight text-grey-500">
          {opportunity.summary}
        </p>

        <div className="mt-auto flex flex-col gap-4">
          <div className="h-px bg-grey-100" />
          {opportunity.customMessage ? (
            <div className="flex justify-between items-center">
              <p className="text-grey-500 font-medium text-[12px] leading-5">
                {opportunity.customMessage}
              </p>
              <Button className="p-2" onClick={handleButtonClick}>
                <ArrowRight />
              </Button>
            </div>
          ) : (
            <div className="flex justify-end items-center">
              <Button className="p-2" onClick={handleButtonClick}>
                <ArrowRight />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
