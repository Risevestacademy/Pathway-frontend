import { CAREER_LEVELS, type CareerLevel } from '../catalog.types';

interface LevelSwitcherProps {
  value: string | null;
  onChange: (level: CareerLevel) => void;
}

export function LevelSwitcher({ value, onChange }: LevelSwitcherProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {CAREER_LEVELS.map((level) => {
        const isActive = value === level.id;
        return (
          <button
            key={level.id}
            onClick={() => onChange(level.id as CareerLevel)}
            aria-pressed={isActive}
            className={`rounded-pill px-4 py-2 text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
              isActive
                ? 'bg-brand-600 text-white border border-brand-600'
                : 'bg-surface border border-line text-ink-muted hover:border-brand-300'
            }`}
          >
            {level.label}
          </button>
        );
      })}
    </div>
  );
}