// One-off extraction for the "Am I actually climbing?" Rocket League
// playground viz. tracker.gg's public API doesn't serve Rocket League, so
// the input is a manual export: three responses from the tracker.gg profile
// page (sessions, aggregated heatmap, profile) pasted back to back into one
// file. That makes it several JSON documents, not one, hence the
// raw_decode-style loop below instead of a single JSON.parse.
//
// Run with: node scripts/extract-rocket-league.mjs [path-to-export]
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const IN_PATH =
  process.argv[2] ??
  fileURLToPath(new URL("../src/app/components/ggtrackerdata.json", import.meta.url));
const OUT_PATH = fileURLToPath(new URL("../src/content/playground/rocket-league.json", import.meta.url));

const PLAYLISTS = {
  "Ranked Doubles 2v2": "2v2",
  "Ranked Standard 3v3": "3v3",
};

// Not in the export (tracker.gg leaves ratingRank null). Share of ranked
// players at or above Champion II, from the end-of-Season-22 rank
// distribution, entered by hand.
const PERCENTILE_TOP = { "2v2": 2.31, "3v3": 0.84 };
const PERCENTILE_SOURCE = "end of Season 22 rank distribution";

function splitDocuments(text) {
  // Walks the text tracking brace depth (string-aware) and slices out each
  // top-level {...} document.
  const docs = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) docs.push(JSON.parse(text.slice(start, i + 1)));
    }
  }
  return docs;
}

const docs = splitDocuments(readFileSync(IN_PATH, "utf8"));
const sessionsDoc = docs.find((d) => d.sessions);
const profileDoc = docs.map((d) => Object.values(d)[0]).find((d) => d?.segments);
if (!sessionsDoc || !profileDoc) throw new Error("export is missing the sessions or profile response");

// One point per recorded (possibly grouped) match: the rating after it.
const history = [];
for (const session of sessionsDoc.sessions.items) {
  for (const match of session.matches) {
    const mode = PLAYLISTS[match.metadata.playlist];
    const rating = match.stats.rating?.value;
    // matchesPlayed 0 = a session where this playlist wasn't touched; its
    // rating is a stale carry-over (e.g. 1104 on 23 Sep between 1145 and 1156).
    if (!mode || rating == null || match.stats.matchesPlayed?.value === 0) continue;
    history.push({
      mode,
      time: match.metadata.dateCollected,
      rating,
      matches: match.stats.matchesPlayed?.value ?? null,
    });
  }
}
history.sort((a, b) => a.time.localeCompare(b.time) || a.mode.localeCompare(b.mode));

const segments = profileDoc.segments;
const current = {};
for (const s of segments.filter((s) => s.type === "playlist")) {
  const mode = PLAYLISTS[s.metadata.name];
  if (!mode) continue;
  current[mode] = {
    rating: s.stats.rating.value,
    tier: s.stats.tier.metadata.name,
    division: s.stats.division.metadata.name,
    seasonMatches: s.stats.matchesPlayed.value,
    seasonPeak: s.stats.peakRating.value,
    percentileTop: PERCENTILE_TOP[mode],
  };
}
const allTimePeak = {};
for (const s of segments.filter((s) => s.type === "peak-rating")) {
  const mode = PLAYLISTS[s.metadata.name];
  if (!mode) continue;
  allTimePeak[mode] = {
    rating: s.stats.peakRating.value,
    tier: s.stats.peakRating.metadata.name,
    season: s.attributes.season,
  };
}
const lifetime = Object.fromEntries(
  Object.entries(segments.find((s) => s.type === "overview").stats)
    .filter(([k]) => ["wins", "goals", "saves", "assists", "shots", "mVPs"].includes(k))
    .map(([k, v]) => [k === "mVPs" ? "mvps" : k, v.value]),
);

const out = {
  player: profileDoc.platformInfo.platformUserHandle,
  platform: profileDoc.platformInfo.platformSlug,
  season: profileDoc.metadata.currentSeason,
  exportedAt: profileDoc.metadata.lastUpdated?.value ?? sessionsDoc.sessions.expiryDate,
  current,
  allTimePeak,
  percentileSource: PERCENTILE_SOURCE,
  lifetime,
  history,
};

writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + "\n");
console.log(`wrote ${history.length} rating points to ${OUT_PATH}`);
