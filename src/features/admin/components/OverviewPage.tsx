import clsx from "clsx";
import type { ReactNode } from "react";
import { Badge } from "../../../components/ui/Badge";
import { Skeleton } from "../../../components/ui/Skeleton";
import publishedArt from "../../../assets/images/admin-art-published.png";
import reviewArt from "../../../assets/images/admin-art-review.png";
import linksArt from "../../../assets/images/admin-art-links.png";
import reportsArt from "../../../assets/images/admin-art-reports.png";
import { attentionItems, overviewStats, recentActivity } from "../admin.mock";
import { countUpdatedThisWeek } from "../admin.utils";
import { useAdminCareers } from "../hooks/useAdminCareers";
import { AddCareerButton } from "./AddCareerButton";
import { PageHeader } from "./AdminLayout";

/** Line art anchored to the right of a stat card. */
function Art({ src }: { src: string }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      draggable={false}
      className="pointer-events-none absolute inset-y-0 right-0 h-full w-auto max-w-none select-none"
    />
  );
}

function StatCard({
  label,
  value,
  note,
  tint,
  art,
}: {
  label: string;
  value: ReactNode;
  note: string;
  tint: string;
  art: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line p-2">
      <h2 className="px-3 pt-2 pb-3 text-base font-medium text-ink-muted">{label}</h2>
      <div
        className={clsx(
          "relative flex h-40 items-end justify-between gap-2 overflow-hidden rounded-xl border p-3",
          tint,
        )}
      >
        {art}
        <p className="relative font-display text-5xl font-semibold text-ink">{value}</p>
        {note && (
          <span className="relative rounded-lg bg-surface px-3 py-1.5 text-xs text-ink-muted shadow-card">
            {note}
          </span>
        )}
      </div>
    </section>
  );
}

function ListCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line-strong">
      <div className="bg-brand-50 px-5 py-4">
        <h2 className="font-medium text-ink">{title}</h2>
        <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
      </div>
      <ul className="divide-y divide-line border-t border-line">{children}</ul>
    </section>
  );
}

export function OverviewPage() {
  const { rows, isPending, isError } = useAdminCareers();
  const published = rows.filter((r) => r.status === "published").length;
  const updated = countUpdatedThisWeek(rows);

  const staleItems = rows
    .filter((r) => r.sources && r.sources.health !== "ok")
    .map((r) => ({
      id: `src-${r.id}`,
      title:
        r.sources?.health === "missing"
          ? `${r.title}: outlook data is missing`
          : `${r.title}: salary source is older than 12 months`,
      area: "Careers · Sources",
      badge: r.sources?.health === "missing" ? "Missing" : "Stale source",
      tone: "warning" as const,
    }));
  const attention = [...staleItems, ...attentionItems];

  return (
    <main className="flex flex-1 flex-col gap-8 px-page-mobile py-6 sm:px-page-tablet lg:p-8">
      <PageHeader
        title="Overview"
        subtitle="What needs your attention today."
        action={<AddCareerButton />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Published Careers"
          value={isPending ? <Skeleton className="h-12 w-16" /> : isError ? "—" : published}
          note={isPending || isError ? "" : `${updated} updated this week`}
          tint="border-brand-300 bg-brand-50"
          art={<Art src={publishedArt} />}
        />
        <StatCard
          label="Waiting for review"
          value={overviewStats.waitingForReview.count}
          note={overviewStats.waitingForReview.note}
          tint="border-pink-300 bg-pink-50"
          art={<Art src={reviewArt} />}
        />
        <StatCard
          label="Broken Links"
          value={overviewStats.brokenLinks.count}
          note={overviewStats.brokenLinks.note}
          tint="border-amber-300 bg-amber-50"
          art={<Art src={linksArt} />}
        />
        <StatCard
          label="Learner reports"
          value={overviewStats.learnerReports.count}
          note={overviewStats.learnerReports.note}
          tint="border-blue-300 bg-blue-50"
          art={<Art src={reportsArt} />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ListCard title="Needs attention" subtitle="Fix these before they reach learners">
          {attention.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="font-medium text-ink">{item.title}</p>
                <p className="mt-0.5 text-sm text-ink-muted">{item.area}</p>
              </div>
              <Badge tone={item.tone}>{item.badge}</Badge>
            </li>
          ))}
        </ListCard>

        <ListCard title="Recent activity" subtitle="Last 7 days">
          {recentActivity.map((item) => (
            <li key={item.id} className="px-5 py-4">
              <p className="font-medium text-ink">{item.title}</p>
              <p className="mt-0.5 text-sm text-ink-muted">{item.when}</p>
            </li>
          ))}
        </ListCard>
      </div>
    </main>
  );
}
