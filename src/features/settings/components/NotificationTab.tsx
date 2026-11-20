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
}

const NotificationsItems: NotificationItem[] = [
  {
    id: "roadmap",
    heading: "Roadmap updates",
    desc: "When a step or resource in our pathway changes.",
  },
  {
    id: "openings",
    heading: "New openings",
    desc: "Opportunities that match your saved careers or current pathway.",
  },
  {
    id: "feedback",
    heading: "Replies to your feedback",
    desc: "When our team answers someting you reported.",
  },
  {
    id: "resource",
    heading: "Resource link problems",
    desc: "When a link in your pathway is withdrawn or replaced.",
  },
  {
    id: "reminders",
    heading: "Learning reminders",
    desc: "A nudge when you have not marked a step in a while.",
  },
  {
    id: "streak",
    heading: "Streak nudges",
    desc: "A reminder when your streak is about to end.",
  },
];

export default function NotificationTab() {
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
    <div className="flex flex-col gap-4">
      <p className="p-4.5 rounded-lg bg-[#eeeef0] text-[14px]">
        Changes save as you make them. We will still email you about account
        security, such as a password change.
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
                className="py-4 px-6 font-medium text-[14px] leading-[100%] bg-[#fafafc] text-muted-foreground"
              >
                In-app
              </th>
              <th
                scope="col"
                className="py-4 px-6 font-medium text-[14px] leading-[100%] bg-[#fafafc] text-muted-foreground"
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

                <td className="py-4 px-6 text-center">
                  <Switch
                    aria-label={`${each.heading} - In-app`}
                    onChange={() => togglePreference(each.id, "inApp")}
                    checked={preferences[each.id].inApp}
                  />
                </td>

                <td className="py-4 px-6 text-center">
                  <Switch
                    aria-label={`${each.heading} - Email`}
                    onChange={() => togglePreference(each.id, "email")}
                    checked={preferences[each.id].email}
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
