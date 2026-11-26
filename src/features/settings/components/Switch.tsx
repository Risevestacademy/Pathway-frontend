export default function Switch({
  name,
  onChange,
  checked,
  disabled = false,
}: {
  name?: string;
  onChange?: () => void;
  checked?: boolean;
  disabled?: boolean;
}) {
  return (
    <input
      type="checkbox"
      role="switch"
      name={name}
      aria-label={name}
      className="appearance-none w-11.5 h-7 rounded-[14px] bg-grey-300 relative transition-colors duration-200 ease-[ease] cursor-pointer
          before:content-[''] before:absolute before:w-5.5 before:h-5.5 before:rounded-full before:bg-surface before:top-0.75 
          before:left-0.75 before:transition-transform before:duration-200 before:ease-[ease] checked:before:translate-x-4.75 checked:bg-brand-500 
          focus-visible:outline-[3px_solid_#9860f7] focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-50"
      onChange={onChange}
      checked={checked}
      disabled={disabled}
    />
  );
}
