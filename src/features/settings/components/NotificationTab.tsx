import SettingsCard from "./SettingsCard";
import { cn } from "cn";
import Switch from "./Switch";
import { useState } from "react";

type NotificationId =
  "roadmap" | "openings" | "feedback" | "resource" | "reminders" | "streak";

interface NotificationItem {
  id: NotificationId;
  heading: string;
  desc: string;
  disabled: boolean;
}

const NotificationsItems: NotificationItem[] = [
  {
    id: "roadmap",
    heading: "Roadmap updates",
    desc: "When a step or resource in our pathway changes.",
    disabled: true,
  },
  {
    id: "openings",
    heading: "New openings",
    desc: "Opportunities that match your saved careers or current pathway.",
    disabled: true,
  },
  {
    id: "feedback",
    heading: "Replies to your feedback",
    desc: "When our team answers something you reported.",
    disabled: true,
  },
  {
    id: "resource",
    heading: "Resource link problems",
    desc: "When a link in your pathway is withdrawn or replaced.",
    disabled: true,
  },
  {
    id: "reminders",
    heading: "Learning reminders",
    desc: "A nudge when you have not marked a step in a while.",
    disabled: true,
  },
  {
    id: "streak",
    heading: "Streak nudges",
    desc: "A reminder when your streak is about to end.",
    disabled: true,
  },
];

export default function NotificationTab({ index }: { index: number }) {
  const [preferences, setPreferences] = useState({
    roadmap: { inApp: true, email: true },
    openings: { inApp: true, email: true },
    feedback: { inApp: true, email: true },
    resource: { inApp: true, email: true },
    reminders: { inApp: true, email: true },
    streak: { inApp: true, email: true },
  });

  const togglePreference = (id: NotificationId, channel: "inApp" | "email") => {
    setPreferences((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [channel]: !prev[id][channel],
      },
    }));
  };

  return (
    <div
      role="tabpanel"
      id={`panel-${index}`}
      aria-labelledby={`tab-${index}`}
      className="flex flex-col gap-4"
    >
      {/* <p className="p-4.5 rounded-lg bg-grey-50 text-[14px]">
        Changes save as you make them. We will still email you about account
        security, such as a password change.
      </p> */}
      <p className="p-4.5 rounded-lg bg-grey-50 text-[14px]">
        (Coming soon) Update your notification preference.
      </p>
      <SettingsCard
        aria-labelledby="notification-heading"
        className="animate-landing-fade-up fade-in duration-300 ease-out motion-reduce:animate-none p-0"
      >
        <h2
          id="notification-heading"
          className="py-5 px-6 font-medium text-[18px] leading-[100%] border-b border-border"
        >
          What we tell you
        </h2>

        <table className="w-full">
          <caption className="sr-only">
            Manage your notification preferences
          </caption>

          <thead>
            <tr>
              <th scope="col" className="sr-only">
                Notification type
              </th>
              <th
                scope="col"
                className="py-4 px-6 font-medium text-[14px] leading-[100%] bg-grey-50/60 text-muted-foreground"
              >
                In-app
              </th>
              <th
                scope="col"
                className="py-4 px-6 font-medium text-[14px] leading-[100%] bg-grey-50/60 text-muted-foreground"
              >
                Email
              </th>
            </tr>
          </thead>

          {NotificationsItems.map((each, idx) => (
            <tbody key={idx}>
              <tr
                className={cn(
                  idx !== NotificationsItems.length - 1 &&
                    "border-b border-border",
                )}
              >
                <th scope="row" className="flex flex-col gap-1 py-4 px-6">
                  <h3 className="font-medium text-start text-body-md md:text-[18px] leading-[100%]">
                    {each.heading}
                  </h3>
                  <p className="text-[12px] md:text-sm font-medium text-start text-muted-foreground">
                    {each.desc}
                  </p>
                </th>

                <td className="py-2 px-3 sm:py-4 sm:px-6 text-center">
                  <Switch
                    key={each.id}
                    name={`${each.heading} - In-app`}
                    onChange={() => togglePreference(each.id, "inApp")}
                    checked={preferences[each.id].inApp}
                    disabled={each.disabled}
                  />
                </td>

                <td className="py-2 px-3 sm:py-4 sm:px-6 text-center">
                  <Switch
                    key={each.id}
                    name={`${each.heading} - Email`}
                    onChange={() => togglePreference(each.id, "email")}
                    checked={preferences[each.id].email}
                    disabled={each.disabled}
                  />
                </td>
              </tr>
            </tbody>
          ))}
        </table>
      </SettingsCard>
    </div>
  );
}
