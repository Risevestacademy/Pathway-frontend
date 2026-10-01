import { useState, type ReactNode } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useNavigate, Link } from '@tanstack/react-router';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Button } from '../../../components/ui/Button';
import { useSession } from '../../../lib/stores/session';
import { CAREER_FIELDS } from '../catelog.types';

const SKILL_OPTIONS = ['JavaScript', 'Python', 'SQL', 'Excel', 'Design', 'Communication'];

const selectTriggerClass =
  'cursor-pointer h-10.5! w-full justify-between pr-3 text-left text-[15px] bg-surface-muted text-ink ' +
  'data-placeholder:text-ink-placeholder ' +
  'focus-visible:border-brand-500 focus-visible:ring-3 focus-visible:ring-brand-500/15 ' +
  'data-[state=open]:border-brand-500 data-[state=open]:ring-3 data-[state=open]:ring-brand-500/15';

const whiteSelectTriggerClass =
  'cursor-pointer h-10.5! w-full justify-between px-3.5 text-left text-[15px] bg-surface text-ink ' +
  'border border-line rounded-md shadow-sm transition-colors hover:border-line-strong ' +
  'data-placeholder:text-ink-placeholder ' +
  'focus-visible:border-brand-500 focus-visible:ring-3 focus-visible:ring-brand-500/15 focus-visible:outline-none ' +
  'data-[state=open]:border-brand-500 data-[state=open]:ring-3 data-[state=open]:ring-brand-500/15';

export default function AboutYou() {
  const profile = useSession();
  const navigate = useNavigate();

  const [draft, setDraft] = useState({
    education: { degree: '', field: '' },
    experience: { years: '', internships: '' },
    skills: profile.skills || [],
    interest: profile.interest,
  });

  const submit = () => {
    profile.setSkills(draft.skills);
    profile.setInterest(draft.interest);
    navigate({ to: '/careers' });
  };

  const skip = () => {
    profile.clearOptional();
    navigate({ to: '/careers' });
  };

  const hasInput =
    draft.education.degree ||
    draft.education.field ||
    draft.experience.years ||
    draft.experience.internships ||
    draft.skills.length > 0 ||
    draft.interest;

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <Link
        to="/careers/onboarding"
        className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline mb-6 cursor-pointer"
      >
        &larr; Back
      </Link>
      <p className="mb-2 text-sm font-medium text-brand-700">Step 2 of 2 · Optional</p>
      <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Tell us a bit more</h1>
      <p className="mt-1 mb-8 text-ink-muted">
        Add any of these to see careers that fit you best — or skip to browse everything.
      </p>

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
                {['Secondary school', 'Diploma / OND', "Bachelor's (in progress)", "Bachelor's", "Master's", 'Other'].map((opt) => (
                  <SelectItem key={opt} value={opt} className="h-9 rounded-sm px-2.5 text-[15px]">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              type="text"
              value={draft.education.field}
              onChange={(e) => setDraft({ ...draft, education: { ...draft.education, field: e.target.value } })}
              placeholder="Field of study, e.g. Economics"
              className="flex w-full items-center rounded-md border border-line bg-surface px-3.5 h-10.5 text-[15px] placeholder:text-ink-placeholder shadow-sm transition-colors hover:border-line-strong focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/15"
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
                {['None yet', 'Less than 1 year', '1–2 years', '3–5 years'].map((opt) => (
                  <SelectItem key={opt} value={opt} className="h-9 rounded-sm px-2.5 text-[15px]">
                    {opt}
                  </SelectItem>
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
                {['None', '1', '2', '3 or more'].map((opt) => (
                  <SelectItem key={opt} value={opt} className="h-9 rounded-sm px-2.5 text-[15px]">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Field>

        <Field label="Skills">
          <MultiSelect
            values={draft.skills}
            options={SKILL_OPTIONS}
            placeholder="Select skills"
            onChange={(skills) => setDraft({ ...draft, skills })}
          />
        </Field>

        <Field label="Career interest">
          <Select
            value={draft.interest ?? ''}
            onValueChange={(v) => setDraft({ ...draft, interest: v })}
          >
            <SelectTrigger className={whiteSelectTriggerClass}>
              <SelectValue placeholder="Pick a field" />
            </SelectTrigger>
            <SelectContent>
              {CAREER_FIELDS.map((f) => (
                <SelectItem key={f.slug} value={f.slug} className="h-9 rounded-sm px-2.5 text-[15px]">
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="sticky bottom-0 -mx-4 mt-8 flex flex-col-reverse gap-3 border-t border-line bg-canvas px-4 py-4 sm:static sm:mx-0 sm:flex-row sm:justify-end sm:border-0 sm:bg-transparent sm:px-0">
        <Button isPrimary={false} size="lg" onClick={skip} className="w-full sm:w-auto">
          Skip for now
        </Button>
        <Button size="lg" onClick={submit} disabled={!hasInput} className="w-full sm:w-auto">
          Show my careers
        </Button>
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

function MultiSelect({
  values,
  options,
  placeholder,
  onChange,
}: {
  values: string[];
  options: string[];
  placeholder: string;
  onChange: (v: string[]) => void;
}) {
  const toggle = (option: string) => {
    onChange(
      values.includes(option)
        ? values.filter((v) => v !== option)
        : [...values, option]
    );
  };

  return (
    <Popover>
      <PopoverTrigger className={`flex items-center ${whiteSelectTriggerClass}`}>
        <span className={`truncate text-left ${values.length === 0 ? 'text-ink-placeholder' : ''}`}>
          {values.length > 0 ? values.join(', ') : placeholder}
        </span>
        <ChevronDown className="size-4 shrink-0 opacity-50 ml-2" />
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] min-w-48 p-1 bg-surface rounded-md border border-line shadow-md"
        align="start"
      >
        <div className="flex flex-col gap-0.5">
          {options.map((option) => {
            const selected = values.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggle(option)}
                className={`flex h-9 w-full items-center justify-between rounded-sm px-2.5 text-[15px] transition-colors cursor-pointer text-left hover:bg-surface-muted ${
                  selected ? 'font-medium text-ink' : 'text-ink'
                }`}
              >
                <span>{option}</span>
                {selected && <Check className="size-4 text-brand-600" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}