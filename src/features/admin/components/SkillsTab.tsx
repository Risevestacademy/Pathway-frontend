import { useState } from "react";
import clsx from "clsx";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { StateMessage } from "../../../components/ui/StateMessage";
import {
  countSkills,
  filterSkills,
  type SkillFilter,
  type SkillItem,
  type TopicOption,
} from "../admin.editor";
import { formatDate, paginate } from "../admin.utils";
import { Pagination } from "./Pagination";
import { SkillDialog, type SkillDialogTarget } from "./SkillDialog";

const PAGE_SIZE = 7;

const FILTERS: { id: SkillFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "required", label: "Required" },
  { id: "nice", label: "Nice to have" },
  { id: "needs-source", label: "Needs a source" },
];

const pill = (active: boolean) =>
  clsx(
    "rounded-lg px-3 py-1.5 text-sm font-medium focus-ring",
    active ? "bg-brand-100 text-brand-800" : "bg-surface-muted text-ink-muted hover:bg-grey-100",
  );

interface SkillsTabProps {
  skills: SkillItem[];
  topics: TopicOption[];
  sourceTitles: string[];
  onChange: (skills: SkillItem[]) => void;
}

export function SkillsTab({ skills, topics, sourceTitles, onChange }: SkillsTabProps) {
  const [filter, setFilter] = useState<SkillFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<SkillDialogTarget>(null);

  const topicIds = new Set(topics.map((t) => t.id));
  const counts = countSkills(skills);
  const filtered = filterSkills(skills, filter, query);
  const current = paginate(filtered, page, PAGE_SIZE);

  const save = (skill: SkillItem) => {
    const exists = skills.some((s) => s.id === skill.id);
    onChange(exists ? skills.map((s) => (s.id === skill.id ? skill : s)) : [...skills, skill]);
    setTarget(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Skills this career looks for</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Learners self-check against these. Each skill links to roadmap topics.
          </p>
        </div>
        <Button onClick={() => setTarget("new")}>Add skill</Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search skills"
          aria-label="Search skills"
          className="w-full rounded-xl border border-line px-4 py-2.5 text-sm placeholder:text-ink-placeholder focus-ring sm:w-72"
        />
        <div role="group" aria-label="Filter skills" className="flex flex-wrap gap-2">
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
        {skills.length === 0 ? (
          <StateMessage
            kind="empty"
            title="No skills yet"
            body="Add the skills learners should self-check against."
            action={<Button onClick={() => setTarget("new")}>Add skill</Button>}
          />
        ) : filtered.length === 0 ? (
          <StateMessage
            kind="no-match"
            title="No skills match"
            body="Try a different search or filter."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-surface-muted text-ink-muted">
                  <tr>
                    {["Skill", "Importance", "Roadmap topics", "Source", "Updated"].map((h) => (
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
                  {current.items.map((skill) => {
                    const missingSource = !skill.source.trim();
                    return (
                      <tr key={skill.id}>
                        <td className="px-6 py-4">
                          <p className="font-medium text-ink">{skill.name}</p>
                          {skill.description && (
                            <p className="text-ink-muted">{skill.description}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge tone={skill.importance === "required" ? "brand" : "neutral"}>
                            {skill.importance === "required" ? "Required" : "Nice to have"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-ink">{skill.topicIds.filter((id) => topicIds.has(id)).length || "—"}</td>
                        <td className="max-w-[14rem] truncate px-6 py-4 text-ink">
                          {missingSource ? (
                            <Badge tone="warning">Needs a source</Badge>
                          ) : (
                            skill.source
                          )}
                        </td>
                        <td className="px-6 py-4 text-ink">{formatDate(skill.updatedAt)}</td>
                        <td className="px-6 py-4 text-right">
                          <Button isPrimary={false} onClick={() => setTarget(skill)}>
                            {missingSource ? "Add source" : "Edit"}
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
              noun="skills"
              onPage={setPage}
            />
          </>
        )}
      </section>

      <SkillDialog
        target={target}
        topics={topics}
        sourceTitles={sourceTitles}
        onSave={save}
        onClose={() => setTarget(null)}
      />
    </div>
  );
}
