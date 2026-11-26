import { createFileRoute } from "@tanstack/react-router";
import AppTopNav from "@/components/AppTopNav";
import SettingsPage from "@/features/settings/components/SettingsPage";

export const Route = createFileRoute("/_protected/settings")({
  component: SettingsRoute,
});

function SettingsRoute() {
  return (
    <>
      <AppTopNav />
      <main className="flex flex-1 flex-col px-page-mobile pt-6 pb-10 sm:px-page-tablet lg:px-8 lg:pt-8">
        <div className="animate-in fade-in duration-300 ease-out motion-reduce:animate-none">
          <SettingsPage />
        </div>
      </main>
    </>
  );
}
