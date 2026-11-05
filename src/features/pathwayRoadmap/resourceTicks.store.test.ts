import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  readTicks,
  resetResourceTicksMemory,
  resourceTicksKey,
  subscribeResourceTicks,
  toggleTick,
} from "./resourceTicks.store";

beforeEach(() => {
  window.localStorage.clear();
  resetResourceTicksMemory();
});

afterEach(() => {
  vi.restoreAllMocks();
});

const key = resourceTicksKey("u1", "c1");

describe("resourceTicksKey", () => {
  it("is different for each person and each career", () => {
    expect(resourceTicksKey("u1", "c1")).not.toBe(resourceTicksKey("u2", "c1"));
    expect(resourceTicksKey("u1", "c1")).not.toBe(resourceTicksKey("u1", "c2"));
  });
});

describe("readTicks", () => {
  it("is empty when nothing has been ticked", () => {
    expect(readTicks(key)).toEqual([]);
  });

  it("ignores saved data that isn't a list of ids", () => {
    window.localStorage.setItem(key, "{not json");
    expect(readTicks(key)).toEqual([]);

    window.localStorage.setItem(key, JSON.stringify({ a: 1 }));
    expect(readTicks(key)).toEqual([]);

    window.localStorage.setItem(key, JSON.stringify(["a", 2, null, "b"]));
    expect(readTicks(key)).toEqual(["a", "b"]);
  });
});

describe("toggleTick", () => {
  it("ticks a resource, then unticks it", () => {
    toggleTick(key, "r1");
    expect(readTicks(key)).toEqual(["r1"]);

    toggleTick(key, "r1");
    expect(readTicks(key)).toEqual([]);
  });

  it("keeps the other ticks", () => {
    toggleTick(key, "r1");
    toggleTick(key, "r2");
    toggleTick(key, "r1");

    expect(readTicks(key)).toEqual(["r2"]);
  });

  it("keeps each person's and each career's ticks apart", () => {
    toggleTick(resourceTicksKey("u1", "c1"), "r1");

    expect(readTicks(resourceTicksKey("u2", "c1"))).toEqual([]);
    expect(readTicks(resourceTicksKey("u1", "c2"))).toEqual([]);
  });

  it("survives a reload, because it is saved in the browser", () => {
    toggleTick(key, "r1");

    expect(JSON.parse(window.localStorage.getItem(key) ?? "[]")).toEqual(["r1"]);
  });

  it("still works for the session when the browser won't save", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    toggleTick(key, "r1");

    expect(readTicks(key)).toEqual(["r1"]);
  });
});

describe("subscribeResourceTicks", () => {
  it("tells listeners when a tick changes, until they stop listening", () => {
    const listener = vi.fn();
    const stop = subscribeResourceTicks(listener);

    toggleTick(key, "r1");
    expect(listener).toHaveBeenCalledTimes(1);

    stop();
    toggleTick(key, "r2");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("tells listeners when another tab changes the ticks", () => {
    const listener = vi.fn();
    const stop = subscribeResourceTicks(listener);

    window.dispatchEvent(new StorageEvent("storage", { key }));

    expect(listener).toHaveBeenCalledTimes(1);
    stop();
  });
});
