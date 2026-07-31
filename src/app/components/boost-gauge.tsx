import type { CSSProperties } from "react";
import "./boost-gauge.css";

interface BoostGaugeProps {
  /** 0 - 100 */
  value: number;
}

const SEGMENTS = 40;

/**
 * Rocket League style circular boost gauge.
 * Segmented radial tick ring that fills 0 -> 100 with scroll.
 * Turns Nitro Orange with an outer glow at 100%.
 */
export function BoostGauge({ value }: BoostGaugeProps) {
  const pct = Math.max(0, Math.min(100, value));
  const full = pct >= 100;
  const accent = full ? "var(--brand-2)" : "var(--brand)";
  const accentRgb = full ? "var(--brand-2-rgb)" : "var(--brand-rgb)";
  const activeSegments = Math.round((pct / 100) * SEGMENTS);
  const size = 96;
  const center = size / 2;
  const outer = 44;
  const inner = 36;

  return (
    <div
      className="boost-gauge fixed bottom-6 right-6 z-50 grid place-items-center rounded-full transition-shadow duration-300"
      data-full={full}
      // Colours come from boost-gauge.css; only the JS-derived geometry
      // stays inline.
      style={{
        width: size,
        height: size,
        "--gauge-accent": accent,
        "--gauge-accent-rgb": accentRgb,
      } as CSSProperties}
    >
      <svg width={size} height={size} className="absolute inset-0">
        {Array.from({ length: SEGMENTS }).map((_, i) => {
          const angle = (i / SEGMENTS) * Math.PI * 2 - Math.PI / 2;
          const active = i < activeSegments;
          const x1 = center + Math.cos(angle) * inner;
          const y1 = center + Math.sin(angle) * inner;
          const x2 = center + Math.cos(angle) * outer;
          const y2 = center + Math.sin(angle) * outer;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              strokeWidth={2.5}
              strokeLinecap="round"
              // stroke is set in boost-gauge.css, not as a presentation
              // attribute: SVG attributes don't resolve var().
              className="boost-gauge__tick"
              data-active={active}
            />
          );
        })}
      </svg>
      <div
        className="boost-gauge__face grid place-items-center rounded-full"
        style={{ width: inner * 2 - 8, height: inner * 2 - 8 }}
      >
        <span className="boost-gauge__label font-mono">BOOST</span>
        <span className="boost-gauge__value font-mono">{Math.round(pct)}</span>
      </div>
    </div>
  );
}
