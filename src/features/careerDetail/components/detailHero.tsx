import type { Career } from "@/types/career.types";
import { LinkButton } from "@/components/ui/Button";
import { PathwayHero } from "@/components/PathwayHero";
import { ArrowRightRegular } from "@mingcute/react/core-regular";

interface DetailHeroProps {
  career: Career;
}

export function DetailHero({ career }: DetailHeroProps) {
  return (
    <PathwayHero
      headingId="career-heading"
      title={career.title}
      description={career.description}
    >
      <div className="mt-6">
        {career.roadmapId ? (
          <LinkButton
            className="group"
            to="/careers/$careerId/roadmap"
            params={{ careerId: career.id }}
          >
            <span className="inline-flex items-center gap-1.5 text-body-md">
              Begin roadmap
              <ArrowRightRegular
                size={18}
                aria-hidden
                className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
              />
            </span>
          </LinkButton>
        ) : (
          <p className="text-body-md text-ink">Roadmap coming soon</p>
        )}
      </div>
    </PathwayHero>
  );
}
