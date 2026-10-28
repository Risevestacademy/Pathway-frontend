import { useState } from "react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Dialog } from "../../../components/ui/Dialog";
import { formatDate, paginate } from "../admin.utils";
import { SEED_VERSIONS, type CareerVersion } from "../admin.workflow";
import { Pagination } from "./Pagination";

const PAGE_SIZE = 5;
const SOON = "Coming soon: needs saved versions from the backend";

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}

/** Published versions of a career. Versions are dummy data until there's an endpoint. */
export function HistoryTab() {
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<CareerVersion | null>(null);

  const versions = SEED_VERSIONS;
  const live = versions[0].version;
  const first = versions[versions.length - 1].version;
  const current = paginate(versions, page, PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">History</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Every published change, who made it and who approved it.
          </p>
        </div>
        <Button isPrimary={false} disabled title={SOON}>
          Compare versions
        </Button>
      </div>

      <section className="overflow-hidden rounded-3xl border border-line-strong">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-surface-muted text-ink-muted">
              <tr>
                {["Version", "What changed", "Edited by", "Approved by", "Date"].map((h) => (
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
              {current.items.map((v) => {
                const isLive = v.version === live;
                // The live and first versions can't be restored.
                const canRestore = !isLive && v.version !== first;
                return (
                  <tr key={v.version}>
                    <td className="px-6 py-4">
                      <Badge tone={isLive ? "success" : "neutral"}>
                        v{v.version}
                        {isLive ? " · live" : ""}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-medium text-ink">{v.summary}</td>
                    <td className="px-6 py-4 text-ink">{v.editedBy}</td>
                    <td className="px-6 py-4 text-ink">{v.approvedBy}</td>
                    <td className="px-6 py-4 text-ink">{formatDate(v.publishedAt)}</td>
                    <td className="px-6 py-4 text-right">
                      {canRestore ? (
                        <Button isPrimary={false} disabled title={SOON}>
                          Restore
                        </Button>
                      ) : (
                        <Button isPrimary={false} onClick={() => setViewing(v)}>
                          View
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination
          page={current.page}
          pageCount={current.pageCount}
          shown={current.items.length}
          total={versions.length}
          noun="versions"
          onPage={setPage}
        />
      </section>

      <Dialog
        open={viewing !== null}
        onOpenChange={(open) => !open && setViewing(null)}
        title={viewing ? `Version ${viewing.version}` : "Version"}
        description={viewing?.summary}
      >
        {viewing && (
          <>
            <dl className="mt-6 grid gap-4 sm:grid-cols-3">
              <Detail label="Edited by" value={viewing.editedBy} />
              <Detail label="Approved by" value={viewing.approvedBy} />
              <Detail label="Published" value={formatDate(viewing.publishedAt)} />
            </dl>
            <div className="mt-6 flex justify-end">
              <Button isPrimary={false} onClick={() => setViewing(null)}>
                Close
              </Button>
            </div>
          </>
        )}
      </Dialog>
    </div>
  );
}
