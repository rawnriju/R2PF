const STATS = [
  { label: "EXP", value: "5 YRS" },
  { label: "STACK", value: "REACT / NODE.JS / TYPESCRIPT / D3.JS" },
  { label: "LOC", value: "TAMPERE, FINLAND" },
];

export function StatsBar() {
  return (
    <div
      style={{
        borderTop: "1px solid var(--hairline)",
        borderBottom: "1px solid var(--hairline)",
        background: "var(--surface)",
      }}
    >
      <div className="mx-auto max-w-[1200px] px-6 py-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {STATS.map((s, i) => (
          <div key={s.label} className="flex items-center gap-6">
            <span className="font-mono" style={{ fontSize: 11, letterSpacing: "0.1em" }}>
              <span style={{ color: "var(--text-muted)" }}>[ {s.label}: </span>
              <span style={{ color: "var(--brand)" }}>{s.value}</span>
              <span style={{ color: "var(--text-muted)" }}> ]</span>
            </span>
            {i < STATS.length - 1 && (
              <span className="hidden sm:inline" style={{ color: "var(--hairline-strong)" }}>•</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
