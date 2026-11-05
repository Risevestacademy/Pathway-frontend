/**
 * Which resources a person has ticked as done. The backend only tracks whole
 * steps, so these ticks are saved in this browser alone, one list for each
 * person and career. If the browser won't save them they last for the session.
 */

const PREFIX = "pathway.resource-ticks.v1.";

// What this tab last wrote, so a tick survives a browser that won't save.
const memory = new Map<string, string[]>();
const listeners = new Set<() => void>();

export const resourceTicksKey = (userId: string, careerId: string) =>
  `${PREFIX}${userId}.${careerId}`;

function parse(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

/** The ids of the resources ticked under this key. */
export function readTicks(key: string): string[] {
  const remembered = memory.get(key);
  if (remembered) return remembered;
  try {
    return parse(window.localStorage.getItem(key));
  } catch {
    return [];
  }
}

const notify = () => listeners.forEach((listener) => listener());

/** Ticks the resource, or unticks it if it was ticked. */
export function toggleTick(key: string, resourceId: string): void {
  const current = readTicks(key);
  const next = current.includes(resourceId)
    ? current.filter((id) => id !== resourceId)
    : [...current, resourceId];

  memory.set(key, next);
  try {
    window.localStorage.setItem(key, JSON.stringify(next));
  } catch {
    // Not saved, but still ticked for this session.
  }
  notify();
}

/** Calls the listener whenever a tick changes, here or in another tab. Returns a way to stop. */
export function subscribeResourceTicks(listener: () => void): () => void {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    // Another tab wrote, so what it saved is newer than what this tab remembers.
    if (event.key) memory.delete(event.key);
    listener();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** For tests: forget what this tab remembers. */
export function resetResourceTicksMemory(): void {
  memory.clear();
}
