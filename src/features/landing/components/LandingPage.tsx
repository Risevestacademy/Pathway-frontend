import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ensureAuthHydrated } from "../../../lib/api/auth.api";
import { selectIsAuthenticated, useAuthStore } from "../../../lib/stores/authStore";
import HeroSection from "./HeroSection";
import LandingFooter from "./LandingFooter";
import LandingNav from "./LandingNav";

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
      </main>
      <LandingFooter />
    </div>
  );
}
