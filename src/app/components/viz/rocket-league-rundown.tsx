import rundown from "../../../content/playground/rocket-league-rundown.json";

interface PerMatch {
  key: string;
  label: string;
  you: number;
  community: number;
}

/**
 * Last season's per-match numbers against the community average, as a
 * diverging bar per stat: right of centre = above average, left = below.
 * Indexed to the average (percent difference) because the four stats live
 * on very different scales (0.47 assists vs 3.83 shots), so raw values on
 * one axis would make assists unreadable.
 *
 * One hue for every bar: direction is the encoding, and above average
 * isn't automatically "good" here (fewer shots is a style, not a failing).
 */
export function RocketLeagueRundown() {
  const rows = (rundown.perMatch as PerMatch[]).map((r) => ({
    ...r,
    diff: Math.round((r.you / r.community - 1) * 100),
  }));
  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.diff)), 1);

  const chips: [string, string][] = [
    ["MATCHES", String(rundown.matches)],
    ["WIN RATE", `${rundown.winPct}%`],
    ["HOURS", String(rundown.hours)],
    ["MVP RATE", `${rundown.mvpPct}%`],
    ["SHOOTING", `${rundown.shootingPct}%`],
    ["DEMOS", `${rundown.demosPerMatch}/MATCH`],
  ];

  const above = rows.filter((r) => r.diff > 0).map((r) => r.label.toLowerCase());
  const below = rows.filter((r) => r.diff < 0).map((r) => r.label.toLowerCase());

  return (
    <div className="mini-viz">
      <div className="rl-chips">
        {chips.map(([label, value]) => (
          <span key={label} className="stat-span font-mono">
            [ {label}: <span className="stat-span__value">{value}</span> ]
          </span>
        ))}
      </div>

      <p className="mini-viz__legend-row">
        <span className="mini-viz__key mini-viz__key--square rl-key--primary" /> per match vs. community average
      </p>

      <div className="rl-diverge" role="table" aria-label="Per-match stats last season compared with the community average">
        {rows.map((r) => {
          const w = (Math.abs(r.diff) / maxAbs) * 50;
          return (
            <div
              key={r.key}
              className="rl-diverge__row"
              role="row"
              title={`${r.label}: ${r.you} per match vs ${r.community} community average`}
            >
              <span className="rl-diverge__label" role="rowheader">
                {r.label}
              </span>
              <span className="rl-diverge__track" role="cell" aria-hidden="true">
                <span
                  className="rl-diverge__bar"
                  style={r.diff >= 0 ? { left: "50%", width: `${w}%` } : { right: "50%", width: `${w}%` }}
                />
              </span>
              <span className="rl-diverge__value" role="cell">
                <span className="rl-diverge__diff">
                  {r.diff > 0 ? "+" : r.diff < 0 ? "−" : ""}
                  {Math.abs(r.diff)}%
                </span>{" "}
                {r.you} vs {r.community}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mini-viz__ends rl-diverge__ends">
        <span>← below average</span>
        <span>above average →</span>
      </div>

      <p className="mini-viz__insight">
        More of a support player than a striker: last season I was above the community average on {above.join(" and ")}{" "}
        but below it on {below.join(" and ")}, and still won {rundown.winPct}% of {rundown.matches} matches.
      </p>
      <p className="mini-viz__source">Source: {rundown.source}.</p>
    </div>
  );
}
