const STATS = [
  { label: "EXP", value: "5 YRS" },
  { label: "STACK", value: "REACT / NODE.JS / TYPESCRIPT / D3.JS" },
  { label: "LOC", value: "TAMPERE, FINLAND" },
];

export function StatsBar() {
  return (
    <div
      style={{
        borderTop: "1px solid rgba(255,255,255,0.08)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "#12161F",
      }}
    >
      <div className="mx-auto max-w-[1200px] px-6 py-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {STATS.map((s, i) => (
          <div key={s.label} className="flex items-center gap-6">
            <span className="font-mono" style={{ fontSize: 11, letterSpacing: "0.1em" }}>
              <span style={{ color: "#8A8F9E" }}>[ {s.label}: </span>
              <span style={{ color: "#FFE100" }}>{s.value}</span>
              <span style={{ color: "#8A8F9E" }}> ]</span>
            </span>
            {i < STATS.length - 1 && (
              <span className="hidden sm:inline" style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
