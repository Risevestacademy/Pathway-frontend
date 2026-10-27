import { container } from "@/features/landing/landing.styles";
import { LandingLinkButton } from "@/features/landing/components/LandingButton";
import PromoCard from "@/features/landing/components/PromoCard";
import { PATHWAY_CTA } from "../explore.copy";

/** "Not sure which career fits you?" card at the foot of the explore pages; starts onboarding. */
export default function PathwayCtaSection() {
  return (
    <section aria-labelledby="pathway-cta-heading" className="pt-[100px]">
      <div className={container}>
        <PromoCard
          headingId="pathway-cta-heading"
          heading={PATHWAY_CTA.heading}
          subtitle={PATHWAY_CTA.subtitle}
          actions={<LandingLinkButton to="/careers/onboarding">{PATHWAY_CTA.action}</LandingLinkButton>}
        />
      </div>
    </section>
  );
}
