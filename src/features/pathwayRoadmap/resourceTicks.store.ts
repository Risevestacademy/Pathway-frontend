/**
 * The resource ticks that haven't been confirmed by the server yet. Whether a
 * resource is done lives on the server; this holds only what a screen should
 * show in the meantime: the tick someone just made while its save is in
 * flight, and the ticks whose save failed, so they can be named and retried.
 * One entry for each person and pathway, shared by every screen that shows ticks.
 */

// Per key, what each resource should read as until the server confirms it.
const desired = new Map<string, Record<string, boolean>>();
// Per key, the resources whose latest save failed, the latest last.
const unsaved = new Map<string, string[]>();
// Keys whose latest save was refused because the person isn't tracking this pathway.
const notTracking = new Set<string>();
// Per key and resource, the number of the latest save sent, so an older save's answer can be told apart.
const latestSave = new Map<string, number>();
const listeners = new Set<() => void>();

/** A save for this resource is being sent. Returns its number; a newer save makes it stale. */
export function beginSave(key: string, resourceId: string): number {
  const id = `${key}/${resourceId}`;
  const next = (latestSave.get(id) ?? 0) + 1;
  latestSave.set(id, next);
  return next;
}

/** Whether no newer save for this resource has been sent since this one. */
export function isLatestSave(key: string, resourceId: string, save: number): boolean {
  return latestSave.get(`${key}/${resourceId}`) === save;
}

export const resourceTicksKey = (userId: string, pathwayId: string) =>
  `${userId}.${pathwayId}`;

const notify = () => listeners.forEach((listener) => listener());

/** What each unconfirmed resource should read as: true for ticked, false for unticked. */
export function readDesired(key: string): Record<string, boolean> {
  return desired.get(key) ?? {};
}

/** The resources whose latest save failed, the most recent last. */
export function readUnsaved(key: string): string[] {
  return unsaved.get(key) ?? [];
}

/** Whether the latest save was refused because the person isn't tracking this pathway. */
export function readNotTracking(key: string): boolean {
  return notTracking.has(key);
}

/** A tick was just made and is being saved: show it as this until the server confirms. */
export function setDesired(key: string, resourceId: string, ticked: boolean): void {
  desired.set(key, { ...readDesired(key), [resourceId]: ticked });
  notTracking.delete(key);
  notify();
}

/**
 * The server refused the save because the pathway isn't tracked, so retrying
 * can't help. The tick goes back to what the server holds, and the screen can
 * say to start tracking instead of blaming the connection.
 */
export function markNotTracking(key: string, resourceId: string): void {
  const rest = { ...readDesired(key) };
  delete rest[resourceId];
  desired.set(key, rest);
  unsaved.set(key, readUnsaved(key).filter((id) => id !== resourceId));
  notTracking.add(key);
  notify();
}

/** The latest save for this resource failed. It stays as it was shown, but is named as not saved. */
export function markUnsaved(key: string, resourceId: string): void {
  unsaved.set(key, [...readUnsaved(key).filter((id) => id !== resourceId), resourceId]);
  notify();
}

/** The server confirmed this resource, so there is nothing left to show on top of it. */
export function settleTick(key: string, resourceId: string): void {
  const rest = { ...readDesired(key) };
  delete rest[resourceId];
  desired.set(key, rest);
  unsaved.set(key, readUnsaved(key).filter((id) => id !== resourceId));
  notify();
}

/** Calls the listener whenever anything changes. Returns a way to stop. */
export function subscribeResourceTicks(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** For tests: forget everything. */
export function resetResourceTicksMemory(): void {
  desired.clear();
  unsaved.clear();
  notTracking.clear();
  latestSave.clear();
}
