import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ensureAuthHydrated } from "../../../lib/api/auth.api";
import { selectIsAuthenticated, useAuthStore } from "../../../lib/stores/authStore";
import CareerFolderStack from "./CareerFolderStack";
import DownloadCtaSection from "./DownloadCtaSection";
import FaqSection from "./FaqSection";
import HeroSection from "./HeroSection";
import HowItWorksSection from "./HowItWorksSection";
import PublicPageLayout from "./PublicPageLayout";
import StickerCardsSection from "./StickerCardsSection";

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    void ensureAuthHydrated().then(() => {
      if (!cancelled && selectIsAuthenticated(useAuthStore.getState())) {
        void navigate({ to: "/careers", replace: true });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

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
