import { createFileRoute } from "@tanstack/react-router";
import AppTopNav from "@/components/AppTopNav";
import SettingsPage from "@/features/settings/components/SettingsPage";
import * as z from "zod/mini";

// ensure that the verify email change dialog opens up by default if the page reloads
const SettingsSearchSchema = z.object({
  "verify-email": z.catch(z.optional(z.email()), undefined),
});

export const Route = createFileRoute("/_protected/settings")({
  component: SettingsRoute,
  validateSearch: SettingsSearchSchema,
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
