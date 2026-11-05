import type { ReactNode } from "react";
import { CareerSearch } from "./CareerSearch";

interface CareerFilterBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  tabs?: ReactNode;
  children: ReactNode;
}

export function CareerFilterBar({
  query,
  onQueryChange,
  tabs,
  children,
}: CareerFilterBarProps) {
  return (
    <div className="mt-6 flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-4">
      <CareerSearch
        value={query}
        onChange={onQueryChange}
        className="xl:w-80 xl:shrink-0"
      />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 xl:flex-1">
        {tabs}
        <div
          role="group"
          aria-label="Change your filters"
          className="flex min-w-0 flex-wrap items-center gap-2 sm:ml-auto"
        >
          {children}
        </div>
      </div>
    </div>
  );
}