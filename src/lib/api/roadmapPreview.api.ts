const PREFIX = "pathway.roadmap-preview.v1.";
const LATENCY_MS = import.meta.env.MODE === "test" ? 0 : 300;
const memory = new Map<string, string>();

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key) ?? memory.get(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}

function write(key: string, value: string): void {
  memory.set(key, value);
  try {
    window.localStorage.setItem(key, value);
  } catch {
    return;
  }
}

async function wait(): Promise<void> {
  if (LATENCY_MS === 0) return;
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
}

type Stored = Record<string, number[]>;

function readAll(userId: string): Stored {
  const raw = read(PREFIX + userId);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Stored;
  } catch {
    return {};
  }
}

export async function fetchCompletedSteps(userId: string, careerId: string): Promise<number[]> {
  await wait();
  return readAll(userId)[careerId] ?? [];
}

export async function setStepComplete(
  userId: string,
  careerId: string,
  stepOrder: number,
  complete: boolean,
): Promise<number[]> {
  await wait();
  const all = readAll(userId);
  const current = new Set(all[careerId] ?? []);
  if (complete) current.add(stepOrder);
  else current.delete(stepOrder);
  const next = [...current].sort((a, b) => a - b);
  write(PREFIX + userId, JSON.stringify({ ...all, [careerId]: next }));
  return next;
}
