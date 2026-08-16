import { Link } from "react-router";
import { ThemeToggle } from "./theme-toggle";
import { SkillsGraph } from "./viz/skills-graph";
import { SortableBars } from "./viz/sortable-bars";
import { FinlandGridChart } from "./viz/finland-grid-chart";
import "./playground.css";

function PlaygroundHeader() {
  return (
    <header className="blog-header sticky top-0 z-40 backdrop-blur-md">
      <div className="mx-auto max-w-[1200px] px-6 h-16 flex items-center justify-between">
        <span className="blog-header__wordmark font-mono tracking-wide">RAWN.DEV</span>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            to="/"
            className="blog-header__back font-mono transition-colors duration-200 hover:text-[var(--brand)]"
          >
            ← BACK TO HOME
          </Link>
        </div>
      </div>
    </header>
  );
}

interface VizEntry {
  index: string;
  title: string;
  desc: string;
  render: () => React.ReactNode;
}

const VIZZES: VizEntry[] = [
  {
    index: "VIZ_01",
    title: "Skills Constellation",
    desc: "A force-directed graph (d3-force) of my tech stack. Drag any node — the simulation relaxes back around it.",
    render: () => <SkillsGraph />,
  },
  {
    index: "VIZ_02",
    title: "Sortable Bars",
    desc: "Keyed enter/update transitions — bars swap position by identity, not by redrawing the chart.",
    render: () => <SortableBars />,
  },
  {
    index: "VIZ_03",
    title: "Finland Electricity Grid",
    desc: "Real production vs. consumption data for Finland, polled from Fingrid's open API — with a static fallback if the live call fails.",
    render: () => <FinlandGridChart />,
  },
];

export function PlaygroundPage() {
  return (
    <div className="page-shell min-h-screen w-full">
      <PlaygroundHeader />

      <main className="mx-auto max-w-[1200px] px-6 py-24">
        <p className="section-eyebrow font-mono mb-3">05 // PLAYGROUND</p>
        <h1 className="section-title">DATA VIZ PLAYGROUND</h1>
        <p className="blog-intro mt-6 max-w-[560px]">
          A few D3.js sketches — some playful, one wired to a real, live data source.
        </p>

        <div className="playground-grid mt-16 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {VIZZES.map((v) => (
            <div key={v.index} className="viz-card chamfer">
              <div className="flex items-center justify-between">
                <span className="viz-card__index font-mono">{v.index}</span>
              </div>
              <h3 className="viz-card__title mt-3">{v.title}</h3>
              <p className="viz-card__desc mt-2">{v.desc}</p>
              <div className="mt-5">{v.render()}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
