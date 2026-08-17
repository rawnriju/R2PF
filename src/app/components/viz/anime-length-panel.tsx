import { AnimeOutlierScatter } from "./anime-outlier-scatter";
import { AnimeLengthHistogram } from "./anime-length-histogram";

/** Two small anime experiments sharing one card frame — each keeps its own
    question, chart, and insight; only the outer border and title are
    shared, so this reads as one grouped theme rather than a merged chart.
    Both questions are scoped to "top-rated" on purpose: the underlying
    sample is a slice off the top of MyAnimeList's ranking, not a
    cross-section (see anime-analysis.ts). */
export function AnimeLengthPanel() {
  return (
    <div className="mini-viz-panel">
      <div className="mini-viz-panel__col">
        <p className="mini-viz-panel__question">Among the best-rated anime, does length matter?</p>
        <AnimeOutlierScatter />
      </div>
      <div className="mini-viz-panel__col">
        <p className="mini-viz-panel__question">So how long is a great anime, usually?</p>
        <AnimeLengthHistogram />
      </div>
    </div>
  );
}
