import "./stats-bar.css";

const STATS = [
  { label: "EXP", value: "5 YRS" },
  { label: "STACK", value: "REACT / NODE.JS / TYPESCRIPT / D3.JS" },
  { label: "LOC", value: "TAMPERE, FINLAND" },
];

export function StatsBar() {
  return (
    <div className="stats-bar">
      <div className="mx-auto max-w-[1200px] px-6 py-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {STATS.map((s, i) => (
          <div key={s.label} className="flex items-center gap-6">
            <span className="stat-span font-mono">
              [ {s.label}: <span className="stat-span__value">{s.value}</span> ]
            </span>
            {i < STATS.length - 1 && (
              <span className="dot-sep hidden sm:inline">•</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
