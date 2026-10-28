import type { ReactNode } from "react";
import AppTopNav from "@/components/AppTopNav";

export default function CareerFrame({ children }: { children: ReactNode }) {
  return (
    <>
      <AppTopNav />
      <main className="flex flex-1 flex-col px-page-mobile pt-6 pb-10 sm:px-page-tablet lg:px-8 lg:pt-8">
        <div className="flex flex-col animate-in fade-in duration-300 ease-out motion-reduce:animate-none">
          {children}
        </div>
      </main>
    </>
  );
}
