import { Card } from "./OpportunityPage";
import { Button } from "@/components/ui/Button";
import type { Requirement } from "../opportunities.type";
import { cn } from "cn";

export default function ApplicationClosed({
  requirement,
  deadline,
}: {
  requirement: Requirement[];
  deadline?: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-38.25 rounded-2xl p-6 flex gap-3.5 bg-[rgba(245,235,235,1)]">
        <span className="w-7 h-7 flex items-center justify-center rounded-full bg-danger-700 font-semibold leading-5 text-white">
          !
        </span>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p className="font-medium text-body-md leading-5 tracking-tight">
              Application closed{deadline ? ` on ${deadline}.` : "."}
            </p>
            <p className="font-normal text-body-md tracking-tight leading-5">
              We kept this page so you can see what they asked for. We will add
              similar roles when they open.
            </p>
          </div>
          <div className="flex gap-3">
            <Button>See similar roles</Button>
            <Button isPrimary={false}>Get notified of new roles</Button>
          </div>
        </div>
      </div>

      <Card className="rounded-3xl">
        <h3 className="text-[20px] font-medium leading-[100%]">
          What they asked for
        </h3>

        <Card className="rounded-[16px] p-0">
          <ul>
            {requirement.map((value, idx) => (
              <li
                key={idx}
                className={cn(
                  idx != requirement.length + 1 && "border-b border-grey-100",
                )}
              >
                <div className="flex flex-col gap-1.5 px-6 py-3.5">
                  <p className="font-medium text-body-md tracking-tight leading-5">
                    {value.name}
                  </p>
                  <p className="font-medium text-[14px] text-grey-600">
                    {value.level}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </Card>
    </div>
  );
}
