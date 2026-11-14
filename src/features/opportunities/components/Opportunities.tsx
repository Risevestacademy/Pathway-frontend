import { Button } from "@/components/ui/Button";
import type { OpportunitySummary } from "../opportunities.type";
import OpportunityCard from "./OpportunityCard";
import briefcaseIcon from "@/assets/icons/briefcase-icon.svg";

export default function Opportunities({
  opportunities,
}: {
  opportunities: OpportunitySummary[];
}) {
  return (
    <section>
      {opportunities.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map((each) => (
            <OpportunityCard key={each.id} opportunity={each} />
          ))}
        </div>
      ) : (
        <div className="py-15 px-8 flex items-center justify-center rounded-3xl border border-grey-100">
          <div className="max-w-max text-center flex flex-col gap-6">
            <div className="flex flex-col gap-3 items-center">
              <img
                src={briefcaseIcon}
                alt=""
                draggable={false}
                aria-hidden
                className="pointer-events-none w-20 h-20"
              />
              <h2 className="text-[24px] font-medium leading-6">
                No opportunities match your selection
              </h2>
              <p className="text-grey-600 max-w-97.25">
                We add listings as employers confirm them. Finish a few more
                topics and we will show roles that fit.
              </p>
            </div>
            <Button className="w-full" disabled>
              Get notified of new roles (coming soon)
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
