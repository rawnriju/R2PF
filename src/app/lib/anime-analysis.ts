// Shared data-shaping for the small anime vizzes in the playground.
//
// IMPORTANT — what this dataset is, and isn't. It was collected from Jikan
// while MyAnimeList's own backend was intermittently unreachable: only the
// cached, top-of-the-ranking pages ever answered, so the sample spans
// roughly MAL's 450 highest-ranked titles and contains nothing scoring
// below ~8.2. It is a slice of the *best-reviewed* anime, not a
// cross-section of anime.
//
// Every question asked of it here is therefore scoped to "among top-rated
// anime". Asking whether bad anime run long is impossible with this sample,
// because it contains no bad anime — and the components say so on screen
// rather than quietly implying otherwise. Re-running
// scripts/fetch-anime-dataset.mjs once MAL is healthy will widen the
// sample; the scope line rendered in the UI is computed from the data, so
// it will update itself.

export interface AnimeRow {
  mal_id: number;
  title: string;
  type: string | null;
  source: string | null;
  status: string | null;
  episodes: number | null;
  score: number | null;
  scored_by: number | null;
  rank: number | null;
  popularity: number | null;
  members: number | null;
  favorites: number | null;
  year: number | null;
  genres: string[];
  duration: string | null;
  url: string;
}

export interface RatedAnime extends AnimeRow {
  episodes: number;
  score: number;
  scored_by: number;
  members: number;
}

// Below this many raters, a score is mostly noise (a handful of fans voting
// 10/10 on something nobody else watched) rather than a signal about the
// show itself.
const MIN_VOTES = 1000;

export function dedupeById(rows: AnimeRow[]): AnimeRow[] {
  const seen = new Set<number>();
  const out: AnimeRow[] = [];
  for (const r of rows) {
    if (seen.has(r.mal_id)) continue;
    seen.add(r.mal_id);
    out.push(r);
  }
  return out;
}

/** Finished TV series with a known, final episode count and enough votes to
    trust the score. Movies excluded — a movie's "episode count" of 1 isn't
    the same quantity as a series' episode count. Still-airing/unaired
    titles excluded — their episode counts aren't final yet. */
export function filterMainTvSet(rows: AnimeRow[]): RatedAnime[] {
  return rows.filter(
    (r): r is RatedAnime =>
      r.type === "TV" &&
      r.status === "Finished Airing" &&
      typeof r.episodes === "number" &&
      r.episodes > 0 &&
      typeof r.score === "number" &&
      typeof r.scored_by === "number" &&
      r.scored_by >= MIN_VOTES &&
      typeof r.members === "number",
  );
}

// -- correlation ----------------------------------------------------------

export function pearson(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n < 2) return 0;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let dx2 = 0;
  let dy2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    num += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }
  const denom = Math.sqrt(dx2 * dy2);
  return denom === 0 ? 0 : num / denom;
}

function rankOf(values: number[]): number[] {
  const idx = values.map((v, i) => [v, i] as const).sort((a, b) => a[0] - b[0]);
  const ranks = new Array<number>(values.length);
  let i = 0;
  while (i < idx.length) {
    let j = i;
    while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
    const avgRank = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) ranks[idx[k][1]] = avgRank;
    i = j + 1;
  }
  return ranks;
}

/** Rank-based correlation — robust to the heavy right skew in episode
    counts and to a handful of extreme long-runners having outsized
    leverage on a raw Pearson r. */
export function spearman(xs: number[], ys: number[]): number {
  return pearson(rankOf(xs), rankOf(ys));
}

export function linearRegression(xs: number[], ys: number[]): { slope: number; intercept: number } {
  const n = xs.length;
  if (n < 2) return { slope: 0, intercept: ys[0] ?? 0 };
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  return { slope, intercept: my - slope * mx };
}

// -- episode-length buckets, for the histogram ---------------------------

export interface EpisodeBucket {
  label: string;
  min: number;
  max: number;
}

export const EPISODE_BUCKETS: EpisodeBucket[] = [
  { label: "1–6", min: 1, max: 6 },
  { label: "7–13", min: 7, max: 13 },
  { label: "14–26", min: 14, max: 26 },
  { label: "27–52", min: 27, max: 52 },
  { label: "53+", min: 53, max: Infinity },
];

export interface BucketCount {
  label: string;
  count: number;
  /** Short gloss of what that run length means in broadcast terms. */
  meaning: string;
}

const BUCKET_MEANING: Record<string, string> = {
  "1–6": "a short-form series",
  "7–13": "a single cour, one broadcast season",
  "14–26": "two cours, a full year of broadcast",
  "27–52": "a long single run",
  "53+": "a multi-year long-runner",
};

export function computeBucketCounts(rows: RatedAnime[]): BucketCount[] {
  return EPISODE_BUCKETS.map((bucket) => ({
    label: bucket.label,
    count: rows.filter((r) => r.episodes >= bucket.min && r.episodes <= bucket.max).length,
    meaning: BUCKET_MEANING[bucket.label] ?? "",
  }));
}

// -- notable titles worth labelling on the scatter -----------------------

const SHORT_MAX_EPISODES = 13;
const LONG_MIN_EPISODES = 53;

export interface AnimeHighlights {
  /** Most episodes in the set. */
  longest: RatedAnime | null;
  /** Best-scoring long-runner — stayed great over a very long run. */
  bestLong: RatedAnime | null;
  /** Best-scoring single-cour series — great in very little time. */
  bestShort: RatedAnime | null;
}

/** Three labelled points, each chosen by a rule the chart can state
    plainly. Deliberately does NOT include a "long and mediocre" pick: this
    sample bottoms out around 8.2, so it contains no mediocre anime and
    inventing that category would misdescribe the data. */
export function findHighlights(rows: RatedAnime[]): AnimeHighlights {
  const best = (subset: RatedAnime[]) =>
    subset.length === 0
      ? null
      : subset.reduce((a, b) => (b.score > a.score || (b.score === a.score && b.scored_by > a.scored_by) ? b : a));

  const longest =
    rows.length === 0 ? null : rows.reduce((a, b) => (b.episodes > a.episodes ? b : a));
  const bestLong = best(rows.filter((r) => r.episodes >= LONG_MIN_EPISODES));
  const bestShort = best(rows.filter((r) => r.episodes <= SHORT_MAX_EPISODES));

  // If the longest happens also to be the best long-runner, don't label it
  // twice — drop the weaker claim.
  return {
    longest,
    bestLong: bestLong && longest && bestLong.mal_id === longest.mal_id ? null : bestLong,
    bestShort,
  };
}

// -- what the sample actually covers, computed so it can't go stale ------

export interface DatasetScope {
  n: number;
  minScore: number;
  maxScore: number;
  medianScore: number;
  worstRank: number | null;
}

export function describeScope(rows: RatedAnime[]): DatasetScope {
  const scores = rows.map((r) => r.score).sort((a, b) => a - b);
  const ranks = rows.map((r) => r.rank).filter((r): r is number => typeof r === "number");
  return {
    n: rows.length,
    minScore: scores[0] ?? 0,
    maxScore: scores[scores.length - 1] ?? 0,
    medianScore: scores[Math.floor(scores.length / 2)] ?? 0,
    worstRank: ranks.length > 0 ? Math.max(...ranks) : null,
  };
}
