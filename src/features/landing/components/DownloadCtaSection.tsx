import { DOWNLOAD_CTA } from "../landing.copy";
import { container } from "../landing.styles";
import { LandingComingSoonButton } from "./LandingButton";
import PromoCard from "./PromoCard";
import appleLogo from "@/assets/landing/apple-logo.svg";
import googlePlayLogo from "@/assets/landing/google-play-logo.svg";

export default function DownloadCtaSection() {
  return (
    <section aria-labelledby="landing-cta-heading" className="bg-white pt-[110px]">
      <div className={container}>
        <PromoCard
          headingId="landing-cta-heading"
          heading={DOWNLOAD_CTA.heading}
          subtitle={DOWNLOAD_CTA.subtitle}
          actions={
            <>
              <LandingComingSoonButton>
                <img src={appleLogo} alt="" aria-hidden className="size-5" />
                {DOWNLOAD_CTA.ios}
              </LandingComingSoonButton>
              <LandingComingSoonButton variant="secondary" className="text-brand-500">
                <img src={googlePlayLogo} alt="" aria-hidden className="size-5" />
                {DOWNLOAD_CTA.android}
              </LandingComingSoonButton>
            </>
          }
        />
      </div>
    </section>
  );
}
