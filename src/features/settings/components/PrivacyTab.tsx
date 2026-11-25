import SettingsItem from "./SettingsItem";
import SettingsCard from "./SettingsCard";
import { Button } from "@/components/ui/Button";
import Switch from "./Switch";
import DeleteAccountDialog from "./DeleteAccountDialog";
import { useState } from "react";

const PrivacyItems = [
  {
    heading: "Your data",
    desc: "We keep only what the product needs. You decide what stays.",
    isHeading: true,
  },
  {
    heading: "Download my data",
    desc: "Get a copy of our profile, pathway and progress as a file.",
    actionType: "button",
    disable: true,
  },
  {
    heading: "Usage analytics",
    desc: "Helps us improve Pathway, Anonymous and optional.",
    actionType: "switch",
  },
];

export default function PrivacyTab({ index }: { index: number }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [enableAnalytics, setEnableAnalytics] = useState(false);

  return (
    <>
      <div
        role="tabpanel"
        id={`panel-${index}`}
        aria-labelledby={`tab-${index}`}
        className="flex flex-col gap-4 animate-landing-fade-up fade-in duration-300 ease-out motion-reduce:animate-none"
      >
        <SettingsCard className="p-0">
          {PrivacyItems.map((item, index) => (
            <SettingsItem
              key={index}
              isHeader={item.isHeading}
              heading={item.heading}
              desc={item.desc}
              border={index !== PrivacyItems.length - 1}
            >
              {item.actionType === "button" && (
                <Button
                  isPrimary={false}
                  className="text-primary px-3.5 py-2 rounded-lg font-medium"
                  disabled={item.disable}
                >
                  Download
                </Button>
              )}
              {item.actionType === "switch" && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    {enableAnalytics ? "On" : "Off"}
                  </span>
                  <Switch
                    checked={enableAnalytics}
                    onChange={() => setEnableAnalytics((value) => !value)}
                    disabled
                  />
                </div>
              )}
            </SettingsItem>
          ))}
        </SettingsCard>

        <SettingsCard className="p-0">
          <SettingsItem isHeader={true} heading="Delete account" />
          <SettingsItem
            heading="Delete my account"
            desc="Permanently removes your profile, pathway and progress. This cannot be undone."
            border={false}
          >
            <Button
              isPrimary={false}
              className="bg-danger-600! border-danger-700! text-white hover:bg-danger-700 hover:border-danger-700"
              onClick={() => setOpenDialog(true)}
            >
              Delete account
            </Button>
          </SettingsItem>
        </SettingsCard>
      </div>
      <DeleteAccountDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      />
    </>
  );
}
