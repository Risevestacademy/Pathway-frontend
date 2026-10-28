import { useEffect, useRef, useState } from "react";

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleAccountsId {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: "standard" | "icon";
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
      shape?: "rectangular" | "pill";
      width?: number;
    },
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

const GSI_SRC = "https://accounts.google.com/gsi/client";
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const MAX_BUTTON_WIDTH = 400;

type CredentialHandler = (credential: string | undefined) => void;

// Google keeps a single global callback, so initialize runs once and hands
// credentials to whichever button is mounted.
let activeHandler: CredentialHandler | null = null;
let initialized = false;

function initializeGoogle(google: GoogleApi) {
  if (initialized) return;
  initialized = true;
  google.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: ({ credential }) => activeHandler?.(credential),
  });
}

function loadGoogleScript(): Promise<GoogleApi> {
  if (window.google) return Promise.resolve(window.google);

  return new Promise((resolve, reject) => {
    let script = document.querySelector<HTMLScriptElement>(
      `script[src="${GSI_SRC}"]`,
    );
    if (!script) {
      script = document.createElement("script");
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    script.addEventListener("load", () => {
      if (window.google) resolve(window.google);
      else reject(new Error("Google sign-in did not load."));
    });
    script.addEventListener("error", () =>
      reject(new Error("Google sign-in could not be loaded.")),
    );
  });
}

export default function AuthGoogleButton({
  onAuthenticate,
}: {
  onAuthenticate: (idToken: string) => Promise<void>;
}) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const onAuthenticateRef = useRef(onAuthenticate);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    CLIENT_ID ? null : "Google sign-in isn't available right now.",
  );

  useEffect(() => {
    onAuthenticateRef.current = onAuthenticate;
  }, [onAuthenticate]);

  useEffect(() => {
    if (!CLIENT_ID) return;

    let cancelled = false;

    const handleCredential: CredentialHandler = async (credential) => {
      if (!credential) {
        setErrorMessage("Google did not return a sign-in token. Please try again.");
        return;
      }

      setErrorMessage(null);
      setIsLoading(true);
      try {
        await onAuthenticateRef.current(credential);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "We couldn't sign you in with Google. Please try again.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadGoogleScript()
      .then((google) => {
        if (cancelled || !buttonRef.current) return;
        activeHandler = handleCredential;
        initializeGoogle(google);
        google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          width: Math.min(buttonRef.current.offsetWidth || MAX_BUTTON_WIDTH, MAX_BUTTON_WIDTH),
        });
      })
      .catch((error: Error) => {
        if (!cancelled) setErrorMessage(error.message);
      });

    return () => {
      cancelled = true;
      if (activeHandler === handleCredential) activeHandler = null;
    };
  }, []);

  return (
    <>
      <div
        ref={buttonRef}
        aria-busy={isLoading}
        className={`flex min-h-10 w-full justify-center ${isLoading ? "pointer-events-none opacity-60" : ""}`}
      />
      {isLoading && (
        <p role="status" className="mt-2 text-center text-sm text-grey-500">
          Connecting to Google...
        </p>
      )}
      {errorMessage && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {errorMessage}
        </p>
      )}
    </>
  );
}
