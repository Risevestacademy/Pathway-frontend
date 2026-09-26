import { ArrowRight, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { StateMessage } from '../../../components/ui/StateMessage';
import { CAREER_LEVELS, type Career, type CareerLevel } from '../catalog.types';
import { hasOptionalInput, useSession } from '../../../lib/stores/session';
import { useCareers } from '../hooks/useCareers';
import { LevelSwitcher } from './LevelSwitcher';

export default function Catalogue() {
  const profile = useSession();
  const { level, setLevel, skills, interests, clearOptional } = profile;
  const filtered = hasOptionalInput(profile);
  const { data, isLoading, isError, refetch } = useCareers();

  return (
    <main className="px-page-mobile sm:px-page-tablet lg:px-page-desktop xl:px-page-wide py-8">
      <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">Explore careers</h1>
          <p className="mt-1 text-ink-muted">Open any career to see what the work involves, pay, outlook and a roadmap.</p>
        </div>
        <LevelSwitcher value={level} onChange={setLevel} />
      </div>

      {filtered && (
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-lg border border-brand-100 bg-brand-50/60 p-3">
          <SlidersHorizontal className="size-4 text-brand-700" />
          <span className="text-sm text-ink-muted">Showing matches for</span>
          {[...interests, ...skills].map((t) => (
            <Badge key={t} tone="brand">{t}</Badge>
          ))}
          <div className="ml-auto flex gap-3">
            <Link to="/careers/onboarding/about" className="text-sm font-medium text-brand-700 hover:underline cursor-pointer">Edit</Link>
            <button onClick={clearOptional} className="text-sm font-medium text-brand-700 hover:underline cursor-pointer">Clear</button>
          </div>
        </div>
      )}

      {isLoading && <LoadingGrid />}

      {isError && (
        <StateMessage
          kind="error"
          title="We couldn’t load careers"
          body="Something went wrong on our side or with your connection. Please try again."
          action={<Button onClick={() => refetch()} className="cursor-pointer">Try again</Button>}
        />
      )}

      {!isLoading && !isError && (
        <Results 
          careers={data?.data || []} 
          level={level}
          skills={skills}
          interests={interests}
          clearFilters={clearOptional}
          levelLabel={CAREER_LEVELS.find((l) => l.id === level)?.label} 
        />
      )}
    </main>
  );
}

interface ResultsProps {
  careers: Career[];
  level: string | null;
  skills: string[];
  interests: string[];
  clearFilters: () => void;
  levelLabel?: string;
}

function Results({ careers, level, skills, interests, clearFilters, levelLabel }: ResultsProps) {
  const publishedCareers = careers.filter(c => c.status === 'published');
  const filtered = skills.length > 0 || interests.length > 0;
  let displayedCareers = publishedCareers;

  if (filtered) {
    const matchTerms = [...interests, ...skills].map(t => t.toLowerCase());
    displayedCareers = publishedCareers.filter(c =>
      c.tags.some(tag => matchTerms.includes(tag.toLowerCase()))
    );
  }

  if (publishedCareers.length === 0) {
    return <StateMessage kind="empty" title="No careers available yet" body="We're adding careers to the catalogue. Check back soon." />;
  }

  if (careers.length === 0) {
    return <StateMessage kind="empty" title="No careers available yet" body="We’re adding careers to the catalogue. Check back soon." />;
  }

  if (displayedCareers.length === 0) {
    return (
      <StateMessage
        kind="no-match"
        title="No careers match your filters"
        body="Try removing some interests or skills, or clear filters to see the full catalogue."
        action={<Button onClick={clearFilters} className="cursor-pointer">Clear filters</Button>}
      />
    );
  }

  return (
    <>
      <p className="mb-3 text-sm text-ink-subtle" aria-live="polite">
        {displayedCareers.length} {displayedCareers.length === 1 ? 'career' : 'careers'}
      </p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {displayedCareers.map((c) => {
          const isLevelFit = level ? c.levels.includes(level as CareerLevel) : false;

          return (
            <li key={c.id}>
              <a 
                href={`/careers/${c.id}`} 
                className="group block h-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg"
              >
                <Card className="flex h-full flex-col p-5 transition-shadow hover:shadow-raised">
                  {isLevelFit && levelLabel && (
                    <Badge tone="accent" icon={<Sparkles className="size-3 text-accent-600" />} className="mb-3 self-start">
                      Good fit for {levelLabel.toLowerCase()}s
                    </Badge>
                  )}
                  <h2 className="font-display text-base font-semibold text-ink">{c.title}</h2>
                  <p className="mt-1 flex-1 text-sm text-ink-muted">{c.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700">
                    View career <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Card>
              </a>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function LoadingGrid() {
  return (
    <div role="status" aria-live="polite">
      <p className="mb-3 text-sm text-ink-subtle">Loading careers…</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="mt-3 h-3.5 w-full" />
            <Skeleton className="mt-2 h-3.5 w-4/5" />
            <Skeleton className="mt-5 h-3.5 w-24" />
          </Card>
        ))}
      </div>
    </div>
  );
}