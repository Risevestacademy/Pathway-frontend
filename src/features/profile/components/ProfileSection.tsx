import { useId } from "react";
import type { ReactNode } from "react";
import { Tag } from "../../skillCheck/components/Tag";

export function ProfileSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-3.5 rounded-[20px] border border-grey-100 bg-surface p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id={titleId} className="text-lg leading-6 font-medium text-ink">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ComingSoonSection({ title, description }: { title: string; description: string }) {
  return (
    <ProfileSection
      title={title}
      action={
        <Tag tone="neutral" className="font-medium">
          Coming soon
        </Tag>
      }
    >
      <p className="text-sm leading-5 text-grey-600">{description}</p>
    </ProfileSection>
  );
}