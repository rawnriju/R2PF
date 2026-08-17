import { useMemo } from "react";
import dataset from "../../content/playground/anime-dataset.json";
import { dedupeById, describeScope, filterMainTvSet, type AnimeRow } from "../lib/anime-analysis";

/** The Jikan/MAL snapshot the small anime vizzes run on. Scores move slowly
    (weeks, not minutes) compared to Fingrid's grid data, so unlike
    useFingrid this deliberately does NOT poll live — it's a fixed
    snapshot, refreshed by re-running scripts/fetch-anime-dataset.mjs.

    See anime-analysis.ts for the important caveat about what this sample
    covers: it's a top-of-the-ranking slice, not a cross-section. `scope` is
    derived from the rows so the on-screen disclosure stays true if the
    dataset is ever re-fetched wider. */
export function useAnimeDataset() {
  return useMemo(() => {
    const rows = dedupeById(dataset.rows as AnimeRow[]);
    const tvSet = filterMainTvSet(rows);
    return { tvSet, scope: describeScope(tvSet), fetchedAt: dataset.fetchedAt as string };
  }, []);
}
