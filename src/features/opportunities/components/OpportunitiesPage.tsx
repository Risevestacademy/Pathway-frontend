import OpportunitiesFrame from "./OpportunitiesFrame";
import OpportunitiesHero from "./OpportunitiesHero";
import SubNav from "./SubNav";
import Opportunities from "./Opportunities";
import { useState } from "react";
import { opportunities } from "../opportunities.data";

const CATEGORIES = ["All", "Pathway"].concat(
  ...new Set(opportunities.map((opportunity) => opportunity.category)),
);

export default function OpportunitiesPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <OpportunitiesFrame>
      <OpportunitiesHero />
      <SubNav
        categories={CATEGORIES}
        active={activeCategory}
        setActive={setActiveCategory}
      />
      <Opportunities
        opportunities={opportunities.filter((value) =>
          activeCategory !== "All" ? value.category === activeCategory : true,
        )}
      />
      <div>Opportunities</div>
    </OpportunitiesFrame>
  );
}
