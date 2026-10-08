import clsx from "clsx";
import type { ReactNode } from "react";
import documentIcon from "@/assets/icons/document-icon.svg";
import step1Preview from "@/assets/images/onboarding-step-1.png";
import step2Preview from "@/assets/images/onboarding-step-2.png";

export type OnboardingStep = 1 | 2;

const PREVIEW_IMAGES: Record<OnboardingStep, string> = {
  1: step1Preview,
  2: step2Preview,
};

export function OnboardingLayout({
  step,
  children,
}: {
  step: OnboardingStep;
  children: ReactNode;
}) {
  return (
    <main className="flex flex-1">
      <div className="flex flex-1 items-center justify-center px-page-mobile py-6 sm:px-page-tablet">
        <div className="w-full max-w-116.25 animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out motion-reduce:animate-none">
          {children}
        </div>
      </div>

      <div aria-hidden className="hidden shrink-0 self-start xl:sticky xl:top-shell-inset xl:block">
        <img
          src={PREVIEW_IMAGES[step]}
          alt=""
          draggable={false}
          className="h-[calc(100svh-var(--spacing-shell-inset))] w-auto max-w-none animate-in select-none fade-in slide-in-from-right-6 duration-700 ease-out motion-reduce:animate-none"
        />
      </div>
    </main>
  );
}

interface StepHeaderProps {
  step: OnboardingStep;
  titleId: string;
  title: string;
  description: string;
}

export function StepHeader({
  step,
  titleId,
  title,
  description,
}: StepHeaderProps) {
  return (
    <header className="mb-6.75">
      <img src={documentIcon} alt="" className="size-12 p-1" />
      <p className="mt-4 text-body-md-bold text-brand-600">
        <span aria-hidden>{step}/2</span>
        <span className="sr-only">Step {step} of 2</span>
      </p>
      <h1 id={titleId} className="mt-2 font-display text-heading text-ink">
        {title}
      </h1>
      <p className="mt-2 text-body-md text-ink-muted">{description}</p>
    </header>
  );
}

export function StepDots({ step }: { step: OnboardingStep }) {
  return (
    <div aria-hidden className="flex items-center justify-center gap-2 py-8">
      {[1, 2].map((n) => (
        <span
          key={n}
          className={clsx(
            "size-2 rounded-pill",
            n === step ? "bg-brand-500" : "bg-grey-100",
          )}
        />
      ))}
    </div>
  );
}