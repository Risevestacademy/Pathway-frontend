import { useState } from "react";
import type { UserProfile } from "../../../lib/api/users.api";
import { SkillsInput } from "../../catalog/components/SkillsInput";
import { SkillButton } from "../../skillCheck/components/SkillButton";
import { useSkillsCatalogue } from "../../skillCheck/hooks/useSkillCheck";
import { useUpdateMySkills } from "../../skillCheck/hooks/useSkillCheckActions";
import { ProfileSection } from "./ProfileSection";

/** Profile skills. The server keeps skill check answers in the same list. */
export function SkillsCard({ profile }: { profile: UserProfile }) {
  const skills = profile.skills ?? [];
  const catalogue = useSkillsCatalogue();
  const update = useUpdateMySkills();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const options = (catalogue.data ?? []).map((skill) => ({ value: skill.id, label: skill.name }));
  const removed = skills.filter((skill) => !draft.includes(skill.id));

  const startEditing = () => {
    setDraft(skills.map((skill) => skill.id));
    setSaved(false);
    update.reset();
    setEditing(true);
  };

  const save = async () => {
    try {
      await update.mutateAsync(draft);
      setEditing(false);
      setSaved(true);
    } catch {
      return;
    }
  };

  return (
    <ProfileSection
      title="Skills"
      action={
        !editing && (
          <SkillButton isPrimary={false} onClick={startEditing}>
            {skills.length > 0 ? "Edit" : "Add skills"}
          </SkillButton>
        )
      }
    >
      <p className="text-sm leading-5 text-grey-600">
        Skills you believe you have. We use them to show gaps in your pathway.
      </p>

      {editing ? (
        <div className="flex flex-col gap-3">
          {catalogue.isError ? (
            <p role="alert" className="text-sm leading-5 text-danger-700">
              We could not load the skill list.{" "}
              <button
                type="button"
                onClick={() => void catalogue.refetch()}
                className="focus-ring cursor-pointer font-medium underline"
              >
                Try again
              </button>
            </p>
          ) : (
            <SkillsInput
              values={draft}
              options={options}
              onChange={setDraft}
              disabled={!catalogue.data || update.isPending}
            />
          )}
          {removed.length > 0 && (
            <p className="text-sm leading-5 text-grey-600">
              Removing a skill also clears your Skill check answer for it.
            </p>
          )}
          {update.isError && (
            <p role="alert" className="text-sm leading-5 text-danger-700">
              Your skills did not save. Try again.
            </p>
          )}
          <div className="flex gap-3">
            <SkillButton
              isPrimary={false}
              disabled={update.isPending}
              onClick={() => setEditing(false)}
            >
              Cancel
            </SkillButton>
            <SkillButton disabled={!catalogue.data || update.isPending} onClick={() => void save()}>
              {update.isPending ? "Saving" : "Save skills"}
            </SkillButton>
          </div>
        </div>
      ) : skills.length > 0 ? (
        <ul aria-label="Your skills" className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <li
              key={skill.id}
              className="inline-flex h-7 items-center rounded-[4px] bg-brand-100 px-2 text-sm leading-5 text-brand-700"
            >
              {skill.name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm leading-5 text-grey-500">No skills added yet.</p>
      )}

      {saved && !editing && (
        <p role="status" className="text-sm leading-5 text-success-700">
          Skills saved.
        </p>
      )}
    </ProfileSection>
  );
}
