/**
 * The email awaiting verification. Kept in sessionStorage, not the URL, because
 * analytics and error monitoring capture URLs.
 */
const KEY = "pathway.pendingVerificationEmail";

export function setPendingVerificationEmail(email: string): void {
  try {
    sessionStorage.setItem(KEY, email);
  } catch {
    // Storage can be blocked; the user is sent back to sign up.
  }
}

export function getPendingVerificationEmail(): string {
  try {
    return sessionStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function clearPendingVerificationEmail(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}
