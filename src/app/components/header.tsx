import { FileText, Menu, PenLine, Waypoints, X } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
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

// Breathing room the inline nav must have on top of its own width before it's
// allowed to show, so it never sits flush against the logo or the chips.
const NAV_FIT_MARGIN = 64;

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const slotRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Collapse to the hamburger based on whether the links actually fit, not on
  // viewport width: the bar's max-width caps how much room the nav gets, so
  // any fixed breakpoint either overlaps or collapses too eagerly depending
  // on font and chip widths.
  // The nav stays mounted (invisible, out of flow) while collapsed so its
  // natural width can still be measured.
  useLayoutEffect(() => {
    const slot = slotRef.current;
    const nav = navRef.current;
    if (!slot || !nav) return;

    const measure = () => {
      const fits = nav.offsetWidth + NAV_FIT_MARGIN <= slot.clientWidth;
      setCollapsed(!fits);
      if (fits) setMenuOpen(false);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(slot);
    // Webfont swap changes the links' width after first paint.
    document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, []);

  return (
    <header className="site-header fixed top-0 inset-x-0 z-40 backdrop-blur-md">
      {/* Widens past the page's 1200px column on large monitors so the inline
          nav has room there; laptops keep the cap and get the hamburger. */}
      <div className="mx-auto max-w-[1200px] min-[1450px]:max-w-[1600px] px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex shrink-0 items-center gap-2.5">
          <span className="site-header__wordmark font-mono tracking-wide">
            RAWN.DEV
          </span>
        </div>

        {/* Center slot: a flexible middle child, so its content sits centered
            in whatever space is actually left between the logo and chip
            columns (which aren't the same width) rather than at the
            geometric center of the whole bar. */}
        <div ref={slotRef} className="relative flex-1 flex justify-center min-w-0">
          {/* Desktop nav */}
          <nav
            ref={navRef}
            aria-hidden={collapsed}
            className={`w-max items-center gap-8 flex ${
              collapsed ? "invisible absolute pointer-events-none" : ""
            }`}
          >
            {NAV.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="site-header__link font-mono whitespace-nowrap transition-colors duration-200 hover:text-[var(--brand)]"
              >
                <span className="site-header__link-num">[{item.id}]</span>{item.label}
              </a>
            ))}
          </nav>

          {/* Shown whenever the nav doesn't fit */}
          {collapsed && (
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="site-header-menu"
              className="site-header__burger flex items-center justify-center"
            >
              {menuOpen ? (
                <X size={20} strokeWidth={2} aria-hidden="true" />
              ) : (
                <Menu size={20} strokeWidth={2} aria-hidden="true" />
              )}
            </button>
          )}
        </div>

        {/* Route links + theme switch */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <NavChip to="/resume" icon={FileText} label="RESUME" />
          <NavChip to="/blog" icon={PenLine} label="BLOG" />
          <NavChip to="/playground" icon={Waypoints} label="PLAYGROUND" />
          <ThemeToggle />
        </div>
      </div>

      {/* Collapsed nav drawer */}
      {collapsed && menuOpen && (
        <nav
          id="site-header-menu"
          className="site-header__menu flex flex-col"
        >
          {NAV.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="site-header__link site-header__link--mobile font-mono transition-colors duration-200 hover:text-[var(--brand)]"
            >
              <span className="site-header__link-num">[{item.id}]</span>{item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
