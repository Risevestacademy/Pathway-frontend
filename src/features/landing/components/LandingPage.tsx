import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ensureAuthHydrated } from "../../../lib/api/auth.api";
import { selectIsAuthenticated, useAuthStore } from "../../../lib/stores/authStore";
import { HERO } from "../landing.copy";

/**
 * Public landing page at `/`. Sections land in later commits; this is the
 * frame that owns the fonts, background and the signed-in redirect.
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
      <main>
        <section className="mx-auto max-w-[1064px] px-page-mobile py-24 text-center">
          <h1 className="font-landing-display text-5xl font-bold tracking-tight">
            {HERO.headingStart} {HERO.headingEnd}
          </h1>
          <p className="mx-auto mt-6 max-w-[48ch] text-lg text-grey-500">{HERO.subtitle}</p>
        </section>
      </main>
    </div>
  );
}
