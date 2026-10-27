import { useEffect, useState } from "react";

/** Seconds to wait between verification codes. */
export const RESEND_COOLDOWN_SECONDS = 30;

/**
 * Shared by every "Resend code" control, so a code sent from the login page
 * also holds back the resend button on the verify page. Kept in sessionStorage.
 */
const KEY = "pathway.resendCooldownUntil";

function readUntil(): number {
  try {
    return Number(sessionStorage.getItem(KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeUntil(until: number): void {
  try {
    sessionStorage.setItem(KEY, String(until));
  } catch {
    // Storage can be blocked; the wait then only lasts for this page.
  }
}

export function useResendCooldown(seconds = RESEND_COOLDOWN_SECONDS) {
  const [until, setUntil] = useState(readUntil);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (until <= Date.now()) return;
    const id = setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= until) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [until]);

  /** Seconds left before another code can be requested; 0 when free. */
  const remaining = Math.max(0, Math.ceil((until - now) / 1000));

  const start = () => {
    const next = Date.now() + seconds * 1000;
    writeUntil(next);
    setUntil(next);
    setNow(Date.now());
  };

  return { remaining, start };
}
