import type { ReactNode } from "react";
import AppTopNav from "@/components/AppTopNav";

/** Frame for the roadmap, step and resources pages: the app nav, then a centred column. */
export default function RoadmapPage({ children }: { children: ReactNode }) {
  return (
    <>
      <AppTopNav />
      <main className="flex flex-1 flex-col px-page-mobile pt-6 pb-16 sm:px-page-tablet lg:px-8 lg:pt-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col animate-in fade-in duration-300 ease-out motion-reduce:animate-none">
          {children}
        </div>
      </main>
    </>
  );
}
