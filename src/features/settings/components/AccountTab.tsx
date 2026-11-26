import SettingsCard from "./SettingsCard";
import SettingsItem from "./SettingsItem";
import { Button } from "@/components/ui/Button";
import { SignOutDialog } from "@/features/auth/components/SignOutDialog";
import { useState } from "react";
import ChangeEmailDialog from "./ChangeEmailDialog";
import { getRouteApi } from "@tanstack/react-router";
import ChangePasswordDialog from "./ChangePasswordDialog";
import { useAuthStore } from "@/lib/stores/authStore";

type OpenDialog = "sign-out" | "change-email" | "change-password" | null;

const SignInDetails: {
  action: OpenDialog;
  heading: string;
  desc: string;
  isHeader?: boolean;
}[] = [
  {
    action: null,
    heading: "Sign-in details",
    desc: "The email and password you use to sign in.",
    isHeader: true,
  },
  {
    action: "change-email",
    heading: "Email",
    desc: "",
  },
  {
    action: "change-password",
    heading: "Password",
    desc: "********",
  },
];

const routeApi = getRouteApi("/_protected/settings");

export default function AccountTab({ index }: { index: number }) {
  const user = useAuthStore((state) => state.user);
  const userEmail = user?.email || "";
  const { "verify-email": verifyEmail } = routeApi.useSearch();
  const [openDialog, setOpenDialog] = useState<OpenDialog>(
    verifyEmail ? "change-email" : null,
  );
  const navigate = routeApi.useNavigate();

  const handleDialogClose = () => {
    setOpenDialog(null);
    navigate({
      search: (prev) => ({ ...prev, "verify-email": undefined }),
    });
  };

  return (
    <>
      <div
        role="tabpanel"
        id={`panel-${index}`}
        aria-labelledby={`tab-${index}`}
        className="flex flex-col gap-4 animate-landing-fade-up fade-in duration-300 ease-out motion-reduce:animate-none"
      >
        <SettingsCard className="p-0">
          {SignInDetails.map((item, index) => (
            <SettingsItem
              key={index}
              isHeader={item.isHeader}
              heading={item.heading}
              desc={item.action === "change-email" ? userEmail : item.desc}
              border={index !== SignInDetails.length - 1}
            >
              {item.action && (
                <Button
                  aria-label={item.action.replace("-", " ")}
                  onClick={() => setOpenDialog(item.action)}
                  isPrimary={false}
                >
                  Change
                </Button>
              )}
            </SettingsItem>
          ))}
        </SettingsCard>

        <SettingsCard className="p-0">
          <SettingsItem isHeader={true} heading="This device" />
          <SettingsItem
            heading="Sign out"
            desc="Sign out of Pathway on this device"
            border={false}
          >
            <Button onClick={() => setOpenDialog("sign-out")} isPrimary={false}>
              Sign out
            </Button>
          </SettingsItem>
        </SettingsCard>
      </div>

      <SignOutDialog
        open={openDialog === "sign-out"}
        onClose={handleDialogClose}
      />

      <ChangeEmailDialog
        open={openDialog === "change-email"}
        onClose={handleDialogClose}
      />

      <ChangePasswordDialog
        open={openDialog === "change-password"}
        onClose={handleDialogClose}
      />
    </>
  );
}
