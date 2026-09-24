import logo from "/public/brand-logo.svg";
export default function Navbar() {
  return (
    <nav className="bg-white border-b border-line py-4 px-56 flex items-center justify-between">
      <picture>
        <img className="h-7 w-auto cursor-pointer" src={logo} alt="Logo" />
      </picture>
      <p className="text-sm text-ink-muted cursor-pointer font-medium">
        Careers
      </p>
    </nav>
  );
}
