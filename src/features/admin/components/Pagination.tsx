import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../components/ui/Button";

interface PaginationProps {
  page: number;
  pageCount: number;
  shown: number;
  total: number;
  noun: string;
  onPage: (page: number) => void;
}

export function Pagination({ page, pageCount, shown, total, noun, onPage }: PaginationProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line px-6 py-4">
      <p className="text-sm text-ink-muted">
        Showing {shown} of {total} {noun}
      </p>
      <nav aria-label="Pagination" className="flex items-center gap-2">
        <Button
          isPrimary={false}
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          <ChevronLeft className="size-4" aria-hidden />
        </Button>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
          <Button
            key={n}
            isPrimary={false}
            aria-current={n === page ? "page" : undefined}
            className={n === page ? "!border-grey-900 !text-ink" : ""}
            onClick={() => onPage(n)}
          >
            {n}
          </Button>
        ))}
        <Button
          isPrimary={false}
          aria-label="Next page"
          disabled={page >= pageCount}
          onClick={() => onPage(page + 1)}
        >
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </nav>
    </div>
  );
}
