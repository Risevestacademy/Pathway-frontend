import { createFileRoute } from "@tanstack/react-router";
import AppTopNav from "../../components/AppTopNav";
import { DashboardPage } from "../../features/dashboard/components/DashboardPage";

export const Route = createFileRoute("/_protected/dashboard")({
  component: DashboardRoute,
});

function DashboardRoute() {
  return (
    <>
      <AppTopNav />
      <main className="flex flex-1 flex-col px-page-mobile pt-6 pb-10 sm:px-page-tablet lg:px-8 lg:pt-8">
        <DashboardPage />
      </main>
    </>
  );
}
