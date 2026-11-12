import clsx from "clsx";
import { useDeferredValue, useMemo, useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { Button } from "@/components/ui/Button";
import { PathwayHero } from "@/components/PathwayHero";
import CareerFrame from "@/features/careerDetail/components/CareerFrame";
import { CareerFilterBar } from "@/features/catalog/components/CareerFilterBar";
import { FilterSelect } from "@/features/catalog/components/FilterSelect";
import { NO_INTEREST, toApiLevel } from "@/features/catalog/catalog.types";
import { useCareers } from "@/features/catalog/hooks/useCareers";
import { useFields } from "@/features/catalog/hooks/useFields";
import ExploreTabs from "@/features/explore/components/ExploreTabs";
import { matchesQuery } from "@/features/explore/explore.utils";
import { useCareerDetails } from "@/features/explore/hooks/useCareerDetails";
import { CAREER_LEVELS, type CareerLevel } from "@/types/career.types";
import { COMPARE } from "../compare.copy";
import {
  MAX_COMPARE,
  selectedIds,
  toSlots,
  toggleSelection,
} from "../compare.utils";
import { useToast } from "../hooks/useToast";
import CareerList from "./CareerList";
import Toast from "./Toast";

type SearchPatch = {
  a?: string;
  b?: string;
  q?: string;
  level?: CareerLevel;
  interest?: string;
};

const route = getRouteApi("/careers/compare/");

const PAGE_SIZE = 9;
const ANY_LEVEL = "any-level";

const levelOptions = [
  { value: ANY_LEVEL, label: "Any level" },
  ...CAREER_LEVELS.map((level) => ({ value: level.id, label: level.label })),
];

export default function ComparePickerPage() {
  const search = route.useSearch();
  const navigate = route.useNavigate();
  const query = search.q ?? "";
  const deferredQuery = useDeferredValue(query);
  const [count, setCount] = useState(PAGE_SIZE);
  const { toast, show } = useToast();

  const everyCareer = useCareers({});
  const careers = useCareers({
    level: toApiLevel(search.level ?? null),
    interest: search.interest,
  });
  const fields = useFields();

  const list = useMemo(() => careers.data ?? [], [careers.data]);
  const matches = list.filter((career) =>
    matchesQuery([career.title, career.shortDescription], deferredQuery),
  );
  const shown = matches.slice(0, count);
  const details = useCareerDetails(shown.map((career) => career.id));

  const known = everyCareer.data;
  const ids = selectedIds(search.a, search.b).filter(
    (id) => !known || known.some((career) => career.id === id),
  );
  const titleOf = (id: string) =>
    known?.find((career) => career.id === id)?.title ?? "this career";

  const update = (patch: SearchPatch) =>
    void navigate({
      search: (prev) => {
        const next = { ...prev, ...patch };
        return {
          a: next.a,
          b: next.b,
          q: next.q?.trim() ? next.q : undefined,
          level: next.level,
          interest: next.interest,
        };
      },
      replace: true,
      resetScroll: false,
    });

  const toggle = (id: string) => {
    const result = toggleSelection(ids, id);
    if (result.blocked) {
      show(COMPARE.picker.maxTwo);
      return;
    }
    update(toSlots(result.ids));
  };

  const compare = () => {
    if (ids.length < MAX_COMPARE) {
      show(COMPARE.picker.pickTwo);
      return;
    }
    void navigate({
      to: "/careers/compare/result",
      search: { a: ids[0], b: ids[1] },
    });
  };

  const ready = ids.length === MAX_COMPARE;
  const hasFilters = Boolean(search.q || search.level || search.interest);
  const status =
    ids.length === 0
      ? COMPARE.picker.nothingSelected
      : ids.length === 1
        ? COMPARE.picker.oneSelected(titleOf(ids[0]))
        : COMPARE.picker.twoSelected(titleOf(ids[0]), titleOf(ids[1]));

  return (
    <CareerFrame>
      <ExploreTabs current="compare" />

      <PathwayHero
        headingId="compare-heading"
        title={COMPARE.hero.title}
        description={COMPARE.hero.description}
      >
        <Button
          size="lg"
          className={clsx("mt-6", !ready && "opacity-60")}
          aria-disabled={!ready}
          aria-describedby="compare-status"
          onClick={compare}
        >
          {COMPARE.hero.cta}
        </Button>
      </PathwayHero>

      <CareerFilterBar
        query={query}
        onQueryChange={(value) => {
          setCount(PAGE_SIZE);
          update({ q: value });
        }}
      >
        <FilterSelect
          label="Level"
          placeholder="Choose"
          value={search.level ?? ""}
          onValueChange={(value) => {
            setCount(PAGE_SIZE);
            update({
              level: value === ANY_LEVEL ? undefined : (value as CareerLevel),
            });
          }}
          options={levelOptions}
        />
        <FilterSelect
          label="Interest"
          placeholder="Any field"
          value={search.interest ?? ""}
          onValueChange={(value) => {
            setCount(PAGE_SIZE);
            update({ interest: value === NO_INTEREST ? undefined : value });
          }}
          disabled={!fields.data}
          options={[
            { value: NO_INTEREST, label: "Any field" },
            ...(fields.data ?? []).map((f) => ({
              value: f.slug,
              label: f.name,
            })),
          ]}
        />
      </CareerFilterBar>

      <p
        id="compare-status"
        role="status"
        className="mt-4 text-base text-grey-600"
      >
        {status}
      </p>

      <CareerList
        isError={careers.isError}
        isPending={careers.isPending}
        isRefreshing={careers.isPlaceholderData}
        matches={matches}
        shown={shown}
        details={details}
        selectedIds={ids}
        hasFilters={hasFilters}
        onRetry={() => void careers.refetch()}
        onToggle={toggle}
        onShowMore={() => setCount((n) => n + PAGE_SIZE)}
        onClearFilters={() => {
          setCount(PAGE_SIZE);
          update({ q: undefined, level: undefined, interest: undefined });
        }}
      />

      <Toast toast={toast} />
    </CareerFrame>
  );
}
