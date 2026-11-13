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
  // One wrapping row, so whatever shares a line is centred on that line. Nested
  // rows would centre the search against both lines once the filters wrap.
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-3 xl:gap-x-4">
      <CareerSearch
        value={query}
        onChange={onQueryChange}
        className="w-full xl:w-80 xl:shrink-0"
      />
      {tabs}
      <div
        role="group"
        aria-label="Change your filters"
        className="flex min-w-0 flex-wrap items-center gap-2 sm:ml-auto"
      >
        {children}
      </div>
    </div>
  );
}