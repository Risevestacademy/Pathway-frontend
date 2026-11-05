/**
 * Which resources a person has ticked as done. The backend only tracks whole
 * steps, so these ticks are saved in this browser alone, one list for each
 * person and career. If the browser won't save them they last for the session.
 */

const PREFIX = "pathway.resource-ticks.v1.";

// What this tab last wrote, so a tick survives a browser that won't save.
const memory = new Map<string, string[]>();
// Per key, the resources whose latest change the browser refused to save, the latest last.
const unsaved = new Map<string, string[]>();
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

/** Writes the ticks to the browser. False when the browser won't take them. */
function save(key: string, ticks: string[]): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(ticks));
    return true;
  } catch {
    return false;
  }
}

/** Ticks the resource, or unticks it if it was ticked. */
export function toggleTick(key: string, resourceId: string): void {
  const current = readTicks(key);
  const next = current.includes(resourceId)
    ? current.filter((id) => id !== resourceId)
    : [...current, resourceId];

  memory.set(key, next);
  if (save(key, next)) {
    // Saving writes every tick, so anything left over from before is saved too.
    unsaved.delete(key);
  } else {
    // Still ticked for this session, but not saved.
    unsaved.set(key, [...(unsaved.get(key) ?? []).filter((id) => id !== resourceId), resourceId]);
  }
  notify();
}

/** The resources whose latest change isn't saved in the browser, the most recent last. */
export function readUnsaved(key: string): string[] {
  return unsaved.get(key) ?? [];
}

/** Tries again to save the ticks. True once they are saved. */
export function retrySave(key: string): boolean {
  if (!unsaved.has(key)) return true;
  if (!save(key, readTicks(key))) return false;

  unsaved.delete(key);
  notify();
  return true;
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
  unsaved.clear();
}
