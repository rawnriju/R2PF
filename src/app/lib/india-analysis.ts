// Shaping for the "In which ways is Kerala actually unusual?" viz.
//
// Deliberately makes no claim about any metric being good or bad: a low
// fertility rate or a low population growth rate isn't an achievement or a
// failure on its own, and the whole point of the chart is to locate Kerala
// in each distribution, not to score it.
//
// Verdicts are rank-based, not z-score based. With n=28 and visibly skewed
// distributions, a z-score implies more precision than the sample supports
// — and the stricter, more robust test (Tukey's 1.5·IQR fence) calls only
// the sex ratio a formal outlier, because these distributions are so wide
// that the fences swallow even a first-place literacy rate. Rank is what a
// reader of a strip plot actually perceives, and it's the claim the chart
// can back up.

import dataset from "../../content/playground/india-states.json";

export interface StateRow {
  state: string;
  literacy: number | null;
  femaleLiteracy: number | null;
  sexRatio: number | null;
  decadalGrowth: number | null;
  urbanPct: number | null;
  tfr: number | null;
}

export type MetricId = "literacy" | "femaleLiteracy" | "sexRatio" | "decadalGrowth" | "urbanPct" | "tfr";

export interface MetricDef {
  id: MetricId;
  label: string;
  /** Rendered after the value, e.g. "94.0%". */
  unit: string;
  decimals: number;
  sourceId: "census2011" | "nfhs6";
  /** Short, value-neutral hints for the two ends of the strip. */
  lowLabel: string;
  highLabel: string;
}

// Ordered as a small narrative: the sharpest break from the pack first,
// the metric where Kerala turns out to be utterly ordinary last.
export const METRICS: MetricDef[] = [
  {
    id: "sexRatio",
    label: "Sex ratio",
    unit: "",
    decimals: 0,
    sourceId: "census2011",
    lowLabel: "fewer women",
    highLabel: "more women",
  },
  {
    id: "literacy",
    label: "Literacy rate",
    unit: "%",
    decimals: 1,
    sourceId: "census2011",
    lowLabel: "lower",
    highLabel: "higher",
  },
  {
    id: "femaleLiteracy",
    label: "Female literacy",
    unit: "%",
    decimals: 1,
    sourceId: "census2011",
    lowLabel: "lower",
    highLabel: "higher",
  },
  {
    id: "urbanPct",
    label: "Urbanisation",
    unit: "%",
    decimals: 1,
    sourceId: "census2011",
    lowLabel: "more rural",
    highLabel: "more urban",
  },
  {
    id: "decadalGrowth",
    label: "Population growth",
    unit: "%",
    decimals: 1,
    sourceId: "census2011",
    lowLabel: "shrinking",
    highLabel: "growing fast",
  },
  {
    id: "tfr",
    label: "Fertility rate",
    unit: "",
    decimals: 1,
    sourceId: "nfhs6",
    lowLabel: "fewer births",
    highLabel: "more births",
  },
];

export const HIGHLIGHT_STATE = "Kerala";

export interface MetricPoint {
  state: string;
  value: number;
  isHighlight: boolean;
}

export type Verdict = "highest" | "near-top" | "middle" | "near-bottom" | "lowest";

export interface MetricStrip extends MetricDef {
  points: MetricPoint[];
  min: number;
  max: number;
  median: number;
  highlightValue: number | null;
  /** 1 = highest of all states on this metric. */
  highlightRank: number | null;
  n: number;
  verdict: Verdict | null;
  /** True when Kerala falls outside Tukey's 1.5·IQR fence — the strict
      definition of a statistical outlier. Only used to caption the one
      metric where it actually holds. */
  isTukeyOutlier: boolean;
  sourceLabel: string;
}

function quantile(sorted: number[], p: number): number {
  const pos = (sorted.length - 1) * p;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

function verdictFor(rank: number, n: number): Verdict {
  if (rank === 1) return "highest";
  if (rank === n) return "lowest";
  const fromTop = (rank - 1) / (n - 1);
  if (fromTop <= 0.15) return "near-top";
  if (fromTop >= 0.85) return "near-bottom";
  return "middle";
}

const SOURCE_LABELS: Record<MetricDef["sourceId"], string> = {
  census2011: "Census 2011",
  nfhs6: "NFHS-6, 2023-24",
};

export function buildStrips(): MetricStrip[] {
  const rows = dataset.states as StateRow[];

  return METRICS.map((metric) => {
    const points: MetricPoint[] = rows
      .filter((r) => typeof r[metric.id] === "number")
      .map((r) => ({
        state: r.state,
        value: r[metric.id] as number,
        isHighlight: r.state === HIGHLIGHT_STATE,
      }));

    const values = points.map((p) => p.value);
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = quantile(sorted, 0.25);
    const q3 = quantile(sorted, 0.75);
    const iqr = q3 - q1;

    const highlightValue = points.find((p) => p.isHighlight)?.value ?? null;
    // Ties share the better rank.
    const highlightRank =
      highlightValue === null ? null : values.filter((v) => v > highlightValue).length + 1;

    return {
      ...metric,
      points,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      median: quantile(sorted, 0.5),
      highlightValue,
      highlightRank,
      n: points.length,
      verdict: highlightRank === null ? null : verdictFor(highlightRank, points.length),
      isTukeyOutlier:
        highlightValue !== null && (highlightValue > q3 + 1.5 * iqr || highlightValue < q1 - 1.5 * iqr),
      sourceLabel: SOURCE_LABELS[metric.sourceId],
    };
  });
}

export function formatValue(metric: Pick<MetricDef, "unit" | "decimals">, value: number): string {
  return `${value.toFixed(metric.decimals)}${metric.unit}`;
}

/** Kerala is the only state whose sex ratio clears 1,000 — i.e. the only
    one with more women than men. Computed rather than asserted so the claim
    can't outlive the data. */
export function statesWithMoreWomenThanMen(): string[] {
  return (dataset.states as StateRow[])
    .filter((r) => typeof r.sexRatio === "number" && (r.sexRatio as number) > 1000)
    .map((r) => r.state);
}

export const DATASET_SCOPE = dataset.scope as string;
