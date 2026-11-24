import { describe, expect, it } from "vitest";
import { Route as IndexRoute } from "../../routes/skill-check/index";
import { Route as SplatRoute } from "../../routes/skill-check/$";

type BeforeLoad = (args: { params: Record<string, string> }) => void | Promise<void>;

/** What a route throws when it sends the person somewhere else. */
async function redirected(
  route: { options: { beforeLoad?: unknown } },
  params: Record<string, string> = {},
): Promise<unknown> {
  const beforeLoad = route.options.beforeLoad as BeforeLoad;
  try {
    await beforeLoad({ params });
  } catch (thrown) {
    return thrown;
  }
  return undefined;
}

describe("/skill-check, which moved under My Pathway", () => {
  it("sends people to /my-pathway/skill-check", async () => {
    expect(await redirected(IndexRoute)).toMatchObject({ options: { to: "/my-pathway/skill-check" } });
  });

  it("replaces the old address in the history, so Back doesn't land on it again", async () => {
    expect(await redirected(IndexRoute)).toMatchObject({ options: { replace: true } });
  });
});

describe("/skill-check/…, the old addresses of its other screens", () => {
  // Those addresses used placeholder career ids that no longer exist.
  it.each(["frontend-developer/result", "c1", "frontend-developer/roadmap"])(
    "sends /skill-check/%s to the skill check home",
    async (splat) => {
      expect(await redirected(SplatRoute, { _splat: splat })).toMatchObject({
        options: { to: "/my-pathway/skill-check" },
      });
    },
  );

  it("replaces the old address in the history", async () => {
    expect(await redirected(SplatRoute, { _splat: "c1" })).toMatchObject({ options: { replace: true } });
  });

  it("goes to the skill check home when there is nothing after the slash", async () => {
    expect(await redirected(SplatRoute, { _splat: "" })).toMatchObject({
      options: { to: "/my-pathway/skill-check" },
    });
  });
});
