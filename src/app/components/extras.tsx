import { ProjectCard, type Project } from "./project-card";
import { Volunteering } from "./volunteering";

const SIDE_PROJECTS: Project[] = [
  {
    id: "qed",
    index: "PRJ_01",
    title: "Q.E.D. — AR Crime-Solving Game",
    desc: "An Augmented Reality crime-solving game built for Excel 2018, a techno-managerial event at Govt. Model Engineering College with 50+ participants.",
    tags: ["UNITY3D", "VUFORIA", "AR"],
    accent: "var(--brand-2)",
    span: "",
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

      <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
        <div className="md:col-span-3">
          <SubHeading>Side Projects</SubHeading>
          <div className="grid grid-cols-1 gap-5">
            {SIDE_PROJECTS.map((p) => (
              <ProjectCard key={p.id} project={p} href="#extras" />
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <SubHeading>Volunteering</SubHeading>
          <Volunteering />
        </div>
      </div>
    </section>
  );
}
