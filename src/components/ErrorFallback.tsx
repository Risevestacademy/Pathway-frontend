import { Link } from "@tanstack/react-router";

type ErrorFallbackProps = {
  resetError?: () => void;
};

export default function ErrorFallback({ resetError }: ErrorFallbackProps) {
  return (
    <main className="p-6 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2">Please try again or return home.</p>
      <div className="mt-4 flex gap-4">
        {resetError && (
          <button type="button" onClick={resetError} className="underline">
            Try again
          </button>
        )}
        <Link to="/" className="underline">
          Return home
        </Link>
      </div>
    </main>
  );
}
