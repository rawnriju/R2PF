import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useInView } from "../hooks/use-in-view";
import "./stats-bar.css";

const STATS = [
  { label: "EXP", value: "5 YRS" },
  { label: "STACK", value: "REACT / NODE.JS / TYPESCRIPT / D3.JS" },
  { label: "LOC", value: "TAMPERE, FINLAND" },
];

// Chips "type" in one after another, terminal-style, rather than all at
// once — timing is proportional to each chip's character count so longer
// chips take proportionally longer, and delays stack so the whole bar
// reads as one continuous typing pass rather than parallel bursts.
const TYPE_RATE_MS = 42;
const TYPE_MIN_MS = 380;
const TYPE_GAP_MS = 160;

function buildTypingSchedule() {
  let cursor = 0;
  return STATS.map((s) => {
    const text = `[ ${s.label}: ${s.value} ]`;
    const duration = Math.max(TYPE_MIN_MS, text.length * TYPE_RATE_MS);
    const delay = cursor;
    cursor += duration + TYPE_GAP_MS;
    return { ...s, duration, steps: text.length, delay };
  });
}

function StatChip({
  label,
  value,
  duration,
  steps,
  delay,
}: {
  label: string;
  value: string;
  duration: number;
  steps: number;
  delay: number;
}) {
  const innerRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number | null>(null);

  // scrollWidth reports the full un-clipped content size even while the
  // element itself is held at width:0 by the CSS above. Measured once on
  // mount (fast path — fonts already cached from a prior visit) and again
  // once the custom display font has actually finished loading: without
  // the second pass, a chip measured against the fallback font before the
  // swap ends up narrower than the real text, clipping the tail once the
  // real font renders in. A few px of buffer absorbs any remaining
  // subpixel/hinting rounding.
  useLayoutEffect(() => {
    const measure = () => {
      if (innerRef.current) setWidth(innerRef.current.scrollWidth + 4);
    };
    measure();
    document.fonts?.ready.then(measure);
  }, []);

  return (
    <span
      ref={innerRef}
      className="stat-span stat-type font-mono"
      style={
        {
          "--type-width": width !== null ? `${width}px` : "auto",
          "--type-duration": `${duration}ms`,
          "--type-steps": steps,
          "--type-delay": `${delay}ms`,
        } as CSSProperties
      }
    >
      [ {label}: <span className="stat-span__value">{value}</span> ]
    </span>
  );
}

export function StatsBar() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [schedule] = useState(buildTypingSchedule);

  return (
    <div ref={ref} className="stats-bar" data-inview={inView}>
      <div className="mx-auto max-w-[1200px] px-6 py-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {schedule.map((s, i) => (
          <div key={s.label} className="flex items-center gap-6">
            <StatChip
              label={s.label}
              value={s.value}
              duration={s.duration}
              steps={s.steps}
              delay={s.delay}
            />
            {i < schedule.length - 1 && (
              <span
                className="dot-sep hidden sm:inline"
                style={{ "--dot-delay": `${Math.max(0, schedule[i + 1].delay - 100)}ms` } as CSSProperties}
              >
                •
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
