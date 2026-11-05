import { Button, LinkButton } from "../../../components/ui/Button";
import { Skeleton } from "../../../components/ui/Skeleton";
import { StateMessage } from "../../../components/ui/StateMessage";
import type { PathwayCardsState } from "../hooks/usePathwayCards";
import { PathwayCard } from "./PathwayCard";

/** My Pathway's Roadmap screen: a card for each pathway the person has saved. */
export function RoadmapScreen({
  state,
  onRetry,
}: {
  state: PathwayCardsState;
  onRetry: () => void;
}) {
  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl leading-10 font-semibold text-ink sm:text-4xl">
          Roadmap
        </h1>
        <p className="mt-2 text-base text-ink-muted">
          See your active career pathways and track your progress.
        </p>
      </header>

      <Body state={state} onRetry={onRetry} />
    </section>
  );
}

function Body({ state, onRetry }: { state: PathwayCardsState; onRetry: () => void }) {
  switch (state.kind) {
    case "loading":
      return (
        <div role="status" className="grid gap-6 lg:grid-cols-2">
          <span className="sr-only">Loading your pathways</span>
          <Skeleton className="h-72 rounded-3xl" />
          <Skeleton className="h-72 rounded-3xl" />
        </div>
      );

    case "error":
      return (
        <StateMessage
          kind="error"
          title="We couldn’t load your pathways"
          body="Your progress is safe. Check your connection and try again."
          action={
            <Button isPrimary={false} onClick={onRetry}>
              Try again
            </Button>
          }
        />
      );

    case "signed-out":
      return (
        <StateMessage
          kind="empty"
          title="Sign in to see your pathways"
          body="Your saved pathways and progress show up here once you sign in."
          action={
            <LinkButton to="/login" search={{ redirect: "/my-pathway" }}>
              Sign in
            </LinkButton>
          }
        />
      );

    case "ready":
      if (state.cards.length === 0) {
        return (
          <StateMessage
            kind="empty"
            title="No pathways saved yet"
            body="Pick a career to explore, then start its roadmap to see it here."
            action={<LinkButton to="/careers">Explore careers</LinkButton>}
          />
        );
      }
      return (
        <div className="grid gap-6 lg:grid-cols-2">
          {state.cards.map((card) => (
            <PathwayCard key={card.careerId} {...card} />
          ))}
        </div>
      );
  }
}
