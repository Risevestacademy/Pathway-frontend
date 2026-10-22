import { ArrowRightRegular } from "@mingcute/react/core-regular";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { selectIsAuthenticated, useAuthStore } from "../../../lib/stores/authStore";
import { findSkillCheckCareerByTitle } from "../careerMatch";
import { useRoadmapSteps } from "../hooks/useRealCareer";
import { ESTIMATED_MINUTES } from "../skillCheck.copy";
import { SignInPromptDialog } from "./SignInPromptDialog";
import { SkillButton, SkillLink } from "./SkillButton";

export function SkillGapEntry({
  title,
  slug,
  roadmapId,
  careerId,
}: {
  title: string;
  slug?: string;
  roadmapId: string | null;
  careerId: string;
}) {
  const navigate = useNavigate();
  const signedIn = useAuthStore(selectIsAuthenticated);
  const match = findSkillCheckCareerByTitle(title, slug);
  const firstStep = useRoadmapSteps(roadmapId ? careerId : null)[0];
  const [askOpen, setAskOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);

  if (!match || !match.reviewed) return null;

  const goCheck = () =>
    navigate({ to: "/skill-check/$careerId", params: { careerId: match.careerId } });

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
                params={{ careerId, stepId: firstStep.stepId }}
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
        redirectTo={`/skill-check/${match.careerId}`}
      />
    </>
  );
}
