import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import AppTopNav from "../../components/AppTopNav";

export const Route = createFileRoute("/_protected/skill-check")({
  component: SkillCheckLayout,
});

function SkillCheckLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <>
      <AppTopNav />
      <main className="flex flex-1 flex-col px-page-mobile pt-6 pb-10 sm:px-page-tablet lg:px-8 lg:pt-8">
        <div
          key={pathname}
          className="flex flex-col gap-6 animate-in fade-in duration-300 ease-out motion-reduce:animate-none"
        >
          <Outlet />
        </div>
      </main>
    </>
  );
}
