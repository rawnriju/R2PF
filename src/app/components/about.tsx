const CAPABILITIES = [
  { k: "FRONTEND", v: "React, Recoil.js, TypeScript, JavaScript" },
  { k: "DATA VIZ", v: "D3.js, custom charting libraries & reporting tools" },
  { k: "CLOUD", v: "Node.js, MongoDB, Firebase, Atlassian Forge (serverless)" },
  { k: "LEADERSHIP", v: "Lead Developer & Product Owner, team management" },
];

export function About() {
  return (
    <section id="about" className="mx-auto max-w-[1200px] px-6 py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <p className="font-mono mb-3" style={{ fontSize: 12, letterSpacing: "0.25em", color: "var(--brand)" }}>
            02 // ABOUT
          </p>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(28px, 4vw, 44px)", color: "var(--fg)", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
            BUILDING USER-CENTRIC APPLICATIONS AT SCALE
          </h2>
          <p className="mt-6 max-w-[440px]" style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, lineHeight: 1.65, color: "var(--text-muted)" }}>
            I spent almost 5 years as Senior Fullstack Software Engineer at view26
            (Actiotech LLP), leading development on a Scrum management app
            that took 2nd place at Atlassian's Codegeist 2021 hackathon, and
            building data visualization tools used by 1,000+ Atlassian
            Marketplace customers. I'm now an MSc student in Software, Web
            and Cloud at Tampere University, based in Tampere, Finland.
          </p>
        </div>

        <div className="flex flex-col gap-px" style={{ background: "var(--hairline)", border: "1px solid var(--hairline)" }}>
          {CAPABILITIES.map((c) => (
            <div key={c.k} className="flex items-baseline gap-5 p-5" style={{ background: "var(--surface)" }}>
              <span className="font-mono shrink-0" style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--brand)", width: 108 }}>
                {c.k}
              </span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "var(--fg)" }}>{c.v}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
