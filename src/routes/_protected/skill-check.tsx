import { Outlet, createFileRoute } from "@tanstack/react-router";
import AppTopNav from "../../components/AppTopNav";

export const Route = createFileRoute("/_protected/skill-check")({
  component: SkillCheckLayout,
});

function SkillCheckLayout() {
  return (
    <div className="min-h-dvh bg-grey-50">
      <AppTopNav />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
