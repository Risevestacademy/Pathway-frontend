export function isInternalPath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return false;
  }

  try {
    const url = new URL(value, window.location.origin);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}
