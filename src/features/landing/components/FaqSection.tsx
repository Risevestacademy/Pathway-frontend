import clsx from "clsx";
import { Accordion } from "radix-ui";
import { Minus, Plus } from "lucide-react";
import { FAQS, FAQ_SECTION } from "../landing.copy";
import { container, eyebrow, sectionHeading } from "../landing.styles";

/**
 * Single-open accordion, first item open on load, height animated with the
 * tw-animate accordion keyframes (driven by --radix-accordion-content-height).
 */
export default function FaqSection() {
  return (
    <section aria-labelledby="landing-faq-heading" className="bg-white pt-[120px]">
      {/* Question column starts at 540/1064 of the content width, as in the export. */}
      <div className={clsx(container, "grid gap-10 lg:grid-cols-[50.75%_1fr] lg:gap-0")}>
        <div>
          <p className={eyebrow}>{FAQ_SECTION.eyebrow}</p>
          <h2 id="landing-faq-heading" className={clsx(sectionHeading, "mt-2 max-w-[400px]")}>
            {FAQ_SECTION.heading}
          </h2>
        </div>

        <Accordion.Root
          type="single"
          collapsible
          defaultValue={FAQ_SECTION.defaultOpen}
          className="flex flex-col gap-5"
        >
          {FAQS.map((faq) => (
            <Accordion.Item
              key={faq.id}
              value={faq.id}
              className="rounded-2xl bg-grey-50 p-4 pl-5 transition-colors duration-150 hover:bg-grey-100 motion-reduce:transition-none"
            >
              <Accordion.Header asChild>
                <h3 className="m-0">
                  <Accordion.Trigger
                    className={clsx(
                      "group flex w-full cursor-pointer items-center justify-between gap-4 text-left",
                      "focus-ring rounded-lg font-landing-body text-base font-medium text-ink",
                    )}
                  >
                    {faq.question}
                    <span
                      aria-hidden
                      className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-white text-brand-400 shadow-[0_2px_6px_rgb(16_16_29/0.08)] ring-1 ring-brand-100"
                    >
                      <Plus size={18} strokeWidth={1.75} className="group-data-[state=open]:hidden" />
                      <Minus size={18} strokeWidth={1.75} className="hidden group-data-[state=open]:block" />
                    </span>
                  </Accordion.Trigger>
                </h3>
              </Accordion.Header>
              <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:animate-none">
                <p className="mt-3 rounded-xl bg-white px-5 py-4 font-landing-body text-base leading-6 text-grey-500">
                  {faq.answer}
                </p>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}
