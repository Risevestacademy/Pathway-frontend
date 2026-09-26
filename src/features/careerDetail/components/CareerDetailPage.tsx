import type { ReactNode } from "react";
import Navbar from "../../../components/Navbar";

export default function CareerDetailPage({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col bg-canvas">
      <Navbar />
      <div
        className="
          mx-auto w-full max-w-3xl
          px-page-mobile pt-6 pb-16
          sm:px-page-tablet
          lg:pt-10
        "
      >
        {children}
      </div>
    </main>
  );
}
