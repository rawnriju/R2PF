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
  const accent = full ? "#FF5500" : "#FFE100";
  const activeSegments = Math.round((pct / 100) * SEGMENTS);
  const size = 96;
  const center = size / 2;
  const outer = 44;
  const inner = 36;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 grid place-items-center rounded-full transition-shadow duration-300"
      style={{
        width: size,
        height: size,
        boxShadow: full
          ? "0 0 32px 4px rgba(255,85,0,0.55)"
          : "0 0 18px 0 rgba(255,225,0,0.25)",
      }}
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
              stroke={active ? accent : "rgba(255,255,255,0.10)"}
              strokeWidth={2.5}
              strokeLinecap="round"
              style={active ? { filter: `drop-shadow(0 0 3px ${accent})` } : undefined}
            />
          );
        })}
      </svg>
      <div
        className="grid place-items-center rounded-full"
        style={{
          width: inner * 2 - 8,
          height: inner * 2 - 8,
          background: "#12161F",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <span
          className="font-mono"
          style={{ fontSize: 9, letterSpacing: "0.15em", color: "#8A8F9E", }}
        >
          BOOST
        </span>
        <span
          className="font-mono"
          style={{ fontSize: 22, color: accent, fontWeight: 700, lineHeight: 1 }}
        >
          {Math.round(pct)}
        </span>
      </div>
    </div>
  );
}
