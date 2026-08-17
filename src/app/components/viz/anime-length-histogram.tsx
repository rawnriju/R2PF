import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { useMeasure } from "../../hooks/use-measure";
import { useAnimeDataset } from "../../hooks/use-anime-dataset";
import { computeBucketCounts } from "../../lib/anime-analysis";

const MARGIN = { top: 22, right: 4, bottom: 36, left: 4 };

export function AnimeLengthHistogram() {
  const { tvSet, scope } = useAnimeDataset();
  const { ref: measureRef, width, height } = useMeasure<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverLabel, setHoverLabel] = useState<{ x: number; y: number; text: string } | null>(null);

  const buckets = useMemo(() => computeBucketCounts(tvSet), [tvSet]);
  const total = useMemo(() => buckets.reduce((a, b) => a + b.count, 0), [buckets]);
  const modal = useMemo(
    () => buckets.reduce((best, b) => (b.count > best.count ? b : best), buckets[0]),
    [buckets],
  );
  // The two shortest-run buckets together — "a year of broadcast or less",
  // which is the actual headline once you look at the shape.
  const upToTwoCours = useMemo(
    () => buckets.filter((b) => b.label === "1–6" || b.label === "7–13" || b.label === "14–26").reduce((a, b) => a + b.count, 0),
    [buckets],
  );

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || width === 0 || height === 0 || buckets.length === 0) return;

    const innerW = width - MARGIN.left - MARGIN.right;
    const innerH = height - MARGIN.top - MARGIN.bottom;

    const x = d3
      .scaleBand()
      .domain(buckets.map((b) => b.label))
      .range([0, innerW])
      .padding(0.38);

    const maxCount = d3.max(buckets, (b) => b.count) ?? 1;
    const y = d3.scaleLinear().domain([0, maxCount * 1.1]).range([innerH, 0]);

    const root = d3.select(svg);
    root.selectAll("*").remove();
    const g = root.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    const bw = x.bandwidth();
    const maxRadius = Math.min(4, bw / 2);

    const groups = g
      .append("g")
      .selectAll("g")
      .data(buckets)
      .join("g")
      .attr("transform", (d) => `translate(${x(d.label)},0)`);

    groups
      .append("path")
      .attr("class", (d) => `anime-histogram__bar${d.label === modal.label ? " anime-histogram__bar--modal" : ""}`)
      .attr("d", (d) => {
        const top = y(d.count);
        const barH = innerH - top;
        const r = Math.max(0, Math.min(maxRadius, barH / 2));
        if (r === 0) return `M0,${innerH} L0,${top} L${bw},${top} L${bw},${innerH} Z`;
        return `M0,${innerH} L0,${top + r} Q0,${top} ${r},${top} L${bw - r},${top} Q${bw},${top} ${bw},${top + r} L${bw},${innerH} Z`;
      });

    groups
      .append("text")
      .attr("class", (d) => `anime-histogram__pct-label${d.label === modal.label ? " anime-histogram__pct-label--modal" : ""}`)
      .attr("x", bw / 2)
      .attr("y", (d) => y(d.count) - 8)
      .attr("text-anchor", "middle")
      .text((d) => (total > 0 ? `${Math.round((d.count / total) * 100)}%` : ""));

    groups
      .append("text")
      .attr("class", "anime-histogram__x-label")
      .attr("x", bw / 2)
      .attr("y", innerH + 16)
      .attr("text-anchor", "middle")
      .text((d) => d.label);

    g.append("text")
      .attr("class", "anime-histogram__axis-title")
      .attr("x", innerW / 2)
      .attr("y", innerH + 30)
      .attr("text-anchor", "middle")
      .text("EPISODES PER SERIES");

    groups
      .append("rect")
      .attr("class", "anime-histogram__hit")
      .attr("x", 0)
      .attr("width", bw)
      .attr("y", 0)
      .attr("height", innerH)
      .on("pointermove", (_event, d) => {
        setHoverLabel({
          x: (x(d.label) ?? 0) + bw / 2 + MARGIN.left,
          y: y(d.count) + MARGIN.top - 22,
          text: `${d.count} of ${total} · ${d.meaning}`,
        });
      })
      .on("pointerleave", () => setHoverLabel(null));
  }, [buckets, modal, total, width, height]);

  const modalShare = total > 0 ? Math.round((modal.count / total) * 100) : 0;
  const shortShare = total > 0 ? Math.round((upToTwoCours / total) * 100) : 0;

  return (
    <div className="mini-viz">
      <p className="mini-viz__legend-row">
        <span className="mini-viz__key mini-viz__key--highlight mini-viz__key--square" /> most common length
        <span className="mini-viz__key mini-viz__key--square" /> other lengths
      </p>

      <div ref={measureRef} className="mini-viz__canvas mini-viz__canvas--histogram">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          role="img"
          aria-label="Histogram of episode counts among top-rated anime, by length bucket"
        />
        {hoverLabel && (
          <div className="mini-viz__hover-label mini-viz__hover-label--center" style={{ left: hoverLabel.x, top: hoverLabel.y }}>
            {hoverLabel.text}
          </div>
        )}
      </div>

      <p className="mini-viz__insight">
        {modalShare}% run {modal.label} episodes — {modal.meaning}. Stretch that to a year of broadcast or less and
        it covers {shortShare}% of them: the beloved hundred-episode epic is the exception, not the template.
      </p>
      <p className="mini-viz__caveat">
        Bars are the share of {total} <em>top-rated</em> series, so this answers "how long is a great anime?" rather
        than "how long is the average anime?" — the sample holds nothing below {scope.minScore.toFixed(2)}.
      </p>
      <p className="mini-viz__source">
        Source: Jikan · MyAnimeList — finished TV series, 1,000+ ratings, top ~
        {scope.worstRank ?? "500"} ranks only.
      </p>
    </div>
  );
}
