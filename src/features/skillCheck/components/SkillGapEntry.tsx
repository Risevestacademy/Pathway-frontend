import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button, LinkButton } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Modal } from "../../../components/ui/Modal";
import { selectIsAuthenticated, useAuthStore } from "../../../lib/stores/authStore";
import { findSkillCheckCareerByTitle } from "../careerMatch";
import { ESTIMATED_MINUTES } from "../skillCheck.copy";
import { SignInPromptDialog } from "./SignInPromptDialog";

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
  const match = findSkillCheckCareerByTitle(title);
  const [askOpen, setAskOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);

  if (!match || !match.reviewed) return null;

  const goCheck = () =>
    navigate({ to: "/skill-check/$careerId", params: { careerId: match.careerId } });

  return (
    <>
      <Card
        aria-labelledby="skill-gap-title"
        className="mt-3 flex flex-col gap-4 bg-brand-50/50 p-5 sm:flex-row sm:items-center"
      >
        <div className="flex-1">
          <h2 id="skill-gap-title" className="font-semibold">
            Check your skill gap
          </h2>
          <p className="text-sm text-ink-muted">
            Mark the skills you already have and we suggest where to start. About{" "}
            {ESTIMATED_MINUTES} minutes, self-reported.
          </p>
        </div>
        <Button onClick={() => (signedIn ? setAskOpen(true) : setSignInOpen(true))}>
          Check skill gap
        </Button>
      </Card>

      <Modal
        open={askOpen}
        onClose={() => setAskOpen(false)}
        title={`Check your skills for ${title}?`}
        description="Your answers suggest a starting step. You can skip this and start at step 1."
        className="max-w-130"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          {roadmapId ? (
            <LinkButton
              isPrimary={false}
              size="lg"
              className="flex-1"
              to="/careers/$careerId/roadmap"
              params={{ careerId }}
            >
              Skip, start at step 1
            </LinkButton>
          ) : (
            <Button isPrimary={false} size="lg" className="flex-1" onClick={() => setAskOpen(false)}>
              Not now
            </Button>
          )}
          <Button size="lg" className="flex-1" onClick={() => void goCheck()}>
            Check my skills
          </Button>
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
