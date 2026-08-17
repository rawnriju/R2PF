import { Link } from "react-router";
import { ThemeToggle } from "./theme-toggle";
import { KeralaOutlierStrips } from "./viz/kerala-outlier-strips";
import { AnimeLengthPanel } from "./viz/anime-length-panel";
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
  desc?: string;
  wide?: boolean;
  render: () => React.ReactNode;
}

// Each entry is a small, standalone experiment — one question, one chart,
// one sentence of insight, answered inside `render()` itself. `desc` is
// reserved for the rare viz that needs a line explaining its data source
// up front (see VIZ_03); the small ones let the title ask the question and
// the chart answer it, with no restated subtitle in between. `wide` spans
// both grid columns, for the two cards that hold a stack of related charts
// rather than a single one-question-one-chart sketch.
const VIZZES: VizEntry[] = [
  {
    index: "VIZ_01",
    title: "In which ways is Kerala actually unusual?",
    wide: true,
    render: () => <KeralaOutlierStrips />,
  },
  {
    index: "VIZ_02",
    title: "Anime, by the numbers",
    wide: true,
    render: () => <AnimeLengthPanel />,
  },
  {
    index: "VIZ_03",
    title: "Does Finland make all its own electricity?",
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
          Small experiments in real data — one question, one chart, one observation each.
        </p>

        <div className="playground-grid mt-16 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {VIZZES.map((v) => (
            <div key={v.index} className={`viz-card chamfer${v.wide ? " lg:col-span-2" : ""}`}>
              <div className="flex items-center justify-between">
                <span className="viz-card__index font-mono">{v.index}</span>
              </div>
              <h3 className="viz-card__title mt-3">{v.title}</h3>
              {v.desc && <p className="viz-card__desc mt-2">{v.desc}</p>}
              <div className="mt-5">{v.render()}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
