import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import {
  httpStatus,
  isNetworkError,
  progressErrorMessage,
  type ProgressAction,
} from "./progressErrors";

/** A failed request the server answered with `status`. */
const answered = (status: number) =>
  new AxiosError("Request failed", "ERR_BAD_RESPONSE", undefined, undefined, {
    status,
    data: {},
    statusText: "",
    headers: {},
    config: {},
  } as AxiosResponse);

/** A failed request that never got an answer. */
const unreachable = () => new AxiosError("Network Error", "ERR_NETWORK");

describe("httpStatus and isNetworkError", () => {
  it("reads the status of an answered request", () => {
    expect(httpStatus(answered(409))).toBe(409);
    expect(isNetworkError(answered(409))).toBe(false);
  });

  it("has no status for a request that never got an answer", () => {
    expect(httpStatus(unreachable())).toBeUndefined();
    expect(isNetworkError(unreachable())).toBe(true);
  });

  it("has neither for an error that isn't a request failure", () => {
    expect(httpStatus(new Error("boom"))).toBeUndefined();
    expect(isNetworkError(new Error("boom"))).toBe(false);
    expect(httpStatus("nope")).toBeUndefined();
  });
});

describe("progressErrorMessage", () => {
  it.each<[ProgressAction, number, string]>([
    ["set-active-pathway", 404, "This career isn’t available to follow right now."],
    ["set-active-pathway", 409, "This career doesn’t have a pathway yet."],
    ["step", 404, "This step isn’t available any more."],
    ["step", 409, "Save this career to your pathways before tracking progress on it."],
    ["starting-point", 400, "That step isn’t part of this pathway."],
    ["starting-point", 404, "Save this pathway before choosing where to start."],
  ])("explains a %s %i in plain words", (action, status, message) => {
    expect(progressErrorMessage(answered(status), action)).toBe(message);
  });

  it.each<[ProgressAction, string]>([
    ["pathways", "We couldn’t load your pathways. Please try again."],
    ["active-pathway", "We couldn’t load your active pathway. Please try again."],
    ["set-active-pathway", "We couldn’t set this pathway. Please try again."],
    ["step", "We couldn’t update this step. Please try again."],
    ["starting-point", "We couldn’t save your starting point. Please try again."],
  ])("falls back for %s on a status it has no message for", (action, message) => {
    expect(progressErrorMessage(answered(500), action)).toBe(message);
    expect(progressErrorMessage(new Error("boom"), action)).toBe(message);
  });

  it("doesn't borrow another action's message for the same status", () => {
    // A 409 means something for a step, but nothing special when loading pathways.
    expect(progressErrorMessage(answered(409), "pathways")).toBe(
      "We couldn’t load your pathways. Please try again.",
    );
  });

  it("explains an expired session for every action", () => {
    for (const action of ["pathways", "step", "starting-point"] as ProgressAction[]) {
      expect(progressErrorMessage(answered(401), action)).toBe(
        "Your session has expired. Sign in again to continue.",
      );
    }
  });

  it("explains a dropped connection for every action", () => {
    for (const action of ["pathways", "step", "starting-point"] as ProgressAction[]) {
      expect(progressErrorMessage(unreachable(), action)).toBe(
        "We couldn’t reach the server. Check your connection and try again.",
      );
    }
  });
});
