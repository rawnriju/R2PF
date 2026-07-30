import type { LucideIcon } from "lucide-react";
import { Link } from "react-router";

/**
 * Shared appearance for the header's chip row (Resume, Blog, theme toggle).
 * Kept in one place so the three stay pixel-identical — they sit side by side,
 * where any drift in padding or border would be obvious.
 */
export const CHIP_CLASS =
  "group font-mono inline-flex items-center gap-1.5 px-2.5 py-1.5 cursor-pointer transition-colors duration-200 hover:text-[var(--brand)]";

export const CHIP_STYLE: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.12em",
  color: "var(--text-muted)",
  border: "1px solid var(--hairline)",
  background: "var(--chip-bg)",
};

/**
 * Route link wearing the chip look. The label collapses below `sm` so three
 * chips plus the logo still fit a 375px header — same trick the theme toggle
 * uses for its LIGHT/DARK text.
 */
export function NavChip({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      title={label}
      className={CHIP_CLASS}
      style={CHIP_STYLE}
    >
      <Icon size={13} strokeWidth={2} aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
