import { ProjectCard, type Project } from "./project-card";

const SIDE_PROJECTS: Project[] = [
  {
    id: "qed",
    index: "PRJ_01",
    title: "Q.E.D. — AR Crime-Solving Game",
    desc: "An Augmented Reality crime-solving game built for Excel 2018, a techno-managerial event at Govt. Model Engineering College with 50+ participants.",
    tags: ["UNITY3D", "VUFORIA", "AR"],
    accent: "var(--brand-2)",
    span: "md:col-span-1",
  },
];

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="mb-8"
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: "clamp(22px, 3vw, 32px)",
        color: "var(--fg)",
        letterSpacing: "-0.02em",
      }}
    >
      {children}
    </h3>
  );
}

export function Extras() {
  return (
    <section id="extras" className="mx-auto max-w-[1200px] px-6 py-24">
      <div className="mb-12">
        <p className="font-mono mb-3" style={{ fontSize: 12, letterSpacing: "0.25em", color: "var(--brand)" }}>
          03 // EXTRAS
        </p>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(28px, 4vw, 44px)", color: "var(--fg)", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
          SIDE QUESTS
        </h2>
      </div>

      <SubHeading>Side Projects</SubHeading>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
        {SIDE_PROJECTS.map((p) => (
          <ProjectCard key={p.id} project={p} href="#extras" />
        ))}
      </div>

      <SubHeading>Volunteering</SubHeading>
      <div className="flex flex-col gap-px" style={{ background: "var(--hairline)", border: "1px solid var(--hairline)" }}>
        {[1, 2].map((i) => (
          <div key={i} className="flex items-baseline gap-5 p-5" style={{ background: "var(--surface)" }}>
            <span
              className="font-mono shrink-0"
              style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--brand)", width: 72 }}
            >
              SOON
            </span>
            <span
              className="animate-pulse"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 15,
                color: "var(--text-muted)",
                width: "100%",
                maxWidth: 360,
                height: 14,
                background: "var(--chip-bg)",
                borderRadius: 2,
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
