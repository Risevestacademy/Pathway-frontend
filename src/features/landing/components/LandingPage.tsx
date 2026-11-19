import CareerFolderStack from "./CareerFolderStack";
import DownloadCtaSection from "./DownloadCtaSection";
import FaqSection from "./FaqSection";
import HeroSection from "./HeroSection";
import HowItWorksSection from "./HowItWorksSection";
import PublicPageLayout from "./PublicPageLayout";
import FeatureCardsSection from "./FeatureCardsSection";

export default function LandingPage() {
  return (
    <PublicPageLayout>
      <HeroSection />
      <FeatureCardsSection />
      <HowItWorksSection />
      <CareerFolderStack />
      <FaqSection />
      <DownloadCtaSection />
    </PublicPageLayout>
  );
}
