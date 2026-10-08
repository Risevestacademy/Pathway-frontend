import type { ReactNode } from "react";
import signupArtwork from "../../../assets/images/auth-signup-artwork.svg";
import loginArtwork from "../../../assets/images/auth-login-artwork.svg";

interface AuthLayoutProps {
  children: ReactNode;
  variant: "signup" | "login";
}

export default function AuthLayout({ children, variant }: AuthLayoutProps) {
  return (
    <div className="auth-page-flex">
      <section className="auth-form-panel">
        <div className="w-full max-w-sm py-2 sm:py-0">{children}</div>
      </section>

      <aside className="auth-art-panel" aria-hidden="true">
        <img
          src={variant === "signup" ? signupArtwork : loginArtwork}
          alt=""
          draggable={false}
          className="auth-artwork"
        />
      </aside>
    </div>
  );
}
