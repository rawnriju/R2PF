interface Project {
  id: string;
  index: string;
  title: string;
  desc: string;
  tags: string[];
  accent: string;
  /** column span for asymmetric manga layout */
  span: string;
}

const PROJECTS: Project[] = [
  {
    id: "p1",
    index: "PRJ_01",
    title: "Scrum Manager App",
    desc: "Lead Developer & Product Owner for a scrum management app — daily ceremonies, estimation planning, and sprint retrospectives. Took 2nd place at Atlassian's Codegeist 2021 Hackathon. Shipped a companion Slack app and Chrome extension, and cut load times to improve performance by 20%.",
    tags: ["REACT", "RECOIL.JS", "NODE.JS", "MONGODB", "FIREBASE"],
    accent: "#FFE100",
    span: "md:col-span-2",
  },
  {
    id: "p2",
    index: "PRJ_02",
    title: "Charts & Reports",
    desc: "A proprietary charting library and reporting web app on the Atlassian Marketplace, used by 1,000+ customers, with custom charts and enhanced customizability.",
    tags: ["REACT", "D3.JS", "JAVASCRIPT"],
    accent: "#FF5500",
    span: "md:col-span-1",
  },
  {
    id: "p3",
    index: "PRJ_03",
    title: "Attachment Tags for Jira",
    desc: "A serverless app built on Atlassian Forge, plus a companion 'Planning in Scrum Manager' port for the monday.com marketplace, enabling collaborative work estimation and tag-based file retrieval.",
    tags: ["FORGE", "SERVERLESS", "JIRA"],
    accent: "#FFE100",
    span: "md:col-span-1",
  },
  {
    id: "p4",
    index: "PRJ_04",
    title: "Q.E.D. — AR Crime-Solving Game",
    desc: "An Augmented Reality crime-solving game built for Excel 2018, a techno-managerial event at Govt. Model Engineering College with 50+ participants.",
    tags: ["UNITY3D", "VUFORIA", "AR"],
    accent: "#FF5500",
    span: "md:col-span-2",
  },
];

const CHAMFER =
  "polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))";

function Card({ project }: { project: Project }) {
  return (
    <a
      href="#work"
      className={`group relative block p-7 min-h-[220px] transition-all duration-300 ${project.span}`}
      style={{
        background: "#12161F",
        border: "1px solid rgba(255,255,255,0.08)",
        clipPath: CHAMFER,
      }}
    >
      {/* corner highlight on hover */}
      <span
        className="pointer-events-none absolute top-0 right-0 h-10 w-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          borderTop: `2px solid ${project.accent}`,
          borderRight: `2px solid ${project.accent}`,
          filter: `drop-shadow(0 0 6px ${project.accent})`,
        }}
      />
      <span
        className="pointer-events-none absolute bottom-0 left-0 h-10 w-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          borderBottom: `2px solid ${project.accent}`,
          borderLeft: `2px solid ${project.accent}`,
          filter: `drop-shadow(0 0 6px ${project.accent})`,
        }}
      />

      <div className="flex items-center justify-between">
        <span className="font-mono" style={{ fontSize: 11, letterSpacing: "0.15em", color: project.accent }}>
          {project.index}
        </span>
        <span
          className="font-mono transition-transform duration-300 group-hover:translate-x-1"
          style={{ fontSize: 14, color: "#8A8F9E" }}
        >
          →
        </span>
      </div>

      <h3
        className="mt-8"
        style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 22, color: "#E2E8F0", lineHeight: 1.15 }}
      >
        {project.title}
      </h3>
      <p className="mt-3" style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: 1.55, color: "#8A8F9E" }}>
        {project.desc}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {project.tags.map((t) => (
          <span
            key={t}
            className="font-mono"
            style={{
              fontSize: 10,
              letterSpacing: "0.1em",
              color: "#8A8F9E",
              padding: "4px 8px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </a>
  );
}

export function FeaturedWork() {
  return (
    <section id="work" className="mx-auto max-w-[1200px] px-6 py-24">
      <div className="mb-12 flex items-end justify-between">
        <div>
          <p className="font-mono mb-3" style={{ fontSize: 12, letterSpacing: "0.25em", color: "#FFE100" }}>
            01 // FEATURED WORK
          </p>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(32px, 5vw, 52px)", color: "#E2E8F0", letterSpacing: "-0.02em" }}>
            SELECTED PROJECTS
          </h2>
        </div>
        <span className="font-mono hidden sm:block" style={{ fontSize: 12, color: "#8A8F9E" }}>
          [ 04 ENTRIES ]
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PROJECTS.map((p) => (
          <Card key={p.id} project={p} />
        ))}
      </div>
    </section>
  );
}
