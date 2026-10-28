import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "../../lib/stores/authStore";
import { isAdminRole } from "../../features/admin/admin.utils";
import { AdminLayout } from "../../features/admin/components/AdminLayout";

export const Route = createFileRoute("/_protected/admin")({
  beforeLoad: () => {
    if (!isAdminRole(useAuthStore.getState().user?.role)) {
      throw redirect({ to: "/" });
    }
  },
  component: AdminLayout,
});
