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
  return <h3 className="section-subtitle mb-8">{children}</h3>;
}

export function Extras() {
  return (
    <section id="extras" className="mx-auto max-w-[1200px] px-6 py-24">
      <div className="mb-12">
        <p className="section-eyebrow font-mono mb-3">04 // EXTRAS</p>
        <h2 className="section-title">SIDE QUESTS</h2>
      </div>

      <SubHeading>Side Projects</SubHeading>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
        {SIDE_PROJECTS.map((p) => (
          <ProjectCard key={p.id} project={p} href="#extras" />
        ))}
      </div>

      <SubHeading>Volunteering</SubHeading>
      <div className="hairline-list flex flex-col gap-px">
        {[1, 2].map((i) => (
          <div key={i} className="hairline-row flex items-baseline gap-5 p-5">
            <span className="soon-row__tag font-mono shrink-0">SOON</span>
            <span className="soon-row__bar animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  );
}
