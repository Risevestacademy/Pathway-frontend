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
  const {
    data: opportunities,
    isPending,
    isError,
    error,
  } = useOpportunities({
    ...(activeType !== "ALL" && { type: activeType }),
  });

  if (isError) throw error;

  return (
    <OpportunitiesFrame>
      <OpportunitiesHero />
      <SubNav types={TYPES} active={activeType} setActive={setActiveType} />

      {isPending ? (
        <OpportunitiesSkeleton />
      ) : (
        <Opportunities opportunities={opportunities} />
      )}
    </OpportunitiesFrame>
  );
}
