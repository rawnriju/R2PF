import { Moon, Sun } from "lucide-react";
import { useTheme } from "../theme";
import { CHIP_CLASS } from "./chip";

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
      // Icon-only, so stretch to the row's height to stay level with the
      // labelled chips beside it.
      className={`${CHIP_CLASS} self-stretch ${className}`}
    >
      {theme === "dark" ? (
        <Sun size={13} strokeWidth={2} aria-hidden="true" />
      ) : (
        <Moon size={13} strokeWidth={2} aria-hidden="true" />
      )}
    </button>
  );
}
