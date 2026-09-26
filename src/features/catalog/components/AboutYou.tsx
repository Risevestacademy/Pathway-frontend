import { ChevronLeft, Check, Plus, X } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { Popover, PopoverAnchor, PopoverContent } from '../../../components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Button } from '../../../components/ui/Button';
import { useSession } from '../../../lib/stores/session';
import { cn } from '../../../lib/utils';

const SUGGESTED_INTERESTS = ['Frontend development', 'Data science', 'Product management', 'Design', 'Marketing', 'Research'];
const SUGGESTED_SKILLS = ['JavaScript', 'Python', 'SQL', 'Excel', 'Design', 'Communication'];

const selectTriggerClass =
  'cursor-pointer h-[42px]! w-full justify-between pr-3 text-left text-[15px] bg-surface-muted text-ink ' +
  'data-placeholder:text-ink-placeholder ' +
  'focus-visible:border-brand-500 focus-visible:ring-3 focus-visible:ring-brand-500/15 ' +
  'data-[state=open]:border-brand-500 data-[state=open]:ring-3 data-[state=open]:ring-brand-500/15';

export default function AboutYou() {
  const profile = useSession();
  const navigate = useNavigate();

  const [draft, setDraft] = useState({
    education: { degree: '', field: '' },
    experience: { years: '', internships: '' },
    skills: profile.skills || [],
    interests: profile.interests || []
  });

  const submit = () => {
    profile.setSkills(draft.skills);
    profile.setInterests(draft.interests);
    navigate({ to: '/careers' });
  };

  const hasInput =
  draft.education.degree || draft.education.field ||
  draft.experience.years || draft.experience.internships ||
  draft.skills.length > 0 || draft.interests.length > 0;

  const skip = () => {
    profile.clearOptional();
    navigate({ to: '/careers' });
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <Link
        to="/careers/onboarding"
        className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline mb-6 cursor-pointer"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Back
      </Link>
      <p className="mb-2 text-sm font-medium text-brand-700">Step 2 of 2 · Optional</p>
      <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">Tell us a bit more</h1>
      <p className="mt-1 mb-8 text-ink-muted">Add any of these to see careers that fit you best — or skip to browse everything.</p>

      <div className="grid gap-6">
        <Field label="Education">
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              value={draft.education.degree}
              onValueChange={(v) => setDraft({ ...draft, education: { ...draft.education, degree: v } })}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Highest qualification" />
              </SelectTrigger>
              <SelectContent>
                {['Secondary school', 'Diploma / OND', 'Bachelor’s (in progress)', 'Bachelor’s', 'Master’s', 'Other'].map(opt => (
                  <SelectItem key={opt} value={opt} className="h-9 rounded-sm px-2.5 text-[15px]">{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              type="text"
              value={draft.education.field}
              onChange={(e) => setDraft({ ...draft, education: { ...draft.education, field: e.target.value } })}
              placeholder="Field of study, e.g. Economics"
              className="flex w-full items-center rounded-md border border-line bg-surface px-3.5 h-[42px] text-[15px] placeholder:text-ink-placeholder shadow-sm transition-colors hover:border-line-strong focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/15"
            />
          </div>
        </Field>

        <Field label="Experience">
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              value={draft.experience.years}
              onValueChange={(v) => setDraft({ ...draft, experience: { ...draft.experience, years: v } })}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Years of work" />
              </SelectTrigger>
              <SelectContent>
                {['None yet', 'Less than 1 year', '1–2 years', '3–5 years'].map(opt => (
                  <SelectItem key={opt} value={opt} className="h-9 rounded-sm px-2.5 text-[15px]">{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={draft.experience.internships}
              onValueChange={(v) => setDraft({ ...draft, experience: { ...draft.experience, internships: v } })}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Internships" />
              </SelectTrigger>
              <SelectContent>
                {['None', '1', '2', '3 or more'].map(opt => (
                  <SelectItem key={opt} value={opt} className="h-9 rounded-sm px-2.5 text-[15px]">{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Field>

        <Field label="Skills">
          <ChipCombobox
            values={draft.skills}
            suggestions={SUGGESTED_SKILLS}
            onChange={(skills) => setDraft({ ...draft, skills })}
            placeholder="Add a skill"
          />
        </Field>

        <Field label="Career interests">
          <ChipCombobox
            values={draft.interests}
            suggestions={SUGGESTED_INTERESTS}
            onChange={(interests) => setDraft({ ...draft, interests })}
            placeholder="Add an interest"
          />
        </Field>
      </div>

      <div className="sticky bottom-0 -mx-4 mt-8 flex flex-col-reverse gap-3 border-t border-line bg-canvas px-4 py-4 sm:static sm:mx-0 sm:flex-row sm:justify-end sm:border-0 sm:bg-transparent sm:px-0">
        <Button isPrimary={false} size="lg" onClick={skip} className="w-full sm:w-auto">Skip for now</Button>
        <Button size="lg" onClick={submit} disabled={!hasInput} className="w-full sm:w-auto">Show my careers</Button>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      {children}
    </fieldset>
  );
}

interface ChipComboboxProps {
  values: string[];
  suggestions: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}

function ChipCombobox({ values, suggestions, onChange, placeholder }: ChipComboboxProps) {
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const has = (v: string) => values.some((x) => x.toLowerCase() === v.toLowerCase());
  const add = (v: string) => {
    const t = v.trim();
    if (t && !has(t)) onChange([...values, t]);
    setText('');
    inputRef.current?.focus();
  };

  const q = text.trim().toLowerCase();
  const matches = suggestions.filter((s) => !q || s.toLowerCase().includes(q));
  const canAddCustom = !!q && !suggestions.some((s) => s.toLowerCase() === q) && !has(q);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div
          ref={anchorRef}
          onClick={() => inputRef.current?.focus()}
          className={cn(
            'flex w-full min-h-[42px] cursor-text flex-wrap items-center gap-1.5 rounded-md border border-input bg-surface px-2 py-1.5 text-[15px] shadow-sm transition-colors focus-visible:outline-none',
            open && 'border-brand-500 ring-2 ring-brand-500/15'
          )}
        >
          {values.map((v) => (
            <span key={v} className="inline-flex items-center gap-1 rounded-sm bg-brand-50 py-0.5 pr-0.5 pl-2 text-[15px] text-brand-800">
              {v}
              <button
                aria-label={`Remove ${v}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(values.filter((x) => x !== v));
                }}
                className="grid size-5 place-items-center rounded-sm hover:bg-brand-100 cursor-pointer"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded={open}
            className="h-7 min-w-32 flex-1 bg-transparent px-2 text-[15px] placeholder:text-ink-placeholder focus:outline-none"
            value={text}
            placeholder={placeholder}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setText(e.target.value);
              setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                add(text);
              } else if (e.key === 'Backspace' && !text && values.length) {
                onChange(values.slice(0, -1));
              }
            }}
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        sideOffset={6}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          if (anchorRef.current?.contains(e.target as Node)) e.preventDefault();
        }}
        className="w-[var(--radix-popover-trigger-width)] gap-0 rounded-md border border-line p-1 shadow-raised ring-0"
      >
        <p className="px-2.5 pt-1.5 pb-1 text-xs font-medium text-ink-subtle">{q ? 'Matches' : 'Suggestions'}</p>
        <ul role="listbox" className="grid">
          {matches.map((s) => {
            const selected = has(s);
            return (
              <li key={s}>
                <button
                  role="option"
                  aria-selected={selected}
                  onClick={() => (selected ? onChange(values.filter((x) => x.toLowerCase() !== s.toLowerCase())) : add(s))}
                  className="flex h-10 w-full items-center justify-between rounded-sm px-2.5 text-left text-[15px] hover:bg-brand-50 hover:text-brand-800 cursor-pointer"
                >
                  {s}
                  {selected && <Check className="size-4 text-brand-600" />}
                </button>
              </li>
            );
          })}
          {canAddCustom && (
            <li>
              <button onClick={() => add(text)} className="flex h-10 w-full items-center gap-2 rounded-sm px-2.5 text-left text-[15px] text-brand-700 hover:bg-brand-50 cursor-pointer">
                <Plus className="size-4" /> Add "{text.trim()}"
              </button>
            </li>
          )}
          {matches.length === 0 && !canAddCustom && <li className="px-2.5 py-2 text-[15px] text-ink-subtle">Already added</li>}
        </ul>
      </PopoverContent>
    </Popover>
  );
}