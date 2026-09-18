import { createFileRoute } from "@tanstack/react-router";
import { usePostHog } from "@posthog/react";

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
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Pathway</h1>
        <button
          type="button"
          onClick={handleTestEvent}
          className="mt-4 rounded bg-black px-4 py-2 text-white hover:bg-gray-800 active:bg-gray-900 cursor-pointer"
        >
          Send test PostHog event
        </button>
      </div>
    </div>
  );
}
