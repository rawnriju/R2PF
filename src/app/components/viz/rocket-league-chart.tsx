import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import { useMeasure } from "../../hooks/use-measure";
import raw from "../../../content/playground/rocket-league.json";

type Mode = "2v2" | "3v3";

interface RankSnapshot {
  rating: number;
  tier: string;
  division: string;
  seasonMatches: number;
  seasonPeak: number;
  percentileTop: number;
}

interface RocketLeagueData {
  player: string;
  platform: string;
  season: number;
  exportedAt: string;
  percentileSource: string;
  current: Record<Mode, RankSnapshot>;
  allTimePeak: Record<Mode, { rating: number; tier: string; season: number }>;
  lifetime: Record<"wins" | "goals" | "saves" | "assists" | "shots" | "mvps", number>;
  history: { mode: Mode; time: string; rating: number; matches: number | null }[];
}

interface Point {
  mode: Mode;
  time: Date;
  rating: number;
  matches: number | null;
}

const data = raw as RocketLeagueData;

// 3v3 first: it's the headline (top 2%), so it takes the primary brand hue.
const MODES: Mode[] = ["3v3", "2v2"];
const MODE_LABEL: Record<Mode, string> = { "3v3": "3v3 STANDARD", "2v2": "2v2 DOUBLES" };

// Right margin leaves room for the direct "3v3 1259" end labels.
const MARGIN = { top: 14, right: 78, bottom: 26, left: 42 };

const dateFmt = d3.timeFormat("%d %b");

