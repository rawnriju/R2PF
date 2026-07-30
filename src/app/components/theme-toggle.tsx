import { Moon, Sun } from "lucide-react";
import { useTheme } from "../theme";

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
      className={`group font-mono inline-flex items-center gap-1.5 px-2.5 py-1.5 cursor-pointer transition-colors duration-200 hover:text-[var(--brand)] ${className}`}
      style={{
        fontSize: 11,
        letterSpacing: "0.12em",
        color: "var(--text-muted)",
        border: "1px solid var(--hairline)",
        background: "var(--chip-bg)",
      }}
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
