import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useMeasure } from "../../hooks/use-measure";

interface BarDatum {
  id: string;
  value: number;
}

// Fixed values — only the *order* changes (via sort/shuffle below), which is
// what makes the transition interesting: bars swap places by key, not by
// tearing down and rebuilding the chart.
const DATA: BarDatum[] = [
  { id: "A", value: 62 },
  { id: "B", value: 34 },
  { id: "C", value: 88 },
  { id: "D", value: 51 },
  { id: "E", value: 19 },
  { id: "F", value: 73 },
  { id: "G", value: 45 },
  { id: "H", value: 27 },
];

const MARGIN = { top: 26, right: 4, bottom: 22, left: 4 };

export function SortableBars() {
  const { ref: measureRef, width, height } = useMeasure<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement>(null);
  const [order, setOrder] = useState<string[]>(() => DATA.map((d) => d.id));
  const renderedOnce = useRef(false);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || width === 0 || height === 0) return;

    const innerW = width - MARGIN.left - MARGIN.right;
    const innerH = height - MARGIN.top - MARGIN.bottom;

    const x = d3.scaleBand<string>().domain(order).range([0, innerW]).padding(0.3);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(DATA, (d) => d.value) ?? 0])
      .nice()
      .range([innerH, 0]);

    let g = d3.select(svg).select<SVGGElement>("g.sortable-bars__inner");
    if (g.empty()) {
      g = d3
        .select(svg)
        .append("g")
        .attr("class", "sortable-bars__inner")
        .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);
    }

    // One shared transition (when there is one) so bars/values/ticks reorder
    // in lockstep instead of drifting out of sync.
    const t = renderedOnce.current ? d3.transition().duration(600).ease(d3.easeCubicInOut) : null;

    const bars = g
      .selectAll<SVGRectElement, BarDatum>("rect.sortable-bars__bar")
      .data(DATA, (d) => d.id)
      .join((enter) =>
        enter
          .append("rect")
          .attr("class", "sortable-bars__bar")
          .attr("x", (d) => x(d.id) ?? 0)
          .attr("width", x.bandwidth())
          .attr("y", innerH)
          .attr("height", 0),
      );

    if (t) {
      bars
        .transition(t)
        .attr("x", (d) => x(d.id) ?? 0)
        .attr("width", x.bandwidth())
        .attr("y", (d) => y(d.value))
        .attr("height", (d) => innerH - y(d.value));
    } else {
      bars
        .attr("x", (d) => x(d.id) ?? 0)
        .attr("width", x.bandwidth())
        .attr("y", (d) => y(d.value))
        .attr("height", (d) => innerH - y(d.value));
    }

    const values = g
      .selectAll<SVGTextElement, BarDatum>("text.sortable-bars__value")
      .data(DATA, (d) => d.id)
      .join((enter) =>
        enter
          .append("text")
          .attr("class", "sortable-bars__value")
          .attr("text-anchor", "middle")
          .attr("x", (d) => (x(d.id) ?? 0) + x.bandwidth() / 2)
          .attr("y", innerH)
          .text((d) => d.value),
      );

    if (t) {
      values.transition(t).attr("x", (d) => (x(d.id) ?? 0) + x.bandwidth() / 2).attr("y", (d) => y(d.value) - 8);
    } else {
      values.attr("x", (d) => (x(d.id) ?? 0) + x.bandwidth() / 2).attr("y", (d) => y(d.value) - 8);
    }

    const ticks = g
      .selectAll<SVGTextElement, BarDatum>("text.sortable-bars__tick")
      .data(DATA, (d) => d.id)
      .join((enter) =>
        enter
          .append("text")
          .attr("class", "sortable-bars__tick")
          .attr("text-anchor", "middle")
          .attr("x", (d) => (x(d.id) ?? 0) + x.bandwidth() / 2)
          .attr("y", innerH + 16)
          .text((d) => d.id),
      );

    if (t) {
      ticks.transition(t).attr("x", (d) => (x(d.id) ?? 0) + x.bandwidth() / 2);
    } else {
      ticks.attr("x", (d) => (x(d.id) ?? 0) + x.bandwidth() / 2);
    }

    renderedOnce.current = true;
  }, [order, width, height]);

  return (
    <div className="viz-toy">
      <div ref={measureRef} className="viz-canvas viz-canvas--bars">
        <svg ref={svgRef} width={width} height={height} role="img" aria-label="Sortable bar chart" />
      </div>
      <div className="viz-toy__controls">
        <button
          type="button"
          className="viz-btn font-mono"
          onClick={() => setOrder([...DATA].sort((a, b) => a.value - b.value).map((d) => d.id))}
        >
          SORT ↑
        </button>
        <button
          type="button"
          className="viz-btn font-mono"
          onClick={() => setOrder([...DATA].sort((a, b) => b.value - a.value).map((d) => d.id))}
        >
          SORT ↓
        </button>
        <button type="button" className="viz-btn font-mono" onClick={() => setOrder((prev) => d3.shuffle([...prev]))}>
          SHUFFLE
        </button>
      </div>
    </div>
  );
}
