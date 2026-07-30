import { ProjectCard, type Project } from "./project-card";

const CAPABILITIES = [
  { k: "FRONTEND", v: "React, Recoil.js, TypeScript, JavaScript" },
  { k: "DATA VIZ", v: "D3.js, custom charting libraries & reporting tools" },
  { k: "CLOUD", v: "Node.js, MongoDB, Firebase, Atlassian Forge (serverless)" },
  { k: "LEADERSHIP", v: "Lead Developer & Product Owner, team management" },
];

const PROJECTS: Project[] = [
  {
    id: "p1",
    index: "PRJ_01",
    title: "Scrum Manager App",
    desc: "Lead Developer & Product Owner for a scrum management app — daily ceremonies, estimation planning, and sprint retrospectives. Took 2nd place at Atlassian's Codegeist 2021 Hackathon. Shipped a companion Slack app and Chrome extension, and cut load times to improve performance by 20%.",
    tags: ["REACT", "RECOIL.JS", "NODE.JS", "MONGODB", "FIREBASE"],
    accent: "var(--brand)",
    span: "md:col-span-1",
  },
  {
    id: "p2",
    index: "PRJ_02",
    title: "Charts & Reports",
    desc: "A proprietary charting library and reporting web app on the Atlassian Marketplace, used by 1,000+ customers, with custom charts and enhanced customizability.",
    tags: ["REACT", "D3.JS", "JAVASCRIPT"],
    accent: "var(--brand-2)",
    span: "md:col-span-1",
  },
  {
    id: "p3",
    index: "PRJ_03",
    title: "Attachment Tags for Jira",
    desc: "A serverless app built on Atlassian Forge, plus a companion 'Planning in Scrum Manager' port for the monday.com marketplace, enabling collaborative work estimation and tag-based file retrieval.",
    tags: ["FORGE", "SERVERLESS", "JIRA"],
    accent: "var(--brand)",
    span: "md:col-span-1",
  },
];

export function Work() {
  return (
    <section id="work" className="mx-auto max-w-[1200px] px-6 py-24">
      <div className="mb-8">
        <p className="font-mono mb-3" style={{ fontSize: 12, letterSpacing: "0.25em", color: "var(--brand)" }}>
          02 // WORK
        </p>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(28px, 4vw, 44px)", color: "var(--fg)", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
          EXPERIENCE
        </h2>
      </div>

      <div
        className="mb-16 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center"
        style={{
          padding: "18px 24px",
          border: "1px solid var(--hairline)",
          background: "var(--chip-bg)",
        }}
      >
        <span className="font-mono" style={{ fontSize: 11, letterSpacing: "0.1em" }}>
          <span style={{ color: "var(--text-muted)" }}>[ COMPANY: </span>
          <span style={{ color: "var(--brand)" }}>View26 GmbH (Actiotech LLP)</span>
          <span style={{ color: "var(--text-muted)" }}> ]</span>
        </span>
        <span className="hidden sm:inline" style={{ color: "var(--hairline-strong)" }}>•</span>
        <span className="font-mono" style={{ fontSize: 11, letterSpacing: "0.1em" }}>
          <span style={{ color: "var(--text-muted)" }}>[ ROLE: </span>
          <span style={{ color: "var(--brand)" }}>Senior Full-Stack Software Engineer</span>
          <span style={{ color: "var(--text-muted)" }}> ]</span>
        </span>
        <span className="hidden sm:inline" style={{ color: "var(--hairline-strong)" }}>•</span>
        <span className="font-mono" style={{ fontSize: 11, letterSpacing: "0.1em" }}>
          <span style={{ color: "var(--text-muted)" }}>[ PERIOD: </span>
          <span style={{ color: "var(--brand)" }}>Sept 2020 – July 2025</span>
          <span style={{ color: "var(--text-muted)" }}> ]</span>
        </span>
      </div>

      <h3 className="mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(22px, 3vw, 32px)", color: "var(--fg)", letterSpacing: "-0.02em" }}>
        TECHNICAL ARSENAL
      </h3>
      <div className="flex flex-col gap-px mb-16" style={{ background: "var(--hairline)", border: "1px solid var(--hairline)" }}>
        {CAPABILITIES.map((c) => (
          <div key={c.k} className="flex items-baseline gap-5 p-5" style={{ background: "var(--surface)" }}>
            <span className="font-mono shrink-0" style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--brand)", width: 108 }}>
              {c.k}
            </span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "var(--fg)" }}>{c.v}</span>
          </div>
        ))}
      </div>

      <div className="mb-8 flex items-end justify-between">
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(22px, 3vw, 32px)", color: "var(--fg)", letterSpacing: "-0.02em" }}>
          SELECTED PROJECTS
        </h3>
        <span className="font-mono hidden sm:block" style={{ fontSize: 12, color: "var(--text-muted)" }}>
          [ 03 ENTRIES ]
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PROJECTS.map((p) => (
          <ProjectCard key={p.id} project={p} href="#work" />
        ))}
      </div>
    </section>
  );
}
