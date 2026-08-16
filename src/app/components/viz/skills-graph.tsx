import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useMeasure } from "../../hooks/use-measure";

interface SkillNode extends d3.SimulationNodeDatum {
  id: string;
  group: "hub" | "category" | "skill";
}

interface SkillLink {
  source: string;
  target: string;
}

// The same tech stack called out in the résumé's TECHNICAL STACK panel
// (see work.tsx's CAPABILITIES), reshaped from "category: comma list" into
// a hub → category → skill tree for the force layout below.
const NODES: SkillNode[] = [
  { id: "STACK", group: "hub" },
  { id: "Frontend", group: "category" },
  { id: "Data Viz", group: "category" },
  { id: "Cloud", group: "category" },
  { id: "Leadership", group: "category" },
  { id: "React", group: "skill" },
  { id: "TypeScript", group: "skill" },
  { id: "Recoil.js", group: "skill" },
  { id: "JavaScript", group: "skill" },
  { id: "D3.js", group: "skill" },
  { id: "Recharts", group: "skill" },
  { id: "Custom Charts", group: "skill" },
  { id: "Node.js", group: "skill" },
  { id: "MongoDB", group: "skill" },
  { id: "Firebase", group: "skill" },
  { id: "Atlassian Forge", group: "skill" },
  { id: "Lead Dev", group: "skill" },
  { id: "Product Owner", group: "skill" },
];

const LINKS: SkillLink[] = [
  { source: "STACK", target: "Frontend" },
  { source: "STACK", target: "Data Viz" },
  { source: "STACK", target: "Cloud" },
  { source: "STACK", target: "Leadership" },
  { source: "Frontend", target: "React" },
  { source: "Frontend", target: "TypeScript" },
  { source: "Frontend", target: "Recoil.js" },
  { source: "Frontend", target: "JavaScript" },
  { source: "Data Viz", target: "D3.js" },
  { source: "Data Viz", target: "Recharts" },
  { source: "Data Viz", target: "Custom Charts" },
  { source: "Cloud", target: "Node.js" },
  { source: "Cloud", target: "MongoDB" },
  { source: "Cloud", target: "Firebase" },
  { source: "Cloud", target: "Atlassian Forge" },
  { source: "Leadership", target: "Lead Dev" },
  { source: "Leadership", target: "Product Owner" },
];

const RADIUS: Record<SkillNode["group"], number> = {
  hub: 20,
  category: 13,
  skill: 6,
};

export function SkillsGraph() {
  const { ref: measureRef, width, height } = useMeasure<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || width === 0 || height === 0) return;

    // Deep-clone so re-running this effect (on resize) starts the layout
    // fresh instead of reusing simulation-mutated node positions from a
    // previous width.
    const nodes: SkillNode[] = NODES.map((n) => ({ ...n }));
    const links = LINKS.map((l) => ({ ...l }));

    const simulation = d3
      .forceSimulation<SkillNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<SkillNode, d3.SimulationLinkDatum<SkillNode>>(
            links as d3.SimulationLinkDatum<SkillNode>[],
          )
          .id((d) => (d as SkillNode).id)
          .distance((l) => {
            const target = l.target as SkillNode;
            return target.group === "category" ? 70 : 46;
          }),
      )
      .force("charge", d3.forceManyBody().strength(-160))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collide",
        d3.forceCollide<SkillNode>((d) => RADIUS[d.group] + 28),
      );

    const root = d3.select(svg);
    root.selectAll("*").remove();

    const link = root
      .append("g")
      .attr("class", "skills-graph__links")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("class", "skills-graph__link");

    const node = root
      .append("g")
      .attr("class", "skills-graph__nodes")
      .selectAll<SVGGElement, SkillNode>("g")
      .data(nodes)
      .join("g")
      .attr("class", (d) => `skills-graph__node skills-graph__node--${d.group}`)
      .call(
        d3
          .drag<SVGGElement, SkillNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.25).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }),
      );

    node.append("circle").attr("r", (d) => RADIUS[d.group]);

    node
      .filter((d) => d.group !== "hub")
      .append("text")
      .attr("class", "skills-graph__label")
      .attr("x", (d) => RADIUS[d.group] + 6)
      .attr("dy", "0.32em")
      .text((d) => d.id);

    node
      .filter((d) => d.group === "hub")
      .append("text")
      .attr("class", "skills-graph__label skills-graph__label--hub")
      .attr("text-anchor", "middle")
      .attr("dy", "0.32em")
      .text("STACK");

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as unknown as SkillNode).x ?? 0)
        .attr("y1", (d) => (d.source as unknown as SkillNode).y ?? 0)
        .attr("x2", (d) => (d.target as unknown as SkillNode).x ?? 0)
        .attr("y2", (d) => (d.target as unknown as SkillNode).y ?? 0);

      node.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [width, height]);

  return (
    <div ref={measureRef} className="viz-canvas viz-canvas--graph">
      <svg ref={svgRef} width={width} height={height} role="img" aria-label="Force-directed graph of my tech stack, draggable" />
    </div>
  );
}
