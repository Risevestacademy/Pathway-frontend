import { createFileRoute } from "@tanstack/react-router";
import { usePostHog } from "@posthog/react";
import { Button } from "../components/ui/Button";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const posthog = usePostHog();

  const handleTestEvent = () => {
    posthog.capture("posthog_test_button_clicked", {
      source: "home_page",
    });
  };

  return (
    <main>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Pathway</h1>
          <Button
            onClick={handleTestEvent}
            className="mt-4 px-4 py-2 cursor-pointer"
          >
            Send test PostHog event
          </Button>
        </div>
      </div>
    </main>
  );
}