export function isInternalPath(value: string | undefined) {
  if (!value || value.startsWith("//")) {
    return false;
  }

  try {
    const url = new URL(value, window.location.origin);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

export function normalizeRedirect(value: string | undefined = "") {
  if (!isInternalPath(value)) {
    return "/";
  }

  const url = new URL(value, window.location.origin);
  return `${url.pathname}${url.search}${url.hash}`;
}