export function RocketLeagueChart() {
  const { ref: measureRef, width, height } = useMeasure<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement>(null);

  const series = useMemo(() => {
    const points: Point[] = data.history.map((h) => ({ ...h, time: new Date(h.time) }));
    return Object.fromEntries(MODES.map((m) => [m, points.filter((p) => p.mode === m)])) as Record<
      Mode,
      Point[]
    >;
  }, []);

  const climb = useMemo(
    () =>
      Object.fromEntries(
        MODES.map((m) => {
          const s = series[m];
          return [m, s.length ? s[s.length - 1].rating - s[0].rating : 0];
        }),
      ) as Record<Mode, number>,
    [series],
  );

  const peak2s = data.allTimePeak["2v2"];

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || width === 0 || height === 0) return;

    const innerW = width - MARGIN.left - MARGIN.right;
    const innerH = height - MARGIN.top - MARGIN.bottom;
    const all = MODES.flatMap((m) => series[m]);
    if (all.length === 0) return;

    const x = d3
      .scaleTime()
      .domain(d3.extent(all, (d) => d.time) as [Date, Date])
      .range([0, innerW]);
    const y = d3
      .scaleLinear()
      .domain([(d3.min(all, (d) => d.rating) ?? 0) - 20, Math.max(d3.max(all, (d) => d.rating) ?? 0, peak2s.rating) + 20])
      .range([innerH, 0]);

    const root = d3.select(svg);
    root.selectAll("*").remove();
    const g = root.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    g.append("g")
      .attr("class", "rl-chart__axis")
      .attr("transform", `translate(0,${innerH})`)
      .call(
        d3
          .axisBottom<Date>(x)
          .ticks(width < 420 ? 3 : 5)
          .tickSizeOuter(0)
          .tickFormat(dateFmt),
      );
    g.append("g").attr("class", "rl-chart__axis").call(d3.axisLeft(y).ticks(4).tickSizeOuter(0));

    // All-time 2v2 peak: the mark this season is climbing back toward.
    const peakY = y(peak2s.rating);
    g.append("line")
      .attr("class", "rl-chart__peak")
      .attr("x1", 0)
      .attr("x2", innerW)
      .attr("y1", peakY)
      .attr("y2", peakY);
    g.append("text")
      .attr("class", "rl-chart__peak-label")
      .attr("x", 0)
      .attr("y", peakY - 6)
      .text(`2v2 ALL-TIME PEAK · ${peak2s.rating} (${peak2s.tier.toUpperCase()}, S${peak2s.season})`);

    const lineGen = d3
      .line<Point>()
      .x((d) => x(d.time))
      .y((d) => y(d.rating))
      .curve(d3.curveMonotoneX);

    for (const m of MODES) {
      const s = series[m];
      const cls = m === "3v3" ? "primary" : "secondary";
      g.append("path").datum(s).attr("class", `rl-chart__line rl-chart__line--${cls}`).attr("d", lineGen);
      g.selectAll(null)
        .data(s)
        .join("circle")
        .attr("class", `rl-chart__point rl-chart__point--${cls}`)
        .attr("cx", (d) => x(d.time))
        .attr("cy", (d) => y(d.rating))
        .attr("r", 3);

      const last = s[s.length - 1];
      if (last) {
        g.append("text")
          .attr("class", "rl-chart__end-label")
          .attr("x", x(last.time) + 10)
          .attr("y", y(last.rating) + 4)
          .text(`${m} ${last.rating}`);
      }
    }

    // -- hover: nearest session point (either playlist) + one tooltip --
    const hover = g.append("g").attr("class", "rl-chart__hover").style("display", "none");
    const hoverDot = hover.append("circle").attr("class", "rl-chart__hover-dot").attr("r", 5);
    const tooltip = hover.append("g");
    const TOOLTIP_W = 170;
    const TOOLTIP_H = 52;
    tooltip
      .append("rect")
      .attr("class", "rl-chart__tooltip-bg")
      .attr("rx", 2)
      .attr("width", TOOLTIP_W)
      .attr("height", TOOLTIP_H);
    const tipDate = tooltip.append("text").attr("class", "rl-chart__tooltip-time").attr("x", 10).attr("y", 16);
    const tipKey = tooltip
      .append("line")
      .attr("class", "rl-chart__tooltip-key")
      .attr("x1", 10)
      .attr("x2", 20)
      .attr("y1", 30)
      .attr("y2", 30);
    const tipRating = tooltip.append("text").attr("class", "rl-chart__tooltip-row").attr("x", 26).attr("y", 34);
    const tipMatches = tooltip.append("text").attr("class", "rl-chart__tooltip-time").attr("x", 26).attr("y", 46);

    const finder = d3.Delaunay.from(
      all,
      (d) => x(d.time),
      (d) => y(d.rating),
    );

    const move = (event: PointerEvent) => {
      const [px, py] = d3.pointer(event, g.node());
      const p = all[finder.find(px, py)];
      if (!p) return;
      const cx = x(p.time);
      const cy = y(p.rating);
      const cls = p.mode === "3v3" ? "primary" : "secondary";

      hover.style("display", null);
      hoverDot.attr("cx", cx).attr("cy", cy).attr("class", `rl-chart__hover-dot rl-chart__point--${cls}`);
      tipKey.attr("class", `rl-chart__tooltip-key rl-chart__line--${cls}`);
      tipDate.text(dateFmt(p.time).toUpperCase());
      tipRating.text(`${p.mode}  ${p.rating} MMR`);
      tipMatches.text(p.matches != null ? `${p.matches} match${p.matches === 1 ? "" : "es"} that session` : "");

      // Keep the tooltip inside the plot on both axes.
      const tx = cx + 14 + TOOLTIP_W > innerW + MARGIN.right ? cx - 14 - TOOLTIP_W : cx + 14;
      const ty = Math.max(0, Math.min(innerH - TOOLTIP_H, cy - TOOLTIP_H / 2));
      tooltip.attr("transform", `translate(${tx},${ty})`);
    };

    g.append("rect")
      .attr("class", "rl-chart__overlay")
      .attr("width", innerW)
      .attr("height", innerH)
      .on("pointermove", move)
      .on("pointerleave", () => hover.style("display", "none"));
  }, [series, peak2s, width, height]);

  const first = series["2v2"][0] ?? series["3v3"][0];
  const fmt = (n: number) => n.toLocaleString("en-US");
  const signed = (n: number) => `${n >= 0 ? "+" : "−"}${Math.abs(n)}`;

  return (
    <div className="mini-viz">
      <div className="rl-ranks">
        {MODES.map((m) => {
          const c = data.current[m];
          return (
            <div key={m} className={`rl-rank rl-rank--${m === "3v3" ? "primary" : "secondary"}`}>
              <p className="rl-rank__mode">{MODE_LABEL[m]}</p>
              <p className="rl-rank__pct">TOP {c.percentileTop}%</p>
              <p className="rl-rank__tier">
                {c.tier} · {c.division.replace("Division ", "Div ")}
              </p>
              <p className="rl-rank__meta">
                {c.rating} MMR · {signed(climb[m])} this season
              </p>
            </div>
          );
        })}
      </div>

      <p className="mini-viz__legend-row">
        <span className="mini-viz__key mini-viz__key--line rl-key--primary" /> 3v3
        <span className="mini-viz__key mini-viz__key--line rl-key--secondary" /> 2v2
        <span className="mini-viz__key mini-viz__key--line rl-key--peak" /> all-time 2v2 peak
      </p>

      <div ref={measureRef} className="mini-viz__canvas mini-viz__canvas--rl">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          role="img"
          aria-label={`Ranked Rocket League rating across season ${data.season}: 3v3 from ${series["3v3"][0]?.rating} to ${data.current["3v3"].rating}, 2v2 from ${series["2v2"][0]?.rating} to ${data.current["2v2"].rating}`}
        />
      </div>

      <div className="mini-viz__ends">
        <span>{first ? dateFmt(first.time) : ""}</span>
        <span>rating after each session · now</span>
      </div>

      <p className="mini-viz__insight">
        Yes. Both playlists are up this season: 3v3 has climbed {climb["3v3"]} points to{" "}
        {data.current["3v3"].tier}, inside the top {data.current["3v3"].percentileTop}% of ranked players, and 2v2 is up{" "}
        {climb["2v2"]} to a season high of {data.current["2v2"].seasonPeak}. 2v2 is still{" "}
        {peak2s.rating - data.current["2v2"].rating} short of my {peak2s.tier} peak from season {peak2s.season}.
      </p>
      <p className="mini-viz__caveat">
        tracker.gg records a rating after each session rather than after every game, so the lines join sessions.
        Lifetime: {fmt(data.lifetime.wins)} wins, {fmt(data.lifetime.goals)} goals, {fmt(data.lifetime.saves)} saves.
      </p>
      <p className="mini-viz__source">
        Source: tracker.gg profile for {data.player} ({data.platform}) · season {data.season} · snapshot{" "}
        {d3.timeFormat("%d %b %Y")(new Date(data.exportedAt))} · percentiles: {data.percentileSource}.
      </p>
    </div>
  );
}
