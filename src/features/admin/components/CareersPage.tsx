import { useState } from "react";
import { BriefcaseBusiness, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { Button, LinkButton } from "../../../components/ui/Button";
import { StateMessage } from "../../../components/ui/StateMessage";
import {
  STATUS_LABEL,
  countByStatus,
  filterRows,
  paginate,
  type AdminCareerRow,
  type StatusFilter,
} from "../admin.utils";
import { useAdminCareers } from "../hooks/useAdminCareers";
import { AddCareerButton } from "./AddCareerButton";
import { PageHeader } from "./AdminLayout";
import { PublishCareerDialog, RetireCareerDialog } from "./CareerStatusDialogs";
import { CareersTable, CareersTableSkeleton } from "./CareersTable";

const SUBTITLE = "Every career learners can explore. Only published careers are visible.";
const FILTERS: StatusFilter[] = ["all", "published", "draft", "retired"];
const MAIN = "flex flex-1 flex-col gap-6 px-page-mobile py-6 sm:px-page-tablet lg:p-8";

const pill = (active: boolean) =>
  clsx(
    "rounded-lg px-3 py-1.5 text-sm font-medium focus-ring",
    active ? "bg-brand-100 text-brand-800" : "bg-surface-muted text-ink-muted hover:bg-grey-100",
  );

export function CareersPage() {
  const { rows, isPending, isError, refetch } = useAdminCareers();
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [publishing, setPublishing] = useState<AdminCareerRow | null>(null);
  const [retiring, setRetiring] = useState<AdminCareerRow | null>(null);

  if (isError) {
    return (
      <main className={MAIN}>
        <PageHeader title="Careers" subtitle={SUBTITLE} />
        <StateMessage
          kind="error"
          title="Couldn’t load careers"
          body="Check your connection and try again."
          action={<Button onClick={() => refetch()}>Try again</Button>}
        />
      </main>
    );
  }

  if (!isPending && rows.length === 0) {
    return (
      <main className={MAIN}>
        <LinkButton isPrimary={false} to="/admin" className="self-start">
          <ChevronLeft className="size-4" aria-hidden />
          Back
        </LinkButton>
        <PageHeader title="Careers" subtitle={SUBTITLE} />
        <section className="flex flex-col items-center rounded-3xl border border-line px-6 py-20 text-center">
          <span className="grid size-24 place-items-center rounded-2xl bg-brand-50 text-brand-500">
            <BriefcaseBusiness className="size-10" aria-hidden />
          </span>
          <h2 className="mt-6 font-display text-2xl font-semibold text-ink">No careers yet</h2>
          <p className="mt-2 max-w-sm text-ink-muted">
            Add a career to start. It stays a draft until a second editor approves it.
          </p>
          <div className="mt-6">
            <AddCareerButton label="Add Career" />
          </div>
        </section>
      </main>
    );
  }

  const counts = countByStatus(rows);
  const filtered = filterRows(rows, status, query);
  const current = paginate(filtered, page);

  return (
    <main className={MAIN}>
      <PageHeader title="Careers" subtitle={SUBTITLE} action={<AddCareerButton />} />

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search careers"
          aria-label="Search careers"
          className="w-full rounded-xl border border-line px-4 py-2.5 text-sm placeholder:text-ink-placeholder focus-ring sm:w-72"
        />
        <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={status === f}
              onClick={() => {
                setStatus(f);
                setPage(1);
              }}
              className={pill(status === f)}
            >
              {f === "all" ? "All" : STATUS_LABEL[f]} {isPending ? "" : counts[f]}
            </button>
          ))}
        </div>
      </div>

      <section className="overflow-hidden rounded-3xl border border-line-strong">
        {isPending ? (
          <CareersTableSkeleton />
        ) : filtered.length === 0 ? (
          <StateMessage
            kind="no-match"
            title="No careers match"
            body="Try a different search or status filter."
          />
        ) : (
          <>
            <CareersTable
              rows={current.items}
              onPublish={(row) => setPublishing(row)}
              onRetire={(row) => setRetiring(row)}
            />
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line px-6 py-4">
              <p className="text-sm text-ink-muted">
                Showing {current.items.length} of {filtered.length} careers
              </p>
              <nav aria-label="Pagination" className="flex items-center gap-2">
                <Button
                  isPrimary={false}
                  aria-label="Previous page"
                  disabled={current.page <= 1}
                  onClick={() => setPage(current.page - 1)}
                >
                  <ChevronLeft className="size-4" aria-hidden />
                </Button>
                {Array.from({ length: current.pageCount }, (_, i) => i + 1).map((n) => (
                  <Button
                    key={n}
                    isPrimary={false}
                    aria-current={n === current.page ? "page" : undefined}
                    className={n === current.page ? "!border-grey-900 !text-ink" : ""}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </Button>
                ))}
                <Button
                  isPrimary={false}
                  aria-label="Next page"
                  disabled={current.page >= current.pageCount}
                  onClick={() => setPage(current.page + 1)}
                >
                  <ChevronRight className="size-4" aria-hidden />
                </Button>
              </nav>
            </div>
          </>
        )}
      </section>

      <PublishCareerDialog career={publishing} onClose={() => setPublishing(null)} />
      <RetireCareerDialog career={retiring} onClose={() => setRetiring(null)} />
    </main>
  );
}
