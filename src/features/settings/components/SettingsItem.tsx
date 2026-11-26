import { cn } from "cn";

export default function SettingsItem({
  isHeader = false,
  heading,
  desc,
  children,
  border = true,
}: {
  isHeader?: boolean;
  heading: string;
  desc?: string;
  children?: React.ReactNode;
  border?: boolean;
}) {
  return (
    <div className={cn(border && "border-b border-border")}>
      <div
        className={cn(
          "py-4.5 px-6 flex items-center justify-between gap-4",
          isHeader && "py-5",
        )}
      >
        <div className="flex flex-col gap-1">
          <h3 className="font-medium text-[18px] leading-[100%]">{heading}</h3>
          {desc && <p className="text-sm text-muted-foreground">{desc}</p>}
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
