import OpportunitiesFrame from "./OpportunitiesFrame";
import OpportunitiesHero from "./OpportunitiesHero";
import SubNav from "./SubNav";
import Opportunities from "./Opportunities";
import { useState } from "react";
import { useOpportunities } from "../hooks/useOpportunities";
import OpportunitiesSkeleton from "./OpportunitySkeleton";
import type { OpportunityType } from "../opportunities.type";

const TYPES: ("ALL" | OpportunityType)[] = [
  "ALL",
  "INTERNSHIP",
  "JOB",
  "FELLOWSHIP",
  "HACKATHON",
  "SCHOLARSHIP",
  "PROGRAMME",
];

export default function OpportunitiesPage() {
  const [activeType, setActiveType] = useState<"ALL" | OpportunityType>("ALL");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);
  const {
    data: opportunities,
    isPending,
    isError,
    error,
  } = useOpportunities({
    ...(!searching && activeType !== "ALL" && { type: activeType }),
    ...(searching && debouncedSearch.trim() && { search: debouncedSearch }),
  });

  if (isError) throw error;

  return (
    <OpportunitiesFrame>
      <OpportunitiesHero
        setSearching={setSearching}
        setDebouncedSearch={setDebouncedSearch}
      />
      <SubNav
        setSearching={setSearching}
        searching={searching}
        types={TYPES}
        active={activeType}
        setActive={setActiveType}
      />

      {isPending ? (
        <OpportunitiesSkeleton />
      ) : (
        <Opportunities opportunities={opportunities} />
      )}
    </OpportunitiesFrame>
  );
}
