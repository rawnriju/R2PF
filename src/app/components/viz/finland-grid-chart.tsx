import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import { useMeasure } from "../../hooks/use-measure";
import { useFingrid } from "../../hooks/use-fingrid";

interface TimedValue {
  time: Date;
  value: number;
}

const MARGIN = { top: 12, right: 12, bottom: 26, left: 46 };

function formatMW(value: number | undefined): string {
  if (value === undefined) return "—";
  return Math.round(value).toLocaleString("en-US");
}

export function FinlandGridChart() {
  const { data, isLive, error } = useFingrid();
  const { ref: measureRef, width, height } = useMeasure<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement>(null);

  const production: TimedValue[] = useMemo(
    () => data.production.map((d) => ({ time: new Date(d.time), value: d.value })),
    [data],
  );
  const consumption: TimedValue[] = useMemo(
    () => data.consumption.map((d) => ({ time: new Date(d.time), value: d.value })),
    [data],
  );

  const latestProduction = production[production.length - 1];
  const latestConsumption = consumption[consumption.length - 1];
  const netMW =
    latestProduction && latestConsumption ? latestProduction.value - latestConsumption.value : undefined;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || width === 0 || height === 0) return;

    const innerW = width - MARGIN.left - MARGIN.right;
    const innerH = height - MARGIN.top - MARGIN.bottom;

    const all = [...production, ...consumption];
    if (all.length === 0) return;

    const x = d3
      .scaleTime()
      .domain(d3.extent(all, (d) => d.time) as [Date, Date])
      .range([0, innerW]);

    const yMin = d3.min(all, (d) => d.value) ?? 0;
    const yMax = d3.max(all, (d) => d.value) ?? 1;
    const y = d3
      .scaleLinear()
      .domain([yMin * 0.96, yMax * 1.04])
      .range([innerH, 0]);

    const root = d3.select(svg);
    root.selectAll("*").remove();
    const g = root.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    const xAxis = d3
      .axisBottom<Date>(x)
      .ticks(width < 420 ? 4 : 6)
      .tickSizeOuter(0)
      .tickFormat(d3.timeFormat("%H:%M"));
    const yAxis = d3.axisLeft(y).ticks(4).tickSizeOuter(0);

    g.append("g")
      .attr("class", "fingrid-chart__axis fingrid-chart__axis--x")
      .attr("transform", `translate(0,${innerH})`)
      .call(xAxis);
    g.append("g").attr("class", "fingrid-chart__axis fingrid-chart__axis--y").call(yAxis);

    const lineGen = d3
      .line<TimedValue>()
      .x((d) => x(d.time))
      .y((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(production)
      .attr("class", "fingrid-chart__line fingrid-chart__line--production")
      .attr("d", lineGen);

    g.append("path")
      .datum(consumption)
      .attr("class", "fingrid-chart__line fingrid-chart__line--consumption")
      .attr("d", lineGen);

    // -- hover layer: crosshair + one tooltip listing every series at that X --
    const bisectTime = d3.bisector<TimedValue, Date>((d) => d.time).left;
    const nearest = (series: TimedValue[], date: Date): TimedValue | undefined => {
      if (series.length === 0) return undefined;
      const i = bisectTime(series, date, 1);
      const before = series[i - 1];
      const after = series[i];
      if (!after) return before;
      if (!before) return after;
      return date.getTime() - before.time.getTime() > after.time.getTime() - date.getTime() ? after : before;
    };

    const hover = g.append("g").attr("class", "fingrid-chart__hover").style("display", "none");
    hover
      .append("line")
      .attr("class", "fingrid-chart__crosshair")
      .attr("y1", 0)
      .attr("y2", innerH);
    const dotProduction = hover
      .append("circle")
      .attr("class", "fingrid-chart__hover-dot fingrid-chart__hover-dot--production")
      .attr("r", 4);
    const dotConsumption = hover
      .append("circle")
      .attr("class", "fingrid-chart__hover-dot fingrid-chart__hover-dot--consumption")
      .attr("r", 4);

    const tooltip = hover.append("g").attr("class", "fingrid-chart__tooltip");
    const tooltipBg = tooltip.append("rect").attr("class", "fingrid-chart__tooltip-bg").attr("rx", 2);
    const tooltipTime = tooltip.append("text").attr("class", "fingrid-chart__tooltip-time").attr("x", 10).attr("y", 16);
    // Line keys (not boxes) — a short stroke of the series color beside each
    // row, so identity never depends on the row text alone.
    tooltip
      .append("line")
      .attr("class", "fingrid-chart__tooltip-key fingrid-chart__tooltip-key--production")
      .attr("x1", 10)
      .attr("x2", 20)
      .attr("y1", 30)
      .attr("y2", 30);
    tooltip
      .append("line")
      .attr("class", "fingrid-chart__tooltip-key fingrid-chart__tooltip-key--consumption")
      .attr("x1", 10)
      .attr("x2", 20)
      .attr("y1", 46)
      .attr("y2", 46);
    const tooltipProduction = tooltip
      .append("text")
      .attr("class", "fingrid-chart__tooltip-row")
      .attr("x", 26)
      .attr("y", 34);
    const tooltipConsumption = tooltip
      .append("text")
      .attr("class", "fingrid-chart__tooltip-row")
      .attr("x", 26)
      .attr("y", 50);

    const timeFormat = d3.timeFormat("%H:%M");
    const TOOLTIP_W = 182;
    const TOOLTIP_H = 60;

    const move = (event: PointerEvent) => {
      const [px] = d3.pointer(event, g.node());
      const date = x.invert(Math.max(0, Math.min(innerW, px)));
      const pProd = nearest(production, date);
      const pCons = nearest(consumption, date);
      if (!pProd && !pCons) return;

      hover.style("display", null);

      const anchor = pProd ?? pCons!;
      const cx = x(anchor.time);
      hover.select(".fingrid-chart__crosshair").attr("x1", cx).attr("x2", cx);

      if (pProd) dotProduction.style("display", null).attr("cx", x(pProd.time)).attr("cy", y(pProd.value));
      else dotProduction.style("display", "none");
      if (pCons) dotConsumption.style("display", null).attr("cx", x(pCons.time)).attr("cy", y(pCons.value));
      else dotConsumption.style("display", "none");

      tooltipTime.text(timeFormat(anchor.time));
      tooltipProduction.text(pProd ? `PRODUCTION  ${formatMW(pProd.value)} MW` : "PRODUCTION  —");
      tooltipConsumption.text(pCons ? `CONSUMPTION  ${formatMW(pCons.value)} MW` : "CONSUMPTION  —");

      // Flip the tooltip to the left of the crosshair once it would overflow
      // the chart's right edge — never let it clip.
      const flip = cx + 14 + TOOLTIP_W > innerW;
      const tx = flip ? cx - 14 - TOOLTIP_W : cx + 14;
      tooltip.attr("transform", `translate(${tx},0)`);
      tooltipBg.attr("width", TOOLTIP_W).attr("height", TOOLTIP_H);
    };

    const leave = () => hover.style("display", "none");

    g.append("rect")
      .attr("class", "fingrid-chart__overlay")
      .attr("width", innerW)
      .attr("height", innerH)
      .on("pointermove", move)
      .on("pointerleave", leave);
  }, [production, consumption, width, height]);

  return (
    <div className="viz-toy">
      <div className="fingrid-chart__status">
        <span className={`fingrid-chart__dot${isLive ? " fingrid-chart__dot--live" : ""}`} aria-hidden="true" />
        {isLive ? "LIVE — data.fingrid.fi" : "CACHED SNAPSHOT"}
        {error && <span className="fingrid-chart__error"> · live fetch failed, showing last known data</span>}
      </div>

      <div className="fingrid-chart__stats">
        <div className="fingrid-chart__stat">
          <span className="fingrid-chart__stat-label">PRODUCTION</span>
          <span className="fingrid-chart__stat-value">
            {formatMW(latestProduction?.value)}
            <span className="fingrid-chart__stat-unit"> MW</span>
          </span>
        </div>
        <div className="fingrid-chart__stat">
          <span className="fingrid-chart__stat-label">CONSUMPTION</span>
          <span className="fingrid-chart__stat-value">
            {formatMW(latestConsumption?.value)}
            <span className="fingrid-chart__stat-unit"> MW</span>
          </span>
        </div>
        <div className="fingrid-chart__stat fingrid-chart__stat--net">
          <span className="fingrid-chart__stat-label">
            {netMW !== undefined && netMW < 0 ? "NET IMPORT" : "NET EXPORT"}
          </span>
          <span className="fingrid-chart__stat-value">
            <span className="fingrid-chart__stat-arrow" aria-hidden="true">
              {netMW !== undefined && netMW < 0 ? "▼" : "▲"}
            </span>{" "}
            {formatMW(netMW !== undefined ? Math.abs(netMW) : undefined)}
            <span className="fingrid-chart__stat-unit"> MW</span>
          </span>
        </div>
      </div>

      <div ref={measureRef} className="viz-canvas viz-canvas--fingrid">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          role="img"
          aria-label="Finland electricity production versus consumption, last 24 hours"
        />
      </div>

      <div className="fingrid-chart__legend">
        <span className="fingrid-chart__legend-item">
          <span className="fingrid-chart__swatch fingrid-chart__swatch--production" /> PRODUCTION
        </span>
        <span className="fingrid-chart__legend-item">
          <span className="fingrid-chart__swatch fingrid-chart__swatch--consumption" /> CONSUMPTION
        </span>
        <span className="fingrid-chart__legend-item fingrid-chart__legend-item--muted">MW · LAST 24H</span>
      </div>

      <p className="fingrid-chart__caption">
        Finland balances production and consumption in real time — the gap between the two lines is covered
        (or absorbed) by cross-border interconnectors with neighboring Nordic and Baltic grids.
      </p>
    </div>
  );
}
