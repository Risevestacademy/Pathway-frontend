import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { queryKeys } from "@/lib/queryKeys";
import { signIn, signOut } from "@/test/renderApp";
import type { ActivePathwayDto } from "@/lib/api/progress.api";
import { activePathwayDto, assessmentDto } from "../skillCheck.fixtures";
import { useSkillAssessment, useSkillCheckCareers } from "./useSkillCheck";

const server = setupServer();
let activeCareerId = "c1";
let pathwayReads: string[] = [];

const backendActive: ActivePathwayDto = {
  ...activePathwayDto,
  career: { ...activePathwayDto.career!, id: "c2", slug: "backend-engineer", title: "Backend Developer" },
};

const activeFor = (careerId: string) => (careerId === "c2" ? backendActive : activePathwayDto);

function roadmap(careerId: string, withSkills: boolean) {
  return {
    pathway: {
      id: `p-${careerId}`,
      careerId,
      title: "",
      description: "",
      steps: [{ id: `${careerId}-s1`, order: 1, title: "Step", skills: withSkills ? [{ id: "k1", name: "HTML" }] : [], resources: [] }],
    },
  };
}

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(() => {
  activeCareerId = "c1";
  pathwayReads = [];
  server.use(
    http.get("*/me/active-pathway", () => HttpResponse.json(activeFor(activeCareerId))),
    http.get("*/me/skills/assessment", () =>
      HttpResponse.json({ ...assessmentDto, careerId: activeCareerId }),
    ),
    http.get("*/careers", () =>
      HttpResponse.json({
        items: [
          { id: "c1", slug: "frontend-engineer", title: "Frontend Developer", description: "", iconKey: null, targetLevels: [], topicCount: 4, resourceCount: 0 },
          { id: "c3", slug: "data-analyst", title: "Data Analyst", description: "", iconKey: null, targetLevels: [], topicCount: 3, resourceCount: 0 },
          { id: "c4", slug: "qa-engineer", title: "QA Engineer", description: "", iconKey: null, targetLevels: [], topicCount: 0, resourceCount: 0 },
        ],
      }),
    ),
    http.get("*/careers/:id/pathway", ({ params }) => {
      const id = params.id as string;
      pathwayReads.push(id);
      return HttpResponse.json(roadmap(id, id === "c1"));
    }),
  );
  signIn();
});
afterEach(() => {
  cleanup();
  server.resetHandlers();
  signOut();
});
afterAll(() => server.close());

function setup<T>(hook: () => T) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, ...renderHook(hook, { wrapper }) };
}

describe("useSkillAssessment", () => {
  it("loads the new pathway's assessment after a switch made on another page", async () => {
    const { result, queryClient } = setup(() => useSkillAssessment().state);
    await waitFor(() => expect(result.current.kind).toBe("ready"));

    // What Start tracking does: the server switches, and only the active pathway is updated here.
    activeCareerId = "c2";
    queryClient.setQueryData(queryKeys.progress.active("u1"), backendActive);

    await waitFor(() =>
      expect(result.current).toMatchObject({
        kind: "ready",
        assessment: { careerId: "c2", name: "Backend Developer" },
      }),
    );
  });

  it("reports no pathway without asking for an assessment", async () => {
    let asked = false;
    server.use(
      http.get("*/me/active-pathway", () =>
        HttpResponse.json({ career: null, pathway: null, progress: null, steps: [] }),
      ),
      http.get("*/me/skills/assessment", () => {
        asked = true;
        return HttpResponse.json({}, { status: 404 });
      }),
    );
    const { result } = setup(() => useSkillAssessment().state);

    await waitFor(() => expect(result.current.kind).toBe("no-pathway"));
    expect(asked).toBe(false);
  });
});

describe("useSkillCheckCareers", () => {
  it("only marks careers whose roadmap lists skills as ready to check", async () => {
    const { result } = setup(() => useSkillCheckCareers().careers);

    await waitFor(() => expect(result.current).toBeDefined());
    const ready = Object.fromEntries(result.current!.map((career) => [career.careerId, career.reviewed]));
    expect(ready).toEqual({ c1: true, c3: false, c4: false });
  });

  it("skips the roadmap read for a career without steps", async () => {
    const { result } = setup(() => useSkillCheckCareers().careers);

    await waitFor(() => expect(result.current).toBeDefined());
    expect(pathwayReads.sort()).toEqual(["c1", "c3"]);
  });
});
