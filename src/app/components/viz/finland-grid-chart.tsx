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

  // How much of the last 24h Finland spent short of its own demand. Paired
  // on matching timestamps rather than by index, so a series arriving one
  // reading behind the other can't silently offset the comparison.
  const balance = useMemo(() => {
    const byTime = new Map(consumption.map((c) => [c.time.getTime(), c.value]));
    let importing = 0;
    let paired = 0;
    let deficitSum = 0;
    for (const p of production) {
      const demand = byTime.get(p.time.getTime());
      if (demand === undefined) continue;
      paired++;
      if (p.value < demand) {
        importing++;
        deficitSum += demand - p.value;
      }
    }
    return { importing, paired, meanDeficit: importing > 0 ? deficitSum / importing : 0 };
  }, [production, consumption]);

  const allValues = useMemo(
    () => [...production, ...consumption].map((d) => d.value),
    [production, consumption],
  );
  const rangeLow = allValues.length ? Math.min(...allValues) : undefined;
  const rangeHigh = allValues.length ? Math.max(...allValues) : undefined;

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

  const shortfallShare =
    balance.paired > 0 ? Math.round((balance.importing / balance.paired) * 100) : 0;

  return (
    <div className="mini-viz">
      <p className="mini-viz__legend-row">
        <span className="mini-viz__key mini-viz__key--line" /> produced
        <span className="mini-viz__key mini-viz__key--line mini-viz__key--line-alt" /> consumed
        <span className={`fingrid-chart__dot${isLive ? " fingrid-chart__dot--live" : ""}`} aria-hidden="true" />
        {isLive ? "live" : "cached"}
        {error && <span className="fingrid-chart__error"> · live fetch failed</span>}
      </p>

      <div ref={measureRef} className="mini-viz__canvas mini-viz__canvas--fingrid">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          role="img"
          aria-label="Finland electricity production versus consumption over the last 24 hours"
        />
      </div>

      <div className="mini-viz__ends">
        <span>24 hours ago</span>
        <span>
          {formatMW(rangeLow)}–{formatMW(rangeHigh)} MW range · now
        </span>
      </div>

      <p className="mini-viz__insight">
        {balance.paired > 0 && balance.importing > 0 ? (
          <>
            Finland generated less power than it used for {balance.importing} of the last {balance.paired} readings
            ({shortfallShare}% of the day), with an average shortfall of {formatMW(balance.meanDeficit)} MW made up
            over the interconnectors.
          </>
        ) : (
          <>
            Over the last {balance.paired} readings Finland produced more than it consumed every single time,
            sending the surplus abroad rather than importing any.
          </>
        )}{" "}
        {netMW !== undefined &&
          (netMW < 0
            ? `Right now it is importing ${formatMW(Math.abs(netMW))} MW.`
            : `Right now it is exporting ${formatMW(netMW)} MW.`)}
      </p>
      <p className="mini-viz__caveat">
        The two lines never drift far apart because a grid has to balance every second — the gap is closed in real
        time by interconnectors to the Nordic and Baltic grids, not by storage.
      </p>
      <p className="mini-viz__source">
        Source: Fingrid open data (data.fingrid.fi) · polled every 3 minutes, falling back to a bundled snapshot.
      </p>
    </div>
  );
}
