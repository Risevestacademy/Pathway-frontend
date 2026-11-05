import { cn } from "cn";

export default function SubNav({
  categories,
  active = "All",
  setActive,
}: {
  categories: string[];
  active: string;
  setActive: (category: string) => void;
}) {
  return (
    <ul className="flex gap-1.5 pt-8 pb-10">
      {categories.map((category, idx) => (
        <li
          key={idx}
          tabIndex={0}
          className={cn(
            "py-2 px-3 border rounded-md border-grey-50 hover:bg-brand-50 cursor-pointer font-medium text-base tracking-tight text-grey-500",
            "transition duration-300",
            active === category &&
              "bg-brand-100 hover:bg-brand-100 text-brand-700",
          )}
          onClick={() => setActive(category)}
        >
          {category}
        </li>
      ))}
    </ul>
  );
}
