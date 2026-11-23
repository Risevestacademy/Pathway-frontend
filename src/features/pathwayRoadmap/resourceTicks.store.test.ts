import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  markUnsaved,
  readDesired,
  readUnsaved,
  resetResourceTicksMemory,
  resourceTicksKey,
  setDesired,
  settleTick,
  subscribeResourceTicks,
} from "./resourceTicks.store";

const key = resourceTicksKey("u1", "p1");

beforeEach(resetResourceTicksMemory);

describe("resourceTicksKey", () => {
  it("is different for each person and each pathway", () => {
    expect(resourceTicksKey("u1", "p1")).not.toBe(resourceTicksKey("u2", "p1"));
    expect(resourceTicksKey("u1", "p1")).not.toBe(resourceTicksKey("u1", "p2"));
  });
});

describe("setDesired", () => {
  it("remembers what a resource should be while its save is in flight", () => {
    setDesired(key, "r1", true);
    setDesired(key, "r2", false);

    expect(readDesired(key)).toEqual({ r1: true, r2: false });
  });

  it("keeps the latest change for a resource", () => {
    setDesired(key, "r1", true);
    setDesired(key, "r1", false);

    expect(readDesired(key)).toEqual({ r1: false });
  });

  it("is empty when nothing is in flight", () => {
    expect(readDesired(key)).toEqual({});
  });

  it("keeps each person's and each pathway's changes apart", () => {
    setDesired(key, "r1", true);

    expect(readDesired(resourceTicksKey("u2", "p1"))).toEqual({});
    expect(readDesired(resourceTicksKey("u1", "p2"))).toEqual({});
  });
});

describe("markUnsaved", () => {
  it("remembers which resources' saves failed, the latest last", () => {
    markUnsaved(key, "r1");
    markUnsaved(key, "r2");
    markUnsaved(key, "r1");

    expect(readUnsaved(key)).toEqual(["r2", "r1"]);
  });

  it("has none to begin with", () => {
    expect(readUnsaved(key)).toEqual([]);
  });

  it("keeps each person's and each pathway's failures apart", () => {
    markUnsaved(key, "r1");

    expect(readUnsaved(resourceTicksKey("u2", "p1"))).toEqual([]);
  });
});

describe("settleTick", () => {
  it("forgets a resource once the server has confirmed it, whether it was in flight or failed", () => {
    setDesired(key, "r1", true);
    markUnsaved(key, "r1");
    setDesired(key, "r2", true);

    settleTick(key, "r1");

    expect(readDesired(key)).toEqual({ r2: true });
    expect(readUnsaved(key)).toEqual([]);
  });
});

describe("subscribeResourceTicks", () => {
  it("tells listeners when anything changes, until they stop listening", () => {
    const listener = vi.fn();
    const stop = subscribeResourceTicks(listener);

    setDesired(key, "r1", true);
    markUnsaved(key, "r1");
    settleTick(key, "r1");
    expect(listener).toHaveBeenCalledTimes(3);

    stop();
    setDesired(key, "r2", true);
    expect(listener).toHaveBeenCalledTimes(3);
  });
});
