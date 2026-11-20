import SettingsItem from "./SettingsItem";
import SettingsCard from "./SettingsCard";
import { Button } from "@/components/ui/Button";
import Switch from "./Switch";

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
  },
  {
    heading: "Usage analytics",
    desc: "Helps us improve Pathway, Anonymous and optional.",
    actionType: "switch",
  },
];

export default function PrivacyTab() {
  return (
    <div className="flex flex-col gap-4 animate-landing-fade-up fade-in duration-300 ease-out motion-reduce:animate-none">
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
                className="bg-[#f0e8ff] text-primary px-3.5 py-2 rounded-lg font-medium"
              >
                Download
              </Button>
            )}
            {item.actionType === "switch" && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  On
                </span>
                <Switch />
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
            className="bg-[#c72e2e]! border-[#8c1a1a]! text-white hover:bg-[#8c1a1a] hover:border-[#8c1a1a]"
          >
            Delete account
          </Button>
        </SettingsItem>
      </SettingsCard>
    </div>
  );
}
