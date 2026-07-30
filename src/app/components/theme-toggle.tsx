import { Moon, Sun } from "lucide-react";
import { useTheme } from "../theme";
import { CHIP_CLASS, CHIP_STYLE } from "./chip";

/**
 * Light/dark switch. Styled to sit next to the site's other mono `[ LABEL ]`
 * chrome, so it reads as part of the HUD rather than a bolted-on widget.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const goingTo = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${goingTo} mode`}
      aria-pressed={theme === "light"}
      title={`Switch to ${goingTo} mode`}
      className={`${CHIP_CLASS} ${className}`}
      style={CHIP_STYLE}
    >
      {theme === "dark" ? (
        <Sun size={13} strokeWidth={2} aria-hidden="true" />
      ) : (
        <Moon size={13} strokeWidth={2} aria-hidden="true" />
      )}
      <span className="hidden sm:inline">{theme === "dark" ? "LIGHT" : "DARK"}</span>
    </button>
  );
}
