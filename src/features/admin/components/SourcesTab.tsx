import { useState } from "react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { StateMessage } from "../../../components/ui/StateMessage";
import {
  displayLink,
  getSourceStatus,
  type SourceItem,
  type SourceStatus,
} from "../admin.editor";
import { formatDate, paginate } from "../admin.utils";
import { Banner } from "./Banner";
import { Pagination } from "./Pagination";
import { SourceDialog, type SourceDialogTarget } from "./SourceDialog";

const PAGE_SIZE = 6;

const STATUS_TONE: Record<SourceStatus["kind"], "success" | "warning" | "danger" | "neutral"> = {
  ok: "success",
  review: "warning",
  missing: "danger",
  unchecked: "neutral",
};

interface SourcesTabProps {
  sources: SourceItem[];
  onChange: (sources: SourceItem[]) => void;
}

export function SourcesTab({ sources, onChange }: SourcesTabProps) {
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<SourceDialogTarget>(null);

  const current = paginate(sources, page, PAGE_SIZE);
  const missing = sources.filter((s) => !s.link.trim());

  const save = (source: SourceItem) => {
    const exists = sources.some((s) => s.id === source.id);
    onChange(exists ? sources.map((s) => (s.id === source.id ? source : s)) : [...sources, source]);
    setTarget(null);
  };

  const remove = (id: string) => {
    onChange(sources.filter((s) => s.id !== id));
    setTarget(null);
  };

  const recheckAll = () => {
    const now = new Date().toISOString();
    onChange(sources.map((s) => (s.link.trim() ? { ...s, lastChecked: now } : s)));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Sources</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Every figure and claim on this career points to one of these. Learners see them under
            “Where this comes from”.
          </p>
        </div>
        <div className="flex gap-3">
          <Button isPrimary={false} disabled={sources.length === 0} onClick={recheckAll}>
            Re-check all
          </Button>
          <Button onClick={() => setTarget("new")}>Add source</Button>
        </div>
      </div>

      <section className="overflow-hidden rounded-3xl border border-line-strong">
        {sources.length === 0 ? (
          <StateMessage
            kind="empty"
            title="No sources yet"
            body="Add the sources behind this career’s figures and claims."
            action={<Button onClick={() => setTarget("new")}>Add source</Button>}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-surface-muted text-ink-muted">
                  <tr>
                    {["Source", "Used for", "Type", "Last checked", "Status"].map((h) => (
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
                  {current.items.map((s) => {
                    const status = getSourceStatus(s);
                    return (
                      <tr key={s.id}>
                        <td className="px-6 py-4">
                          <p className="font-medium text-ink">{s.title}</p>
                          <p className="text-ink-muted">
                            {s.link.trim() ? displayLink(s.link) : "No link added"}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-ink">{s.usedFor}</td>
                        <td className="px-6 py-4 text-ink">{s.type}</td>
                        <td className="px-6 py-4 text-ink">
                          {s.lastChecked ? formatDate(s.lastChecked) : "Not checked"}
                        </td>
                        <td className="px-6 py-4">
                          <Badge tone={STATUS_TONE[status.kind]}>{status.label}</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button isPrimary={false} onClick={() => setTarget(s)}>
                            {status.kind === "missing" ? "Fix" : "Edit"}
                          </Button>
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
              total={sources.length}
              noun="sources"
              onPage={setPage}
            />
          </>
        )}
      </section>

      {missing.length > 0 && (
        <Banner
          tone="warning"
          title={`${missing.length} source${missing.length > 1 ? "s need" : " needs"} attention`}
        >
          {missing.map((s) => `“${s.title}”`).join(", ")} {missing.length > 1 ? "have" : "has"} no
          link, so learners can’t check {missing.length > 1 ? "them" : "it"}. Add a link or replace{" "}
          {missing.length > 1 ? "them" : "it"} before you submit.
        </Banner>
      )}

      <SourceDialog
        target={target}
        onSave={save}
        onDelete={remove}
        onClose={() => setTarget(null)}
      />
    </div>
  );
}
