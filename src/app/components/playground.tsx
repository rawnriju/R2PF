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
  render: () => React.ReactNode;
}

// Each entry is a small, standalone experiment — the title asks the
// question and the chart answers it, with no restated subtitle in between.
// `desc` is reserved for the rare viz that needs a line of framing the
// chart itself can't carry.
//
// Cards stack full-width rather than sitting in a 2-up grid: every viz here
// is either a stack of related charts (VIZ_01's six strips, VIZ_02's pair)
// or a time series, and all of them read badly at half width. A half-width
// card also stranded the last one alone beside an empty column.
const VIZZES: VizEntry[] = [
  {
    index: "VIZ_01",
    title: "In which ways is Kerala actually unusual?",
    render: () => <KeralaOutlierStrips />,
  },
  {
    index: "VIZ_02",
    title: "Anime, by the numbers",
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

        <div className="playground-grid mt-16 flex flex-col gap-5">
          {VIZZES.map((v) => (
            <div key={v.index} className="viz-card chamfer">
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
