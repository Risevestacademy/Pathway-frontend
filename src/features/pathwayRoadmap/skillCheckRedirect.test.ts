import { describe, expect, it } from "vitest";
import { Route as IndexRoute } from "../../routes/skill-check/index";
import { Route as SplatRoute } from "../../routes/skill-check/$";

type BeforeLoad = (args: { params: Record<string, string> }) => void;

/** What a route throws when it sends the person somewhere else. */
function redirected(route: { options: { beforeLoad?: unknown } }, params: Record<string, string> = {}): unknown {
  const beforeLoad = route.options.beforeLoad as BeforeLoad;
  try {
    beforeLoad({ params });
  } catch (thrown) {
    return thrown;
  }
  return undefined;
}

describe("/skill-check, which moved under My Pathway", () => {
  it("sends people to /my-pathway/skill-check", () => {
    expect(redirected(IndexRoute)).toMatchObject({ options: { to: "/my-pathway/skill-check" } });
  });

  it("replaces the old address in the history, so Back doesn't land on it again", () => {
    expect(redirected(IndexRoute)).toMatchObject({ options: { replace: true } });
  });
});

describe("/skill-check/…, the old addresses of its other screens", () => {
  it("keeps the rest of the path, so an old link to a result still opens it", () => {
    expect(redirected(SplatRoute, { _splat: "frontend-developer/result" })).toMatchObject({
      options: { to: "/my-pathway/skill-check/frontend-developer/result" },
    });
  });

  it("works for a questionnaire link too", () => {
    expect(redirected(SplatRoute, { _splat: "c1" })).toMatchObject({
      options: { to: "/my-pathway/skill-check/c1" },
    });
  });

  it("replaces the old address in the history", () => {
    expect(redirected(SplatRoute, { _splat: "c1" })).toMatchObject({ options: { replace: true } });
  });

  it("goes to the skill check home when there is nothing after the slash", () => {
    expect(redirected(SplatRoute, { _splat: "" })).toMatchObject({
      options: { to: "/my-pathway/skill-check" },
    });
  });
});
