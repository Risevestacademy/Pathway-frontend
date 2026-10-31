import CareerFolderStack from "./CareerFolderStack";
import DownloadCtaSection from "./DownloadCtaSection";
import FaqSection from "./FaqSection";
import HeroSection from "./HeroSection";
import HowItWorksSection from "./HowItWorksSection";
import PublicPageLayout from "./PublicPageLayout";
import StickerCardsSection from "./StickerCardsSection";

export default function LandingPage() {
  return (
    <PublicPageLayout>
      <HeroSection />
      <StickerCardsSection />
      <HowItWorksSection />
      <CareerFolderStack />
      <FaqSection />
      <DownloadCtaSection />
    </PublicPageLayout>
  );
}
