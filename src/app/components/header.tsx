import { FileText, Menu, PenLine, X } from "lucide-react";
import { useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header fixed top-0 inset-x-0 z-40 backdrop-blur-md">
      <div className="mx-auto max-w-[1200px] px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <span className="site-header__wordmark font-mono tracking-wide">
            RAWN.DEV
          </span>
        </div>

        {/* Center slot: a flexible middle child, so its content sits centered
            in whatever space is actually left between the logo and chip
            columns (which aren't the same width) rather than at the
            geometric center of the whole bar. */}
        <div className="flex-1 flex justify-center min-w-0">
          {/* Desktop nav */}
          <nav className="hidden min-[1105px]:flex items-center gap-8">
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

          {/* Collapses in below 1105px */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="site-header-menu"
            className="site-header__burger hidden max-[1104px]:flex items-center justify-center"
          >
            {menuOpen ? (
              <X size={20} strokeWidth={2} aria-hidden="true" />
            ) : (
              <Menu size={20} strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Route links + theme switch */}
        <div className="flex items-center gap-2 sm:gap-3">
          <NavChip to="/resume" icon={FileText} label="RESUME" />
          <NavChip to="/blog" icon={PenLine} label="BLOG" />
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile nav drawer */}
      {menuOpen && (
        <nav
          id="site-header-menu"
          className="site-header__menu min-[1105px]:hidden flex flex-col"
        >
          {NAV.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="site-header__link site-header__link--mobile font-mono transition-colors duration-200 hover:text-[var(--brand)]"
            >
              <span className="site-header__link-num">{item.id}</span> // {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
