import { useMemo, useState } from "react";
import * as d3 from "d3";
import { useMeasure } from "../../hooks/use-measure";
import {
  buildStrips,
  formatValue,
  statesWithMoreWomenThanMen,
  HIGHLIGHT_STATE,
  type MetricPoint,
  type MetricStrip,
  type Verdict,
} from "../../lib/india-analysis";

const STRIP_HEIGHT = 40;
const CENTER_Y = 20;
const DOT_R = 3.4;
const HIGHLIGHT_R = 5.5;
const LEVEL_STEP = 8;

interface PlacedPoint extends MetricPoint {
  cx: number;
  cy: number;
}

/** Deterministic 1-D beeswarm: walk the points in value order and push each
    onto the first vertical level where it won't collide with an already
    placed neighbour. Preferred over random jitter — the same data always
    draws the same picture, and the vertical position carries no meaning
    that a reader could mistake for a second variable. */
function placePoints(points: MetricPoint[], x: d3.ScaleLinear<number, number>): PlacedPoint[] {
  const byValue = [...points].sort((a, b) => a.value - b.value);
  const levels: number[][] = [];
  const placed: PlacedPoint[] = [];

  for (const point of byValue) {
    const cx = x(point.value);
    const minGap = (point.isHighlight ? HIGHLIGHT_R : DOT_R) * 2 + 1.5;

    let level = 0;
    for (let i = 0; i < 12; i++) {
      // 0, -1, +1, -2, +2, … so the swarm grows evenly around the axis.
      const candidate = i === 0 ? 0 : (i % 2 === 1 ? -1 : 1) * Math.ceil(i / 2);
      const occupied = levels[candidate + 6] ?? [];
      if (occupied.every((usedX) => Math.abs(usedX - cx) >= minGap)) {
        level = candidate;
        break;
      }
    }

    const bucket = levels[level + 6] ?? (levels[level + 6] = []);
    bucket.push(cx);
    placed.push({ ...point, cx, cy: CENTER_Y + level * LEVEL_STEP });
  }

  return placed;
}

function rankLabel(rank: number, n: number): string {
  if (rank === 1) return `highest of ${n}`;
  if (rank === n) return `lowest of ${n}`;
  if (rank === n - 1) return `2nd-lowest of ${n}`;
  if (rank === 2) return `2nd-highest of ${n}`;
  return `#${rank} of ${n}`;
}

function StripRow({ metric }: { metric: MetricStrip }) {
  const { ref, width } = useMeasure<HTMLDivElement>();
  const [hover, setHover] = useState<PlacedPoint | null>(null);

  const placed = useMemo(() => {
    if (width === 0) return [];
    // Pad the domain slightly so end dots aren't clipped by the edge.
    const x = d3
      .scaleLinear()
      .domain([metric.min, metric.max])
      .range([HIGHLIGHT_R + 2, Math.max(HIGHLIGHT_R + 3, width - HIGHLIGHT_R - 2)]);
    return placePoints(metric.points, x);
  }, [metric, width]);

  return (
    <div className="kerala-strip">
      <div className="kerala-strip__head">
        <span className="kerala-strip__label">{metric.label}</span>
        {metric.highlightValue !== null && (
          <span className="kerala-strip__value">
            {formatValue(metric, metric.highlightValue)}
            <span className="kerala-strip__rank">
              {" "}
              · {rankLabel(metric.highlightRank!, metric.n)}
            </span>
          </span>
        )}
      </div>

      <div ref={ref} className="kerala-strip__plot">
        <svg
          width={width}
          height={STRIP_HEIGHT}
          role="img"
          aria-label={`${metric.label}: ${HIGHLIGHT_STATE} is ${
            metric.highlightValue !== null ? formatValue(metric, metric.highlightValue) : "not available"
          }, ${metric.highlightRank !== null ? rankLabel(metric.highlightRank, metric.n) : ""} states`}
        >
          <line
            className="kerala-strip__axis"
            x1={0}
            x2={width}
            y1={CENTER_Y}
            y2={CENTER_Y}
          />
          {placed
            .filter((p) => !p.isHighlight)
            .map((p) => (
              <circle key={p.state} className="kerala-strip__dot" cx={p.cx} cy={p.cy} r={DOT_R} />
            ))}
          {placed
            .filter((p) => p.isHighlight)
            .map((p) => (
              <circle
                key={p.state}
                className="kerala-strip__dot kerala-strip__dot--highlight"
                cx={p.cx}
                cy={p.cy}
                r={HIGHLIGHT_R}
              />
            ))}
          {/* Oversized transparent hit targets, drawn last so they sit on
              top of every mark — the visible dots are far too small to
              point at reliably. */}
          {placed.map((p) => (
            <circle
              key={`hit-${p.state}`}
              className="kerala-strip__hit"
              cx={p.cx}
              cy={p.cy}
              r={9}
              onPointerEnter={() => setHover(p)}
              onPointerLeave={() => setHover(null)}
            />
          ))}
        </svg>

        {hover && (
          <div
            className="kerala-strip__tip"
            style={{ left: hover.cx, top: hover.cy }}
          >
            {hover.state} · {formatValue(metric, hover.value)}
          </div>
        )}
      </div>

      <div className="mini-viz__ends">
        <span>
          {metric.lowLabel} · {formatValue(metric, metric.min)}
        </span>
        <span>
          {formatValue(metric, metric.max)} · {metric.highLabel}
        </span>
      </div>
    </div>
  );
}

