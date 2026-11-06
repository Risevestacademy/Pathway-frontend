import type { Opportunity } from "../opportunities.type";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { getDaysLeft } from "../opportunities.util";

export default function OpportunityCard({
  opportunity,
}: {
  opportunity: Opportunity;
}) {
  const navigate = useNavigate();
  const subtitles = [
    opportunity.organisation,
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
    <div className="rounded-2xl border p-6 border-grey-100">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between pb-3">
          <div className="w-10 h-10 flex justify-center items-center border-[0.36px] rounded-[10px] p-2">
            {<opportunity.icon className="stroke-grey-500 w-5 h-5" />}
          </div>

          {opportunity.status === "Closed" ? (
            <Tag tone="neutral">Closed</Tag>
          ) : daysLeft && daysLeft < 10 ? (
            <Tag tone="warning">{`Closes in ${daysLeft} ${daysLeft > 1 ? "days" : "day"}`}</Tag>
          ) : (
            <Tag tone="success">Open</Tag>
          )}
        </div>

        <div>
          <p className="pb-2 text-grey-500 text-[12px] tracking-tight">
            {opportunity.category}
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
          {opportunity.description}
        </p>

        <div className="h-px bg-grey-100" />

        <div className="flex justify-between items-center">
          <p className="text-grey-500 font-medium text-[12px] leading-5">
            {opportunity.customMessage}
          </p>
          <Button className="p-2" onClick={handleButtonClick}>
            <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
