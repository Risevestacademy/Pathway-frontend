const STORAGE_PREFIX = "pending-email-change:";
const CODE_LIFETIME_MS = 10 * 60 * 1000;

interface PendingEmailChange {
  email: string;
  expiresAt: number;
}

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`;
}

export function savePendingEmailChange(userId: string, email: string) {
  const value: PendingEmailChange = {
    email,
    expiresAt: Date.now() + CODE_LIFETIME_MS,
  };
  sessionStorage.setItem(storageKey(userId), JSON.stringify(value));
}

export function getPendingEmailChange(userId: string): string | null {
  const key = storageKey(userId);
  const stored = sessionStorage.getItem(key);
  if (!stored) return null;

  try {
    const value = JSON.parse(stored) as PendingEmailChange;
    if (
      typeof value.email !== "string" ||
      typeof value.expiresAt !== "number" ||
      value.expiresAt <= Date.now()
    ) {
      sessionStorage.removeItem(key);
      return null;
    }
    return value.email;
  } catch {
    sessionStorage.removeItem(key);
    return null;
  }
}

export function clearPendingEmailChange(userId: string) {
  sessionStorage.removeItem(storageKey(userId));
}
