import { cn } from "cn";
import type { OpportunityType } from "../opportunities.type";

export default function SubNav({
  types,
  active = "ALL",
  setActive,
  setSearching,
  // search,
  searching,
}: {
  types: ("ALL" | OpportunityType)[];
  active: string;
  setActive: (category: "ALL" | OpportunityType) => void;
  setSearching: (bool: boolean) => void;
  searching: boolean;
}) {
  return (
    <div className="flex gap-1.5 pt-8 pb-10 overflow-x-scroll scrollbar-none">
      {types.map((type, idx) => (
        <button
          type="button"
          aria-pressed={!searching && active === type}
          key={idx}
          tabIndex={0}
          className={cn(
            "py-2 px-3 border rounded-md border-grey-50 hover:bg-brand-50 cursor-pointer font-medium text-base tracking-tight text-grey-500",
            "transition duration-300",
            !searching &&
              active === type &&
              "bg-brand-100 hover:bg-brand-100 text-brand-700",
          )}
          onClick={() => {
            setActive(type);
            setSearching(false);
          }}
        >
          {type.charAt(0) + type.slice(1).toLowerCase()}
        </button>
      ))}
    </div>
  );
}
