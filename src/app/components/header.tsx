import { FileText, PenLine } from "lucide-react";
import { NavChip } from "./chip";
import { ThemeToggle } from "./theme-toggle";
import "./header.css";

const NAV = [
  { id: "01", label: "ABOUT", href: "#about" },
  { id: "02", label: "WORK", href: "#work" },
  { id: "03", label: "JOURNEY", href: "#journey" },
  { id: "04", label: "EXTRAS", href: "#extras" },
  { id: "05", label: "CONTACT", href: "#contact" },
]; // #about targets the Technical/Personal panels section (about.tsx), which
   // sits above #work on the page even though the nav lists WORK first.

export function Header() {
  return (
    <header className="site-header fixed top-0 inset-x-0 z-40 backdrop-blur-md">
      <div className="mx-auto max-w-[1200px] px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <span className="site-header__wordmark font-mono tracking-wide">
            RAWN.DEV
          </span>
          <span className="site-header__status flex items-center gap-1.5 font-mono">
            <span className="relative flex h-2 w-2">
              <span className="site-header__dot absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" />
              <span className="site-header__dot site-header__dot--lit relative inline-flex rounded-full h-2 w-2" />
            </span>
            [ ONLINE ]
          </span>
        </div>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="site-header__link font-mono transition-colors duration-200 hover:text-[var(--brand)]"
            >
              <span className="site-header__link-num">{item.id}</span> // {item.label}
            </a>
          ))}
        </nav>

        {/* Route links + theme switch */}
        <div className="flex items-center gap-2 sm:gap-3">
          <NavChip to="/resume" icon={FileText} label="RESUME" />
          <NavChip to="/blog" icon={PenLine} label="BLOG" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
