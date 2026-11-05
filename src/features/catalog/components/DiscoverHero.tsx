import { LinkButton } from "../../../components/ui/Button";
import { PathwayHero } from "@/components/PathwayHero";

export function DiscoverHero() {
  return (
    <PathwayHero
      headingId="discover-heading"
      title="Discover Pathways"
      description={
        "Structured career lanes - frontend, data, design and more. Open one to see what the work involves, pay, outlook and a step-by-step roadmap."
      }
    >
      <LinkButton to="/careers/compare" size="lg" className="mt-6">
        Compare careers
      </LinkButton>
    </PathwayHero>
  );
}