# Pathway

Pathway is a career projection tool for university students and recent grads. The idea is simple: you tell it what career you're aiming for (or browse to find one), and it shows you what that path actually looks like, expected growth, demand, and a roadmap of skills and resources to get there. You can save a pathway and track your progress on it over time.

This is the frontend for it, built as part of Rise Academy's 13-week Startup Simulator. Backend is a separate repo (NestJS + PostgreSQL), talking to this over a REST API.

## Getting it running

```bash
npm install
npm run dev
```

## Stack and why

- **Vite + React + TypeScript** for the app itself
- **Tailwind** for styling
- **TanStack Query** for anything that comes from the server (careers, pathways, progress), so we're not manually managing loading states and caches
- **Zustand** for stuff that only lives in the browser, like auth state and UI things (modals, sidebar)
- **Axios**, with one shared instance that handles attaching the auth token
- **Zod** for validating the auth forms, and generating TypeScript types straight from those schemas so they can't drift apart

## How the code is organized

Everything under `src/features/` is grouped by what it does, not what kind of file it is. So `features/auth/` has the login and signup forms together, `features/catalog/` has the career browsing stuff, and so on. If you're working on one feature, you should mostly only need to touch its own folder.

Anything used across more than one feature (a shared type, a helper function, a reusable button) goes in `lib/`, `components/`, `hooks/`, or `types/` instead of living inside a specific feature.

## Branching

Do not push straight to `main`. Branch off `dev` for whatever you're working on (`feature/career-catalog-ui`, `feature/auth-forms`, that kind of naming), open a PR into `dev`, and get at least one review before merging.

## Where things stand

Early days, still setting up the base structure. MVP scope covers the career catalog, career roadmaps, auth, and progress tracking.