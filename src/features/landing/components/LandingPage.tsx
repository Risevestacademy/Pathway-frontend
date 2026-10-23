import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ensureAuthHydrated } from "../../../lib/api/auth.api";
import { selectIsAuthenticated, useAuthStore } from "../../../lib/stores/authStore";
import CareerFolderStack from "./CareerFolderStack";
import DownloadCtaSection from "./DownloadCtaSection";
import FaqSection from "./FaqSection";
import HeroSection from "./HeroSection";
import HowItWorksSection from "./HowItWorksSection";
import LandingFooter from "./LandingFooter";
import LandingNav from "./LandingNav";
import StickerCardsSection from "./StickerCardsSection";

/**
 * Public landing page at `/`. Owns the landing type system, the sticky nav
 * and the signed-in redirect; each section is its own component.
 */
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
    <div className="min-h-svh bg-white font-landing-body text-ink antialiased">
      <LandingNav />
      <main>
        <HeroSection />
        <StickerCardsSection />
        <HowItWorksSection />
        <CareerFolderStack />
        <FaqSection />
        <DownloadCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
