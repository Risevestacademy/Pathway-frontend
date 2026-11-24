import { ArrowRightRegular } from "@mingcute/react/core-regular";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { selectIsAuthenticated, useAuthStore } from "../../../lib/stores/authStore";
import { fetchPathwayOrNull } from "../../../lib/api/pathways.api";
import { queryKeys } from "../../../lib/queryKeys";
import { ESTIMATED_MINUTES } from "../skillCheck.copy";
import { SignInPromptDialog } from "./SignInPromptDialog";
import { SkillButton, SkillLink } from "./SkillButton";

export function SkillGapEntry({
  title,
  roadmapId,
  careerId,
}: {
  title: string;
  roadmapId: string | null;
  careerId: string;
}) {
  const navigate = useNavigate();
  const signedIn = useAuthStore(selectIsAuthenticated);
  const firstStep = useFirstStep(roadmapId ? careerId : null);
  const [askOpen, setAskOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);

  if (!roadmapId) return null;

  const goCheck = () =>
    navigate({ to: "/my-pathway/skill-check/$careerId", params: { careerId } });

  return (
    <>
      <aside
        aria-labelledby="skill-gap-title"
        className="order-first flex flex-col gap-4 rounded-[20px] border border-brand-100 bg-brand-50 p-6 lg:order-last"
      >
        <h2 id="skill-gap-title" className="font-display text-2xl leading-6 font-medium text-ink">
          Check your skill gap
        </h2>
        <p className="text-base leading-5 text-grey-600">
          Spot your skills and gaps. Optional, based on your answers.
        </p>
        <SkillButton onClick={() => (signedIn ? setAskOpen(true) : setSignInOpen(true))}>
          Check skill gap
          <ArrowRightRegular aria-hidden className="size-5" />
        </SkillButton>
        <p className="text-sm leading-5 text-grey-600">
          Takes about {ESTIMATED_MINUTES} mins.{signedIn ? "" : " Sign up to save your results."}
        </p>
      </aside>

      <Modal
        open={askOpen}
        onClose={() => setAskOpen(false)}
        title={`Check your skills for ${title}?`}
        description="Optional. Find your starting point or skip to step 1."
        className="max-w-[520px]"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          {roadmapId ? (
            firstStep ? (
              <SkillLink
                isPrimary={false}
                className="flex-1"
                to="/careers/$careerId/roadmap/$stepId"
                params={{ careerId, stepId: firstStep.id }}
              >
                Skip, start at step 1
              </SkillLink>
            ) : (
              <SkillLink
                isPrimary={false}
                className="flex-1"
                to="/careers/$careerId/roadmap"
                params={{ careerId }}
              >
                Skip, start at step 1
              </SkillLink>
            )
          ) : (
            <SkillButton isPrimary={false} className="flex-1" onClick={() => setAskOpen(false)}>
              Not now
            </SkillButton>
          )}
          <SkillButton className="flex-1" onClick={() => void goCheck()}>
            Check my skills
            <ArrowRightRegular aria-hidden className="size-5" />
          </SkillButton>
        </div>
      </Modal>

      <SignInPromptDialog
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        redirectTo={`/my-pathway/skill-check/${careerId}`}
      />
    </>
  );
}

function useFirstStep(careerId: string | null) {
  const { data } = useQuery({
    queryKey: queryKeys.pathway(careerId ?? ""),
    queryFn: () => fetchPathwayOrNull(careerId as string),
    enabled: careerId !== null,
    staleTime: 15 * 60 * 1000,
    retry: false,
  });
  return data ? [...data.steps].sort((a, b) => a.order - b.order)[0] ?? null : null;
}
