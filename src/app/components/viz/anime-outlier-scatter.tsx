import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { useMeasure } from "../../hooks/use-measure";
import { useAnimeDataset } from "../../hooks/use-anime-dataset";
import {
  findHighlights,
  linearRegression,
  pearson,
  spearman,
  type RatedAnime,
} from "../../lib/anime-analysis";

const MARGIN = { top: 18, right: 14, bottom: 32, left: 10 };
const LOG_TICK_CANDIDATES = [6, 13, 26, 52, 100, 200, 500, 1000];

interface HoverState {
  x: number;
  y: number;
  anime: RatedAnime;
}

function truncate(title: string, max = 22): string {
  return title.length > max ? `${title.slice(0, max - 1)}…` : title;
}

function strengthWord(rho: number): string {
  const mag = Math.abs(rho);
  if (mag < 0.1) return "essentially nothing";
  if (mag < 0.25) return "very little";
  if (mag < 0.4) return "something modest";
  return "a good deal";
}

export function AnimeOutlierScatter() {
  const { tvSet, scope } = useAnimeDataset();
  const { ref: measureRef, width, height } = useMeasure<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<HoverState | null>(null);

  const highlights = useMemo(() => findHighlights(tvSet), [tvSet]);
  const labeled = useMemo(
    () => [highlights.longest, highlights.bestLong, highlights.bestShort].filter((a): a is RatedAnime => a !== null),
    [highlights],
  );
  const labeledIds = useMemo(() => new Set(labeled.map((a) => a.mal_id)), [labeled]);

  const stats = useMemo(() => {
    if (tvSet.length < 2) return { rho: 0, r2: 0 };
    const episodes = tvSet.map((d) => d.episodes);
    const scores = tvSet.map((d) => d.score);
    const r = pearson(episodes.map(Math.log10), scores);
    return { rho: spearman(episodes, scores), r2: r * r };
  }, [tvSet]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || width === 0 || height === 0 || tvSet.length === 0) return;

    const innerW = width - MARGIN.left - MARGIN.right;
    const innerH = height - MARGIN.top - MARGIN.bottom;

    // Domain starts at the actual shortest series in the set, not a fixed 1
    // — anchoring the log scale at 1 left a wide dead band on the left with
    // no points in it.
    const minEpisodes = d3.min(tvSet, (d) => d.episodes) ?? 1;
    const maxEpisodes = d3.max(tvSet, (d) => d.episodes) ?? 1;
    const x = d3.scaleLog().domain([minEpisodes, maxEpisodes]).range([4, innerW - 4]).clamp(true);

    const [minScore, maxScore] = d3.extent(tvSet, (d) => d.score) as [number, number];
    const y = d3
      .scaleLinear()
      .domain([minScore - 0.08, maxScore + 0.08])
      .range([innerH - 4, 4]);

    const root = d3.select(svg);
    root.selectAll("*").remove();
    const g = root.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    g.append("line")
      .attr("class", "anime-scatter-mini__baseline")
      .attr("x1", 0)
      .attr("x2", innerW)
      .attr("y1", innerH)
      .attr("y2", innerH);

    const tickValues = LOG_TICK_CANDIDATES.filter((t) => t >= minEpisodes && t <= maxEpisodes);
    const ticks = g.append("g");
    ticks
      .selectAll("line")
      .data(tickValues)
      .join("line")
      .attr("class", "anime-scatter-mini__tick")
      .attr("x1", (d) => x(d))
      .attr("x2", (d) => x(d))
      .attr("y1", innerH)
      .attr("y2", innerH + 4);
    ticks
      .selectAll("text")
      .data(tickValues)
      .join("text")
      .attr("class", "anime-scatter-mini__tick-label")
      .attr("x", (d) => x(d))
      .attr("y", innerH + 15)
      .attr("text-anchor", "middle")
      .text((d) => d);

    g.append("text")
      .attr("class", "anime-scatter-mini__axis-title")
      .attr("x", innerW / 2)
      .attr("y", innerH + 28)
      .attr("text-anchor", "middle")
      .text("EPISODES (LOG SCALE)");

    // Flat-ish trend line, fitted on log10(episodes) so it draws straight
    // on this axis. It is here to show how little the cloud tilts.
    const { slope, intercept } = linearRegression(
      tvSet.map((d) => Math.log10(d.episodes)),
      tvSet.map((d) => d.score),
    );
    const trendPoints = d3.range(0, 21).map((i) => {
      const logX = Math.log10(minEpisodes) + (i / 20) * (Math.log10(maxEpisodes) - Math.log10(minEpisodes));
      return { episodeX: 10 ** logX, predictedY: intercept + slope * logX };
    });
    g.append("path")
      .attr("class", "anime-scatter-mini__trend")
      .attr(
        "d",
        d3
          .line<{ episodeX: number; predictedY: number }>()
          .x((d) => x(d.episodeX))
          .y((d) => y(d.predictedY))(trendPoints),
      );

    g.append("g")
      .selectAll("circle")
      .data(tvSet)
      .join("circle")
      .attr("class", (d) =>
        labeledIds.has(d.mal_id) ? "anime-scatter-mini__point anime-scatter-mini__point--good" : "anime-scatter-mini__point",
      )
      .attr("cx", (d) => x(d.episodes))
      .attr("cy", (d) => y(d.score))
      .attr("r", (d) => (labeledIds.has(d.mal_id) ? 5 : 2.4));

    // Always-on labels for the three notable titles — they're the point of
    // the chart, so they don't wait for hover. Flip below the dot near the
    // top edge and pull in at the sides so nothing clips.
    const labelGroups = g
      .append("g")
      .selectAll("g")
      .data(labeled)
      .join("g")
      .attr("class", "anime-scatter-mini__label")
      .attr("transform", (d) => {
        const cy = y(d.score);
        return `translate(${x(d.episodes)},${cy < 20 ? cy + 16 : cy - 9})`;
      });

    labelGroups
      .append("text")
      .attr("text-anchor", (d) => (x(d.episodes) > innerW - 60 ? "end" : x(d.episodes) < 60 ? "start" : "middle"))
      .attr("dx", (d) => (x(d.episodes) > innerW - 60 ? 6 : x(d.episodes) < 60 ? -6 : 0))
      .text((d) => `${truncate(d.title)} · ${d.score.toFixed(2)}`);

    const quadtree = d3
      .quadtree<RatedAnime>()
      .x((d) => x(d.episodes))
      .y((d) => y(d.score))
      .addAll(tvSet);

    const hoverDot = g
      .append("circle")
      .attr("class", "anime-scatter-mini__hover-dot")
      .attr("r", 4)
      .style("display", "none");

    const move = (event: PointerEvent) => {
      const [px, py] = d3.pointer(event, g.node());
      const found = quadtree.find(px, py, 20);
      if (!found) {
        hoverDot.style("display", "none");
        setHover(null);
        return;
      }
      const cx = x(found.episodes);
      const cy = y(found.score);
      hoverDot.style("display", null).attr("cx", cx).attr("cy", cy);
      setHover({ x: cx + MARGIN.left, y: cy + MARGIN.top, anime: found });
    };

    g.append("rect")
      .attr("class", "anime-scatter-mini__overlay")
      .attr("width", innerW)
      .attr("height", innerH)
      .on("pointermove", move)
      .on("pointerleave", () => {
        hoverDot.style("display", "none");
        setHover(null);
      });
  }, [tvSet, labeled, labeledIds, width, height]);

  return (
    <div className="mini-viz">
      <p className="mini-viz__legend-row">
        <span className="mini-viz__key mini-viz__key--highlight" /> notable titles
        <span className="mini-viz__key" /> other series
        <span className="mini-viz__key mini-viz__key--line" /> trend
      </p>

      <div ref={measureRef} className="mini-viz__canvas mini-viz__canvas--scatter">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          role="img"
          aria-label="Scatter plot of episode count against score for top-rated anime, showing no relationship"
        />
        {hover && (
          <div className="mini-viz__hover-label" style={{ left: hover.x, top: hover.y }}>
            {hover.anime.title} · {hover.anime.score.toFixed(2)} · {hover.anime.episodes} ep
          </div>
        )}
      </div>

      <div className="mini-viz__ends">
        <span>{scope.minScore.toFixed(2)} — lowest score here</span>
        <span>highest {scope.maxScore.toFixed(2)}</span>
      </div>

      <p className="mini-viz__insight">
        Among these {scope.n} top-rated series, episode count tells you {strengthWord(stats.rho)} about score
        (ρ&nbsp;=&nbsp;{stats.rho.toFixed(2)}, explaining {(stats.r2 * 100).toFixed(1)}% of the variation). The
        trend line is flat: a 10-episode season and a 200-episode epic are equally likely to be loved.
      </p>
      <p className="mini-viz__caveat">
        Read the vertical axis carefully — every series here scores between {scope.minScore.toFixed(2)} and{" "}
        {scope.maxScore.toFixed(2)}. This sample is the top of MyAnimeList's ranking, so it cannot say whether
        <em> bad</em> anime run long; it only shows that among the good ones, length is not what makes them good.
      </p>
      <p className="mini-viz__source">
        Source: Jikan · MyAnimeList — finished TV series, 1,000+ ratings, top ~
        {scope.worstRank ?? "500"} ranks only.
      </p>
    </div>
  );
}
