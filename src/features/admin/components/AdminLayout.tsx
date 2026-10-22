import { Link, Outlet } from "@tanstack/react-router";
import clsx from "clsx";
import type { ReactNode } from "react";
import {
  Bell,
  BriefcaseBusiness,
  CircleAlert,
  LayoutGrid,
  SquareCheckBig,
  UsersRound,
} from "lucide-react";
import avatar from "../../../assets/images/admin-avatar.png";
import { useAdminStore } from "../adminStore";
import { isOpenReport } from "../admin.workflow";

const navClass =
  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium focus-ring";

function CountBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="grid min-w-5 place-items-center rounded-pill bg-danger-600 px-1.5 text-xs font-semibold text-white">
      {count}
      <span className="sr-only"> waiting</span>
    </span>
  );
}

export function AdminLayout() {
  const pendingReviews = useAdminStore((s) => s.reviews.filter((r) => r.status === "pending").length);
  const openReports = useAdminStore((s) => s.reports.filter(isOpenReport).length);

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-page-mobile py-4 sm:px-page-tablet lg:px-8">
        <nav
          aria-label="Admin"
          className="flex items-center gap-1 overflow-x-auto rounded-xl bg-surface-muted p-1"
        >
          <Link
            to="/admin"
            activeOptions={{ exact: true }}
            className={clsx(navClass, "text-ink-muted")}
            activeProps={{ className: "bg-grey-900 !text-white" }}
          >
            <LayoutGrid className="size-5" aria-hidden />
            Overview
          </Link>
          <Link
            to="/admin/careers"
            className={clsx(navClass, "text-ink-muted")}
            activeProps={{ className: "bg-grey-900 !text-white" }}
          >
            <BriefcaseBusiness className="size-5" aria-hidden />
            Careers
          </Link>
          <Link
            to="/admin/reviews"
            className={clsx(navClass, "text-ink-muted")}
            activeProps={{ className: "bg-grey-900 !text-white" }}
          >
            <SquareCheckBig className="size-5" aria-hidden />
            Reviews
            <CountBadge count={pendingReviews} />
          </Link>
          <Link
            to="/admin/reports"
            className={clsx(navClass, "text-ink-muted")}
            activeProps={{ className: "bg-grey-900 !text-white" }}
          >
            <CircleAlert className="size-5" aria-hidden />
            Reports
            <CountBadge count={openReports} />
          </Link>
          <Link
            to="/admin/team"
            className={clsx(navClass, "text-ink-muted")}
            activeProps={{ className: "bg-grey-900 !text-white" }}
          >
            <UsersRound className="size-5" aria-hidden />
            Team
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Notifications"
            className="grid size-10 place-items-center rounded-pill border border-line-strong text-ink-muted focus-ring"
          >
            <Bell className="size-5" aria-hidden />
          </button>
          <span className="rounded-lg bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">
            Content admin
          </span>
          <img
            src={avatar}
            alt=""
            aria-hidden
            draggable={false}
            className="size-10 rounded-pill object-cover"
          />
        </div>
      </header>

      <Outlet />
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-ink-muted">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
