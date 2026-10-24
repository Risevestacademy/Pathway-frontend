import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button";
import googleIcon from "../../../assets/icons/flat-color-icons_google.svg";

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleAccountsId {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  prompt: (
    momentListener?: (notification: {
      isNotDisplayed: () => boolean;
      isSkippedMoment: () => boolean;
      isDismissedMoment: () => boolean;
      getNotDisplayedReason?: () => string;
      getSkippedReason?: () => string;
      getDismissedReason?: () => string;
    }) => void,
  ) => void;
}

interface GoogleApi {
  accounts: {
    id: GoogleAccountsId;
  };
}

declare global {
  interface Window {
    google?: GoogleApi;
  }
}

export default function AuthGoogleButton({
  onAuthenticate,
}: {
  onAuthenticate: (idToken: string) => Promise<void>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (
      document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]',
      )
    ) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  const handleGoogleAuth = () => {
    setErrorMessage(null);
    setIsLoading(true);

    const google = window.google;
    if (!google) {
      setIsLoading(false);
      setErrorMessage("Google sign-in is still loading. Please try again.");
      return;
    }

    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async ({ credential }) => {
        if (!credential) {
          setIsLoading(false);
          setErrorMessage(
            "Google did not return a sign-in token. Please try again.",
          );
          return;
        }

        try {
          await onAuthenticate(credential);
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "We couldn't sign you in with Google. Please try again.",
          );
        } finally {
          setIsLoading(false);
        }
      },
    });
    google.accounts.id.prompt((notification) => {
      if (
        notification.isNotDisplayed() ||
        notification.isSkippedMoment() ||
        notification.isDismissedMoment()
      ) {
        setIsLoading(false);
        setErrorMessage(
          "Google sign-in was not completed. Please try again.",
        );
      }
    });
  };

  return (
    <>
      <Button
        type="button"
        isPrimary={false}
        onClick={handleGoogleAuth}
        disabled={isLoading}
        className="w-full gap-2"
      >
        <img src={googleIcon} alt="" aria-hidden className="size-5" />
        {isLoading ? "Connecting to Google..." : "Continue with Google"}
      </Button>
      {errorMessage && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {errorMessage}
        </p>
      )}
    </>
  );
}
