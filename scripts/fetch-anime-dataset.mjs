// One-off data-collection script for the "Do longer anime get better ratings?"
// playground viz. Pulls from Jikan v4 (https://docs.api.jikan.moe/), which
// mirrors MyAnimeList. Run with: node scripts/fetch-anime-dataset.mjs
//
// Why /top/anime and not /anime?order_by=...: at the time this was written,
// Jikan's /anime search endpoint (any query params beyond `page`) was
// returning 504s from MAL's search backend, while /top/anime?page=N (no
// other params) worked — at least some of the time (see below) — while
// /top/anime with no filter is just the full catalog ordered by MAL rank,
// so paging through it start-to-end still gives a full spread from best- to
// worst-ranked, not just an elite slice.
//
// Why multiple rounds: MyAnimeList itself was intermittently unreachable
// while this was built (Jikan's proxy returns a fast 504 JSON body, not a
// hang, when it can't reach MAL — so a failed request is cheap, arriving in
// well under a second). A single pass during a bad stretch landed only
// ~15/180 pages, and worse, ALL of them from the front of the ranking
// (mal_id/rank-ordered), which would silently turn this into "top-rated
// anime only" — exactly the popularity/selection bias this analysis is
// supposed to guard against. Running several retry rounds with a cooldown
// between them, over still-missing pages only, lets whatever fraction of
// capacity is available accumulate a real cross-rank sample instead.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT_PATH = fileURLToPath(new URL("../src/content/playground/anime-dataset.json", import.meta.url));

const REQUEST_GAP_MS = 400;
const FETCH_TIMEOUT_MS = 8000;
const ROUNDS = 12;
const COOLDOWN_MS = 15000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(page) {
  const url = `https://api.jikan.moe/v4/top/anime?page=${page}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function pickFields(entry) {
  return {
    mal_id: entry.mal_id,
    title: entry.title_english || entry.title,
    type: entry.type, // TV, Movie, OVA, ONA, Special, Music, TV Special, CM, PV
    source: entry.source,
    status: entry.status, // Finished Airing, Currently Airing, Not yet aired
    episodes: entry.episodes, // null when unknown/still airing
    score: entry.score, // null when not enough votes
    scored_by: entry.scored_by,
    rank: entry.rank,
    popularity: entry.popularity, // lower = more popular (rank by member count)
    members: entry.members,
    favorites: entry.favorites,
    year: entry.year ?? entry.aired?.prop?.from?.year ?? null,
    genres: (entry.genres || []).map((g) => g.name),
    duration: entry.duration,
    url: entry.url,
  };
}

function writeOutput(rowsByPage) {
  const all = Object.values(rowsByPage).flat();
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(
    OUT_PATH,
    JSON.stringify(
      {
        fetchedAt: new Date().toISOString(),
        source: "https://api.jikan.moe/v4/top/anime (paged, unfiltered)",
        rowCount: all.length,
        rows: all,
      },
      null,
      0,
    ),
  );
  return all.length;
}

async function main() {
  // Page numbers spread across the full catalog (last_visible_page was
  // ~1216 at collection time, ~25 items/page, ~30k anime total). Denser at
  // the top of the rankings (where most "is it good" interest concentrates)
  // and sparser but still present all the way down, so the sample isn't
  // just an elite slice — mediocre and poorly-rated anime need to be in
  // here too or the length/rating relationship can't be tested honestly.
  const pages = new Set();
  for (let p = 1; p <= 60; p++) pages.add(p); // ranks ~1-1500, dense
  for (let p = 61; p <= 300; p += 4) pages.add(p); // ranks ~1500-7500
  for (let p = 301; p <= 1200; p += 15) pages.add(p); // ranks ~7500-30000, sparse tail
  let pending = [...pages].sort((a, b) => a - b);

  const rowsByPage = {}; // page -> rows[], so a re-run of a page just overwrites cleanly

  for (let round = 1; round <= ROUNDS && pending.length > 0; round++) {
    console.log(`-- round ${round}/${ROUNDS}: ${pending.length} pages pending --`);
    const stillPending = [];
    for (let i = 0; i < pending.length; i++) {
      const page = pending[i];
      const json = await fetchPage(page);
      if (json?.data) {
        rowsByPage[page] = json.data.map(pickFields);
      } else {
        stillPending.push(page);
      }
      if (i % 20 === 0) {
        const got = Object.values(rowsByPage).flat().length;
        console.log(`  [${i + 1}/${pending.length}] page ${page} -> ${got} rows total (${stillPending.length} failed this round)`);
      }
      await sleep(REQUEST_GAP_MS);
    }
    pending = stillPending;
    const total = writeOutput(rowsByPage);
    console.log(`round ${round} done: ${total} rows so far, ${pending.length} pages still missing. Checkpoint written.`);
    if (pending.length > 0 && round < ROUNDS) {
      console.log(`cooling down ${COOLDOWN_MS}ms before retrying missing pages...`);
      await sleep(COOLDOWN_MS);
    }
  }

  const finalTotal = writeOutput(rowsByPage);
  console.log(`Done. ${finalTotal} raw rows across ${Object.keys(rowsByPage).length} pages. ${pending.length} pages never succeeded: ${pending.join(", ")}`);
}

main();
