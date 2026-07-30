import { FileText, PenLine } from "lucide-react";
import { NavChip } from "./chip";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { id: "01", label: "WORK", href: "#work" },
  { id: "02", label: "ABOUT", href: "#about" },
  { id: "03", label: "EXTRAS", href: "#extras" },
  { id: "04", label: "CONTACT", href: "#contact" },
]; // #about targets the Technical/Personal panels section (about.tsx), which
   // sits above #work on the page even though the nav lists WORK first.

export function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md" style={{ background: "var(--header-bg)", borderBottom: "1px solid var(--hairline)" }}>
      <div className="mx-auto max-w-[1200px] px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <span className="font-mono tracking-wide" style={{ color: "var(--fg)", fontWeight: 700, fontSize: 15 }}>
            RAWN.DEV
          </span>
          <span className="flex items-center gap-1.5 font-mono" style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.1em" }}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style={{ background: "var(--online)" }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "var(--online)", boxShadow: "0 0 8px var(--online)" }} />
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
              className="font-mono transition-colors duration-200 hover:text-[var(--brand)]"
              style={{ fontSize: 12, letterSpacing: "0.12em", color: "var(--text-muted)" }}
            >
              <span style={{ color: "var(--brand)" }}>{item.id}</span> // {item.label}
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
