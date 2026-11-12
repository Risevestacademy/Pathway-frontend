import { useId } from "react";
import { useSession } from "../../../lib/stores/session";
import { CAREER_LEVELS } from "../../../types/career.types";
import { ProfileSection } from "./ProfileSection";

export function LevelCard() {
  const groupName = useId();
  const level = useSession((state) => state.level);
  const setLevel = useSession((state) => state.setLevel);

  return (
    <ProfileSection title="Level">
      <div role="radiogroup" aria-label="Level" className="flex flex-wrap gap-2.5">
        {CAREER_LEVELS.map((option) => (
          <label key={option.id} className="cursor-pointer">
            <input
              type="radio"
              name={groupName}
              value={option.id}
              checked={level === option.id}
              onChange={() => setLevel(option.id)}
              className="peer sr-only"
            />
            <span className="flex rounded-[20px] border border-grey-200 bg-surface px-3.5 py-2 text-sm leading-5 font-medium text-grey-600 transition-colors duration-200 hover:bg-grey-50 peer-checked:border-brand-500 peer-checked:bg-brand-100 peer-checked:text-brand-700 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2 motion-reduce:transition-none">
              {option.label}
            </span>
          </label>
        ))}
      </div>
      <p className="text-xs leading-4 font-medium text-grey-500">
        You can change this any time. It does not change career outlook information.
      </p>
    </ProfileSection>
  );
}