import { Tag } from "@/components/ui/Tag";
import { Briefcase } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ListFilter, Search } from "lucide-react";

export default function OpportunitiesHero() {
  return (
    <section
      aria-labelledby="opportunities-hero"
      className="overflow-hidden flex items-end gap-3 rounded-2xl border border-grey-100 bg-surface bg-linear-to-r from-surface via-surface to-[rgba(230,250,240,1)] p-6 sm:p-10 lg:min-h-55 lg:justify-between"
    >
      <div>
        <Tag tone="warning" className="gap-1">
          <Briefcase className="h-5 w-5" />
          <span className="text-sm font-normal">Find your next step</span>
        </Tag>

        <div className="mt-4 flex flex-col gap-1">
          <h1 className="font-display text-4xl leading-11 font-semibold text-ink lg:text-[2.5rem]">
            Opportunities
          </h1>
          <p className="max-w-[65ch] text-base leading-5 text-grey-600">
            Openings that fit your path. Verified opportunities.
          </p>
        </div>
      </div>

      <div className="max-w-[650px] w-full flex gap-3 items-center">
        <div className="w-full py-4.5 px-6 rounded-[14px] border border-grey-100 bg-surface shadow-sm">
          <form className="flex gap-2 items-center">
            <Search className="w-6 h-6 stroke-grey-400 stroke-grey-500" />
            <input
              type="text"
              name="search"
              placeholder="Search openings..."
              className="flex-1 outline-none bg-transparent text-base leading-5 text-grey-900 placeholder:text-grey-500"
            />
          </form>
        </div>
        <Button className="flex gap-2 items-center text-base leading-6 py-4.5 px-6 rounded-[14px]">
          {" "}
          <ListFilter className="w-4 h-4" /> <span>Filter</span>
        </Button>
      </div>
    </section>
  );
}
