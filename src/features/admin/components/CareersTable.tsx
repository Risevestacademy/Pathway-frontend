import clsx from "clsx";
import { Badge } from "../../../components/ui/Badge";
import { Button, LinkButton } from "../../../components/ui/Button";
import { Skeleton } from "../../../components/ui/Skeleton";
import {
  STATUS_LABEL,
  formatDate,
  type AdminCareerRow,
  type AdminStatus,
  type SourceHealth,
} from "../admin.utils";

const STATUS_TONE = {
  published: "success",
  draft: "neutral",
  retired: "danger",
} as const satisfies Record<AdminStatus, string>;

const SOURCE_CLASS: Record<SourceHealth, string> = {
  ok: "text-ink",
  stale: "text-warning-700",
  missing: "text-danger-700",
};

const TILES = ["bg-brand-100", "bg-success-50", "bg-accent-100", "bg-info-50", "bg-warning-50"];

const COLUMNS = ["Career", "Status", "Roadmap topics", "Sources", "Last updated"];

export function CareersTableSkeleton() {
  return (
    <div aria-busy className="divide-y divide-line">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-5">
          <Skeleton className="size-11" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="ml-auto h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}

interface CareersTableProps {
  rows: AdminCareerRow[];
  onPublish: (row: AdminCareerRow) => void;
  onRetire: (row: AdminCareerRow) => void;
  onDelete: (row: AdminCareerRow) => void;
}

export function CareersTable({ rows, onPublish, onRetire, onDelete }: CareersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[920px] text-left text-sm">
        <thead className="bg-surface-muted text-ink-muted">
          <tr>
            {COLUMNS.map((h) => (
              <th key={h} scope="col" className="px-6 py-4 font-medium">
                {h}
              </th>
            ))}
            <th scope="col" className="px-6 py-4">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row, i) => (
            <tr key={row.id}>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className={clsx(
                      "grid size-11 shrink-0 place-items-center rounded-lg font-display font-semibold text-brand-700",
                      TILES[i % TILES.length],
                    )}
                  >
                    {row.title.charAt(0)}
                  </span>
                  <div>
                    <p className="font-medium text-ink">{row.title}</p>
                    <p className="text-ink-muted">{row.shortDescription}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge tone={STATUS_TONE[row.status]}>{STATUS_LABEL[row.status]}</Badge>
              </td>
              <td className="px-6 py-4 text-ink">{row.stepCount ?? "—"}</td>
              <td
                className={clsx(
                  "px-6 py-4",
                  row.sources ? SOURCE_CLASS[row.sources.health] : "text-ink",
                )}
              >
                {row.sources?.label ?? "—"}
              </td>
              <td className="px-6 py-4 text-ink">{formatDate(row.updatedAt)}</td>
              <td className="px-6 py-4">
                <div className="flex justify-end gap-2">
                  {row.status === "draft" && (
                    <Button isPrimary={false} onClick={() => onPublish(row)}>
                      Publish
                    </Button>
                  )}
                  {row.status === "draft" && (
                    <Button isPrimary={false} onClick={() => onDelete(row)}>
                      Delete
                    </Button>
                  )}
                  {row.status === "published" && (
                    <Button isPrimary={false} onClick={() => onRetire(row)}>
                      Retire
                    </Button>
                  )}
                  <LinkButton
                    isPrimary={false}
                    to="/admin/careers/$careerId"
                    params={{ careerId: row.id }}
                  >
                    {row.status === "retired" ? "View" : "Edit"}
                  </LinkButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
