/**
 * Keeps one-time tokens out of what Sentry and PostHog record. Links such as
 * /accept-invite?token=… put the secret in the URL, and both tools capture the
 * page URL, referrers and navigation history on their own.
 */
const REDACTED = "[redacted]";

// token=… in a URL, a query string or a fragment.
const PLAIN = /(^|[?&#;])(token)=[^&#\s"']*/gi;
// The same inside an encoded value, e.g. /login?redirect=%2Faccept-invite%3Ftoken%3Dabc.
const ENCODED = /(%3F|%26|%23)(token)%3D(?:(?!%26|%23)[^&#\s"'])*/gi;

export function redactString(value: string): string {
  return value.replace(PLAIN, `$1$2=${REDACTED}`).replace(ENCODED, `$1$2%3D${REDACTED}`);
}

const MAX_DEPTH = 12;

/** A copy of `value` with every string scrubbed, however deep it sits. */
export function redactDeep<T>(value: T, depth = 0): T {
  if (typeof value === "string") return redactString(value) as T;
  if (depth >= MAX_DEPTH || value === null || typeof value !== "object") return value;

  if (Array.isArray(value)) {
    return value.map((item) => redactDeep(item, depth + 1)) as T;
  }

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, redactDeep(item, depth + 1)]),
  ) as T;
}
