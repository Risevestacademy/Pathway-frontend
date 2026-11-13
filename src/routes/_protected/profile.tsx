import { createFileRoute } from "@tanstack/react-router";
import AppTopNav from "../../components/AppTopNav";
import { ProfilePage } from "../../features/profile/components/ProfilePage";

export const Route = createFileRoute("/_protected/profile")({
  component: ProfileRoute,
});

function ProfileRoute() {
  return (
    <>
      <AppTopNav />
      <main className="flex flex-1 flex-col px-page-mobile pt-6 pb-10 sm:px-page-tablet lg:px-8 lg:pt-8">
        <div className="animate-in fade-in duration-300 ease-out motion-reduce:animate-none">
          <ProfilePage />
        </div>
      </main>
    </>
  );
}