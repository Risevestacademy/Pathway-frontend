/// <reference types="vitest/config" />
import path from "node:path";
import { execSync } from "node:child_process";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";

function resolveRelease(): string {
  if (process.env.VITE_APP_VERSION) return process.env.VITE_APP_VERSION;
  if (process.env.VERCEL_GIT_COMMIT_SHA)
    return process.env.VERCEL_GIT_COMMIT_SHA;
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;

  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

const release = resolveRelease();
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;

const sentryEnvironment =
  process.env.VITE_SENTRY_ENVIRONMENT ?? process.env.VERCEL_ENV;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    sentryVitePlugin({
      disable: !sentryAuthToken,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: sentryAuthToken,
      release: { name: release },
      sourcemaps: {
        filesToDeleteAfterUpload: ["./dist/**/*.map"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(release),
    ...(sentryEnvironment
      ? {
          "import.meta.env.VITE_SENTRY_ENVIRONMENT":
            JSON.stringify(sentryEnvironment),
        }
      : {}),
  },
  build: {
    sourcemap: "hidden",
  },
  test: {
    environment: "jsdom",
  },
});
