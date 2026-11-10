import { Card } from "./OpportunityPage";
import type { Opportunity } from "../opportunities.type";
import { Button } from "@/components/ui/Button";
import { Bookmark } from "lucide-react";
import { getDaysLeft, formatDate } from "../opportunities.util";

export default function ApplicationOpen({
  opportunity,
}: {
  opportunity: Opportunity;
}) {
  let daysLeft;

  if (opportunity.deadline) daysLeft = getDaysLeft(opportunity.deadline);

  return (
    <div className="flex flex-col gap-10 lg:flex-row">
      <div className="flex-1 flex flex-col gap-4">
        <Card className="rounded-3xl">
          <h3 className="text-[20px] font-medium leading-[100%]">
            What you will do
          </h3>
          <Card className="rounded-[16px]">
            <ul className="flex flex-col gap-3">
              {opportunity.responsibilities.map((each, idx) => (
                <ListItem text={each} idx={idx} />
              ))}
            </ul>
          </Card>
        </Card>

        {/* <Card className="rounded-3xl">
          <h3 className="text-[20px] font-medium leading-[100%]">
            Who it is for
          </h3>
          <Card className="rounded-[16px]">
            <ul className="flex flex-col gap-3">
              {opportunity.whoIsItFor.map((each, idx) => (
                <ListItem key={idx} text={each} idx={idx} />
              ))}
            </ul>
          </Card>
        </Card> */}

        <Card className="rounded-3xl">
          <h3 className="text-[20px] font-medium leading-[100%]">
            Pay and dates
          </h3>
          <Card className="rounded-[16px] gap-2.5">
            <p className="font-medium text-body-md leading-[100%] text-[rgba(71,71,71,1)]">
              {opportunity.pay}
            </p>
            <p className="font-normal leading-[100%] text-[rgba(118,118,118,1)]">
              Start: {formatDate(opportunity.startDate)}
            </p>
          </Card>
        </Card>
      </div>

      <aside className=" lg:max-w-87.5 xl:max-w-112.5 flex flex-col gap-4">
        <Card className="border-brand-200 bg-brand-100 p-8 flex flex-col gap-5 rounded-3xl">
          <h3 className="font-semibold text-[28px] leading-[100%] tracking-tight">
            Skills
          </h3>
          {/* <p className="text-[16px] leading-[24px]">
            {opportunity.howItFits.desc}
          </p> */}
          <p className="flex gap-2 flex-wrap">
            {opportunity.skills.map((each, idx) => (
              <span
                className="px-3 py-2 border rounded-full bg-white border-brand-100 text-grey-500 text-[14px] font-normal"
                key={idx}
              >
                {each.name}
              </span>
            ))}
          </p>

          <Button>Apply</Button>

          {daysLeft === 0 ||
            (daysLeft && (
              <p className="text-[rgba(118,118,118,1)] text-center">
                Application closes in {daysLeft} {daysLeft > 1 ? "days" : "day"}
              </p>
            ))}
        </Card>

        <Button
          isPrimary={false}
          className="flex gap-2 text-body-md leading-5 text-grey-500"
        >
          {" "}
          <Bookmark className="w-4 h-4 stroke-grey-300" />{" "}
          <span>Save for later</span>
        </Button>
      </aside>
    </div>
  );
}

function ListItem({ text, idx }: { text: string; idx: number }) {
  return (
    <li className="flex items-center gap-3">
      <span className="rounded-md border p-2 w-7 h-7 border-brand-200 bg-brand-100 leading-[100%] text-center flex justify-center items-center text-brand-500">
        {idx + 1}
      </span>
      <p className="text-body-md leading-6 font-medium text-[rgba(71,71,71,1)]">
        {text}
      </p>
    </li>
  );
}
