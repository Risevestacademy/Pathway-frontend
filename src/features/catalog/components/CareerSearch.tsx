import clsx from "clsx";
import { Search } from "lucide-react";

interface CareerSearchProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function CareerSearch({ value, onChange, className }: CareerSearchProps) {
  return (
    <label className={clsx("relative block", className)}>
      <span className="sr-only">Search careers</span>
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-grey-500"
        strokeWidth={1.75}
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search careers..."
        className="field-control h-11 w-full pl-11 text-base text-ink outline-none placeholder:text-grey-500"
      />
    </label>
  );
}