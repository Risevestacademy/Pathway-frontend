import { PageHeading } from "@/features/skillCheck/components/PageHeading";
import SettingsCard from "./SettingsCard";
import { cn } from "cn";
import { useState } from "react";
import AccountTab from "./AccountTab";
import NotificationTab from "./NotificationTab";
import PrivacyTab from "./PrivacyTab";

const TABS = ["Account", "Notifications", "Privacy and data"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Account");

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Settings"
        description="Manage your account and your data."
      />
      <div className="grid gap-4 lg:grid-cols-[24rem_minmax(0,1fr)] lg:items-start">
        <SettingsCard className={"lg:sticky lg:top-32.25 flex flex-col gap-1"}>
          {TABS.map((tab) => (
            <Tab
              key={tab}
              name={tab}
              isActive={tab === activeTab}
              onClick={() => setActiveTab(tab)}
            />
          ))}
        </SettingsCard>
        {activeTab === "Account" && <AccountTab />}
        {activeTab === "Notifications" && <NotificationTab />}
        {activeTab === "Privacy and data" && <PrivacyTab />}
      </div>
    </div>
  );
}

function Tab({
  name,
  isActive,
  onClick,
}: {
  name: string;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      className={cn(
        "w-full text-start px-3.5 py-3 rounded-lg leading-[100%] font-medium transition-colors duration-200 ease-out motion-reduce:transition-none",
        isActive ? "bg-[#f0e8ff] text-primary" : "hover:bg-muted",
      )}
      onClick={onClick}
    >
      {name}
    </button>
  );
}
