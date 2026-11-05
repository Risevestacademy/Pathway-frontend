import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { playStepCompleteSound } from "./stepCompleteSound";

interface Note {
  frequency: number;
  startedAt: number | null;
  stoppedAt: number | null;
  connectedTo: unknown;
}

let notes: Note[];
let contexts: FakeAudioContext[];

class FakeAudioContext {
  currentTime = 10;
  state: "running" | "suspended" = "running";
  destination = { name: "speakers" };
  closed = false;
  resumed = false;

  constructor() {
    contexts.push(this);
  }

  resume() {
    this.resumed = true;
    this.state = "running";
    return Promise.resolve();
  }

  close() {
    this.closed = true;
    return Promise.resolve();
  }

  createGain() {
    return {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
  }

  createOscillator() {
    const note: Note = { frequency: 0, startedAt: null, stoppedAt: null, connectedTo: null };
    notes.push(note);
    return {
      type: "sine",
      frequency: {
        set value(v: number) {
          note.frequency = v;
        },
      },
      connect: (target: unknown) => {
        note.connectedTo = target;
      },
      start: (at: number) => {
        note.startedAt = at;
      },
      stop: (at: number) => {
        note.stoppedAt = at;
      },
    };
  }
}

beforeEach(() => {
  notes = [];
  contexts = [];
  vi.useFakeTimers();
  vi.stubGlobal("AudioContext", FakeAudioContext);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("playStepCompleteSound", () => {
  it("plays a short rising three-note chime", () => {
    expect(playStepCompleteSound()).toBe(true);

    expect(notes).toHaveLength(3);
    const frequencies = notes.map((note) => note.frequency);
    expect(frequencies).toEqual([...frequencies].sort((a, b) => a - b));
    expect(new Set(frequencies).size).toBe(3);
  });

  it("starts each note after the one before, and stops it again", () => {
    playStepCompleteSound();

    const starts = notes.map((note) => note.startedAt as number);
    expect(starts).toEqual([...starts].sort((a, b) => a - b));
    expect(new Set(starts).size).toBe(3);
    for (const note of notes) {
      expect(note.stoppedAt).toBeGreaterThan(note.startedAt as number);
    }
  });

  it("is over in about a second", () => {
    playStepCompleteSound();

    const last = Math.max(...notes.map((note) => note.stoppedAt as number));
    expect(last - 10).toBeLessThan(1.5);
  });

  it("wakes the audio up if the browser left it suspended", () => {
    vi.stubGlobal(
      "AudioContext",
      class extends FakeAudioContext {
        state: "running" | "suspended" = "suspended";
      },
    );

    playStepCompleteSound();

    expect(contexts[0].resumed).toBe(true);
  });

  it("lets go of the audio once the chime has finished", () => {
    playStepCompleteSound();
    expect(contexts[0].closed).toBe(false);

    vi.advanceTimersByTime(3000);

    expect(contexts[0].closed).toBe(true);
  });

  it("does nothing, without failing, when the browser has no audio", () => {
    vi.stubGlobal("AudioContext", undefined);

    expect(playStepCompleteSound()).toBe(false);
  });

  it("does nothing, without failing, when the browser won't start audio", () => {
    vi.stubGlobal(
      "AudioContext",
      class {
        constructor() {
          throw new Error("not allowed");
        }
      },
    );

    expect(playStepCompleteSound()).toBe(false);
  });
});
