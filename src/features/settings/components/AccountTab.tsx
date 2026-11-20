import SettingsCard from "./SettingsCard";
import SettingsItem from "./SettingsItem";
import { Button } from "@/components/ui/Button";

const SignInDetails = [
  {
    heading: "Sign-in details",
    desc: "The email and password you use to sign in.",
    isHeader: true,
  },
  {
    heading: "Email",
    desc: "Your email address.",
  },
  {
    heading: "Password",
    desc: "Your password.",
  },
];

export default function AccountTab() {
  return (
    <div className="flex flex-col gap-4 animate-landing-fade-up fade-in duration-300 ease-out motion-reduce:animate-none">
      <SettingsCard className="p-0">
        {SignInDetails.map((item, index) => (
          <SettingsItem
            key={index}
            isHeader={item.isHeader}
            heading={item.heading}
            desc={item.desc}
            border={index !== SignInDetails.length - 1}
          >
            {!item.isHeader && <Button isPrimary={false}>Change</Button>}
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
          <Button isPrimary={false}>Sign out</Button>
        </SettingsItem>
      </SettingsCard>
    </div>
  );
}