function joinList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function ordinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

/** Builds the closing sentence from the computed ranks, so the claim can
    never drift out of sync with the numbers on screen. */
function buildInsight(strips: MetricStrip[]): string {
  const matching = (v: Verdict[]) => strips.filter((s) => s.verdict && v.includes(s.verdict));
  const labels = (v: Verdict[]) => matching(v).map((s) => s.label.toLowerCase());

  const n = strips[0]?.n ?? 0;
  const tops = labels(["highest"]);
  const lowest = labels(["lowest"]);
  const nearBottom = labels(["near-bottom"]);
  const middles = matching(["middle"]);

  const clauses: string[] = [];
  if (tops.length > 0) clauses.push(`tops all ${n} states on ${joinList(tops)}`);
  if (lowest.length > 0) clauses.push(`comes dead last on ${joinList(lowest)}`);
  if (nearBottom.length > 0) clauses.push(`sits near the bottom on ${joinList(nearBottom)}`);

  const head =
    clauses.length > 0 ? `Kerala ${clauses.join(", and ")}` : `Kerala tracks the pack fairly closely`;

  if (middles.length === 0) return `${head}.`;

  // Naming the rank makes the "ordinary" half of the finding as concrete as
  // the outlier half — this is the point of the chart, not a footnote.
  const tail =
    middles.length === 1
      ? ` — but its ${middles[0].label.toLowerCase()} is entirely unremarkable: ${ordinal(
          middles[0].highlightRank!,
        )} of ${middles[0].n}.`
      : ` — but on ${joinList(middles.map((s) => s.label.toLowerCase()))} it is entirely unremarkable, mid-pack with everyone else.`;

  return `${head}${tail}`;
}

export function KeralaOutlierStrips() {
  const strips = useMemo(() => buildStrips(), []);
  const insight = useMemo(() => buildInsight(strips), [strips]);
  const soleMajorityFemale = useMemo(() => {
    const states = statesWithMoreWomenThanMen();
    return states.length === 1 && states[0] === HIGHLIGHT_STATE;
  }, []);

  return (
    <div className="mini-viz">
      <p className="mini-viz__legend-row">
        <span className="mini-viz__key mini-viz__key--highlight" /> Kerala
        <span className="mini-viz__key" /> other states
      </p>

      <div className="kerala-strips">
        {strips.map((metric) => (
          <StripRow key={metric.id} metric={metric} />
        ))}
      </div>

      <p className="mini-viz__insight">
        {insight}
        {soleMajorityFemale && " It is also the only state where women outnumber men at all."}
      </p>
      <p className="mini-viz__caveat">
        High and low are not better and worse here — a low fertility or growth rate is neither an achievement nor a
        failing, just a position in a distribution. Hover any dot to see which state it is.
      </p>
      <p className="mini-viz__source">
        Sources: Census of India 2011 · NFHS-6 (2023-24), Ministry of Health &amp; Family Welfare. 28 states; union
        territories excluded as not comparable.
      </p>
    </div>
  );
}
