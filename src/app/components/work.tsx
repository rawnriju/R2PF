import { ProjectCard, type Project } from "./project-card";
import "./work.css";

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
        <p className="section-eyebrow font-mono mb-3">02 // WORK</p>
        <h2 className="section-title">EXPERIENCE</h2>
      </div>

      <div className="work-infobar mb-16 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
        <span className="stat-span font-mono">
          [ COMPANY: <span className="stat-span__value">View26 GmbH (Actiotech LLP)</span> ]
        </span>
        <span className="dot-sep hidden sm:inline">•</span>
        <span className="stat-span font-mono">
          [ ROLE: <span className="stat-span__value">Senior Full-Stack Software Engineer</span> ]
        </span>
        <span className="dot-sep hidden sm:inline">•</span>
        <span className="stat-span font-mono">
          [ PERIOD: <span className="stat-span__value">Sept 2020 – July 2025</span> ]
        </span>
      </div>

      <h3 className="section-subtitle mb-8">TECHNICAL ARSENAL</h3>
      <div className="hairline-list flex flex-col gap-px mb-16">
        {CAPABILITIES.map((c) => (
          <div key={c.k} className="hairline-row flex items-baseline gap-5 p-5">
            <span className="work-capability__key font-mono shrink-0">{c.k}</span>
            <span className="work-capability__value">{c.v}</span>
          </div>
        ))}
      </div>

      <div className="mb-8 flex items-end justify-between">
        <h3 className="section-subtitle">SELECTED PROJECTS</h3>
        <span className="work-entry-count font-mono hidden sm:block">
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
