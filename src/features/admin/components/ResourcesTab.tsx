import { useState } from "react";
import clsx from "clsx";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { StateMessage } from "../../../components/ui/StateMessage";
import {
  COST_LABEL,
  LINK_STATUS_LABEL,
  RESOURCE_TYPE_LABEL,
  checkResourceLinks,
  countResources,
  filterResources,
  type LinkStatus,
  type ResourceFilter,
  type ResourceItem,
  type TopicOption,
} from "../admin.editor";
import { formatDate, paginate } from "../admin.utils";
import { Pagination } from "./Pagination";
import { ResourceDialog, type ResourceDialogTarget } from "./ResourceDialog";

const PAGE_SIZE = 6;

const FILTERS: { id: ResourceFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "working", label: "Working" },
  { id: "broken", label: "Broken" },
  { id: "not-checked", label: "Not checked" },
];

const STATUS_TONE: Record<LinkStatus, "success" | "danger" | "neutral"> = {
  working: "success",
  broken: "danger",
  "not-checked": "neutral",
};

const pill = (active: boolean) =>
  clsx(
    "rounded-lg px-3 py-1.5 text-sm font-medium focus-ring",
    active ? "bg-brand-100 text-brand-800" : "bg-surface-muted text-ink-muted hover:bg-grey-100",
  );

interface ResourcesTabProps {
  careerName: string;
  resources: ResourceItem[];
  topics: TopicOption[];
  onChange: (resources: ResourceItem[]) => void;
}

export function ResourcesTab({ careerName, resources, topics, onChange }: ResourcesTabProps) {
  const [filter, setFilter] = useState<ResourceFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<ResourceDialogTarget>(null);

  const topicIds = new Set(topics.map((t) => t.id));
  const counts = countResources(resources);
  const filtered = filterResources(resources, filter, query);
  const current = paginate(filtered, page, PAGE_SIZE);

  const save = (resource: ResourceItem) => {
    const exists = resources.some((r) => r.id === resource.id);
    onChange(
      exists ? resources.map((r) => (r.id === resource.id ? resource : r)) : [...resources, resource],
    );
    setTarget(null);
  };

  const remove = (id: string) => {
    onChange(resources.filter((r) => r.id !== id));
    setTarget(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">
            Resources for {careerName}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Learning links shown on roadmap topics. We check every link each week.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            isPrimary={false}
            disabled={resources.length === 0}
            onClick={() => onChange(checkResourceLinks(resources))}
          >
            Check links now
          </Button>
          <Button onClick={() => setTarget("new")}>Add resource</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search resources"
          aria-label="Search resources"
          className="w-full rounded-xl border border-line px-4 py-2.5 text-sm placeholder:text-ink-placeholder focus-ring sm:w-72"
        />
        <div role="group" aria-label="Filter resources" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => {
                setFilter(f.id);
                setPage(1);
              }}
              className={pill(filter === f.id)}
            >
              {f.label} {counts[f.id]}
            </button>
          ))}
        </div>
      </div>

      <section className="overflow-hidden rounded-3xl border border-line-strong">
        {resources.length === 0 ? (
          <StateMessage
            kind="empty"
            title="No resources yet"
            body="Add learning links for learners to use on roadmap topics."
            action={<Button onClick={() => setTarget("new")}>Add resource</Button>}
          />
        ) : filtered.length === 0 ? (
          <StateMessage
            kind="no-match"
            title="No resources match"
            body="Try a different search or filter."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-surface-muted text-ink-muted">
                  <tr>
                    {["Resource", "Type", "Cost", "Link status", "Last checked"].map((h) => (
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
                  {current.items.map((r) => {
                    const used = r.topicIds.filter((id) => topicIds.has(id)).length;
                    return (
                      <tr key={r.id}>
                        <td className="px-6 py-4">
                          <p className="font-medium text-ink">{r.title}</p>
                          <p className="text-ink-muted">
                            Used in {used} topic{used === 1 ? "" : "s"}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-ink">{RESOURCE_TYPE_LABEL[r.type]}</td>
                        <td className="px-6 py-4">
                          <Badge tone={r.cost === "paid" ? "info" : "neutral"}>
                            {COST_LABEL[r.cost]}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge tone={STATUS_TONE[r.linkStatus]}>
                            {LINK_STATUS_LABEL[r.linkStatus]}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-ink">{formatDate(r.lastChecked)}</td>
                        <td className="px-6 py-4 text-right">
                          <Button isPrimary={false} onClick={() => setTarget(r)}>
                            {r.linkStatus === "broken" ? "Fix" : "Edit"}
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
              total={filtered.length}
              noun="resources"
              onPage={setPage}
            />
          </>
        )}
      </section>

      <ResourceDialog
        target={target}
        topics={topics}
        onSave={save}
        onDelete={remove}
        onClose={() => setTarget(null)}
      />
    </div>
  );
}
