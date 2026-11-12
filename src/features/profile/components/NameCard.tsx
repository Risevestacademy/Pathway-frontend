import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, Ref } from "react";
import type { UserProfile } from "../../../lib/api/users.api";
import { SkillButton } from "../../skillCheck/components/SkillButton";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { displayName, saveErrorMessage, splitName, validateName } from "../profile.utils";

const avatarFiles = import.meta.glob("/src/assets/images/avatar.svg", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
const avatarUrl = Object.values(avatarFiles)[0] ?? null;

function Avatar({ email, large }: { email: string; large: boolean }) {
  const size = large ? "size-24" : "size-20";
  if (avatarUrl) {
    return <img src={avatarUrl} alt="" className={`${size} shrink-0 rounded-full bg-grey-50`} />;
  }
  return (
    <span
      aria-hidden
      className={`${size} grid shrink-0 place-items-center rounded-full bg-brand-100 text-2xl font-semibold text-brand-700`}
    >
      {email.trim().charAt(0).toUpperCase()}
    </span>
  );
}

function NameField({
  id,
  label,
  value,
  error,
  autoComplete,
  inputRef,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error: string | null;
  autoComplete: string;
  inputRef?: Ref<HTMLInputElement>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-base leading-5 font-medium text-ink">
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="field-control min-h-12 w-full text-sm font-medium text-ink aria-invalid:border-danger-600"
      />
      {error && (
        <p id={`${id}-error`} className="text-sm leading-5 text-danger-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function NameCard({
  profile,
  editing,
  onEdit,
  onDone,
}: {
  profile: UserProfile;
  editing: boolean;
  onEdit: () => void;
  onDone: () => void;
}) {
  const id = useId();
  const update = useUpdateProfile();
  const current = splitName(profile);
  const [firstName, setFirstName] = useState(current.firstName);
  const [lastName, setLastName] = useState(current.lastName);
  const [errors, setErrors] = useState<{ first: string | null; last: string | null }>({
    first: null,
    last: null,
  });
  const [saved, setSaved] = useState(false);
  const editRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLInputElement>(null);
  const lastRef = useRef<HTMLInputElement>(null);
  const returnFocus = useRef(false);

  useEffect(() => {
    if (editing) {
      firstRef.current?.focus();
    } else if (returnFocus.current) {
      returnFocus.current = false;
      editRef.current?.querySelector("button")?.focus();
    }
  }, [editing]);

  const startEditing = () => {
    setFirstName(current.firstName);
    setLastName(current.lastName);
    setErrors({ first: null, last: null });
    setSaved(false);
    update.reset();
    onEdit();
  };

  const finish = () => {
    returnFocus.current = true;
    onDone();
  };

  const cancel = () => {
    if (update.isPending) return;
    update.reset();
    finish();
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next = {
      first: validateName(firstName, "first name"),
      last: validateName(lastName, "last name"),
    };
    setErrors(next);
    if (next.first) return firstRef.current?.focus();
    if (next.last) return lastRef.current?.focus();

    if (firstName.trim() === current.firstName && lastName.trim() === current.lastName) {
      return finish();
    }

    update.mutate(
      { firstName: firstName.trim(), lastName: lastName.trim() },
      {
        onSuccess: () => {
          setSaved(true);
          finish();
        },
      },
    );
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") cancel();
  };

  if (editing) {
    return (
      <form
        noValidate
        aria-label="Edit your name"
        onSubmit={submit}
        onKeyDown={onKeyDown}
        className="flex flex-col gap-6 rounded-[24px] border-2 border-brand-500 bg-surface p-6"
      >
        <div className="flex items-center gap-4">
          <Avatar email={profile.email} large={false} />
          <p className="text-sm leading-5 text-grey-500">Photo upload is coming soon.</p>
        </div>
        <div className="flex flex-col gap-3">
          <NameField
            id={`${id}-first`}
            label="First name"
            value={firstName}
            error={errors.first}
            autoComplete="given-name"
            inputRef={firstRef}
            onChange={(value) => {
              setFirstName(value);
              setErrors((previous) => ({ ...previous, first: null }));
            }}
          />
          <NameField
            id={`${id}-last`}
            label="Last name"
            value={lastName}
            error={errors.last}
            autoComplete="family-name"
            inputRef={lastRef}
            onChange={(value) => {
              setLastName(value);
              setErrors((previous) => ({ ...previous, last: null }));
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm leading-5 font-medium text-ink wrap-anywhere">Email: {profile.email}</p>
          <a
            href="/settings"
            className="focus-ring w-fit rounded-sm text-sm leading-5 font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
          >
            Change in Settings
          </a>
        </div>
        {update.isError && (
          <p role="alert" className="text-sm leading-5 text-danger-700">
            {saveErrorMessage(update.error)}
          </p>
        )}
        <div className="flex gap-3">
          <SkillButton isPrimary={false} disabled={update.isPending} onClick={cancel}>
            Cancel
          </SkillButton>
          <SkillButton type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving" : "Save"}
          </SkillButton>
        </div>
      </form>
    );
  }

  return (
    <section
      aria-labelledby={`${id}-name`}
      className="flex flex-col items-center gap-3 rounded-[24px] border border-grey-100 bg-surface p-6 text-center"
    >
      <Avatar email={profile.email} large />
      <div className="flex min-w-0 max-w-full flex-col gap-0.5">
        <h2 id={`${id}-name`} className="text-xl leading-7 font-medium text-ink wrap-anywhere">
          {displayName(profile)}
        </h2>
        <p className="text-base leading-6 text-grey-500 wrap-anywhere">{profile.email}</p>
      </div>
      <div ref={editRef}>
        <SkillButton isPrimary={false} onClick={startEditing}>
          Edit name
        </SkillButton>
      </div>
      <p role="status" className={saved ? "text-sm leading-5 text-success-700" : "sr-only"}>
        {saved ? "Name updated." : ""}
      </p>
    </section>
  );
}