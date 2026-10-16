import heroCubes from "@/assets/images/discover-hero-cubes.svg";
// import { Skeleton } from "../../../components/ui/Skeleton";
import type { Career } from "@/types/career.types";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRightRegular } from "@mingcute/react/core-regular";

interface DetailHeroProps {
  career: Career;
}

export function DetailHero({ career }: DetailHeroProps) {
  const navigate = useNavigate();

  const handleRoadmapClick = () => {
    if (career.roadmapId) {
      navigate({
        to: "/careers/$careerId/roadmap",
        params: { careerId: career.id },
      });
    }
  };
  return (
    <section
      aria-labelledby="discover-heading"
      className="
        relative overflow-hidden rounded-2xl border border-line
        bg-linear-to-r from-surface from-45% to-brand-100
        p-6 sm:p-10
      "
    >
      <img
        src={heroCubes}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-auto max-w-[45%] object-cover object-left select-none lg:block"
      />

      <div className="relative lg:max-w-[55%]">
        <h1
          id="discover-heading"
          className="font-display text-4xl font-semibold tracking-tight text-ink lg:text-[2.5rem]"
        >
          {career.title}
        </h1>
        <p className="mt-4 max-w-xl text-body-md text-ink-muted">
          {career.description}
        </p>

        <div className="mt-6">
          <Button
            className="group"
            onClick={handleRoadmapClick}
            disabled={!career.roadmapId}
          >
            <span className="inline-flex items-center gap-1.5 text-body-md">
              {career.roadmapId ? "Begin roadmap" : "Roadmap Coming Soon"}
              <ArrowRightRegular
                size={18}
                aria-hidden
                className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
              />
            </span>
          </Button>
        </div>
      </div>
    </section>
  );
}
