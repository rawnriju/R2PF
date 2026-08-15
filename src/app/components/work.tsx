import { useInView } from "../hooks/use-in-view";
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
    story: {
      work: [
        "Refactored the frontend architecture of Scrum Manager after running into a **single large custom hook** that was responsible for most of the app's state management and backend API calls. This made the data flow hard to reason about and slowed down feature development, since even small changes risked unintended side effects. Given that the product was actively being built and couldn't be paused for a full rewrite, I chose an **incremental refactor approach**. I split the hook into smaller, domain-focused pieces and introduced **Recoil** to better separate and clarify component ownership of state.",
        "Reworked API call flow and component loading under performance constraints where multiple components were unintentionally triggering **overlapping requests and re-renders**. Instead of adding more ad-hoc fixes, I reorganized the request order based on component dependencies and ensured each component only subscribed to the data it actually needed. This reduced unnecessary network and rendering overhead, resulting in **~20% lower initial render time**, **~30% fewer unnecessary re-renders** across key dashboard components, and a significant reduction in duplicate API calls.",
      ],
      reflection:
        "If I could do it over, I would have introduced clearer boundaries between **server state, client state, and UI state** earlier, and likely adopted **TanStack Query** sooner to reduce the need for custom orchestration around caching and request management.",
    },
  },
  {
    id: "p2",
    index: "PRJ_02",
    title: "Charts & Reports",
    desc: "A proprietary charting library and reporting web app on the Atlassian Marketplace, used by 1,000+ customers, with custom charts and enhanced customizability.",
    tags: ["REACT", "D3.JS", "JAVASCRIPT"],
    accent: "var(--brand-2)",
    span: "md:col-span-1",
    story: {
      work: [
        "Maintained and extended a proprietary charting library of the company. The core challenge here was working within a **legacy JavaScript system** where chart configuration, rendering, and lifecycle logic were all **tightly coupled**. This made it difficult to add new charts, but I studied it and safely extended and maintained the system.",
        "I also worked on a new system for chart customization in the main app, but this came with a different set of constraints. The existing chart definitions were persisted through a backend structure that **couldn't be changed without breaking compatibility** with existing reports. To work around this, I introduced a separate customization object that was user defined and built a **reconciliation layer** that merged the canonical backend definition with user-specific settings when the chart was reconstructed on the frontend.",
      ],
      reflection:
        "If I could change one thing across both systems, it would be improving documentation around the architecture and data flow, and more strongly pushing for a **deeper rewrite that included backend changes** as well, which I felt would have been the cleaner long-term solution.",
    },
  },
  {
    id: "p3",
    index: "PRJ_03",
    title: "Cloud & Serverless Applications",
    desc: "Worked on a serverless app port for the Atlassian Forge and monday.com marketplace, that enabled collaborative work estimation and tag-based file retrieval.",
    tags: ["FORGE", "SERVERLESS","CLOUD", "JIRA"],
    accent: "var(--brand)",
    span: "md:col-span-1",
    story: {
      work: [
        "I ported Scrum Manager to **Atlassian Forge** and the **monday.com marketplace**, which basically meant taking a traditionally hosted app and adapting it to **serverless environments** with very different constraints around execution, storage, authentication, and APIs.",
        "I started by breaking the system down into **core workflows and platform-specific pieces**, so I could clearly see what logic was reusable and what needed to be rebuilt for each platform. The idea was to keep the product behavior consistent while still using each platform's native capabilities.",
        "I designed the architecture around serverless limitations, so instead of relying on persistent server state, I moved things like authentication, API calls, and data access into **dedicated integration layers** that were specific to each platform.",
        "The main decision I made was to go **platform-native** rather than forcing a shared backend abstraction. That made each integration fit better with its platform, but it did mean some duplication across implementations.",
        "I validated each port by comparing it to the original hosted product workflows, focusing on **end-to-end behavior** like authentication, API calls, persistence, and error handling to make sure the user experience stayed consistent.",
      ],
      reflection:
        "If I could change one thing, I would define the **shared domain model and integration boundaries** earlier. That would have reduced duplication and made it easier to scale the system to more platforms later on.",
    },
  },
];

export function Work() {
  const header = useInView<HTMLDivElement>();
  const infobar = useInView<HTMLDivElement>();
  const capabilities = useInView<HTMLDivElement>();
  const projects = useInView<HTMLDivElement>();

  return (
    <section id="work" className="mx-auto max-w-[1200px] px-6 py-24">
      <div ref={header.ref} className="mb-8 reveal-up" data-inview={header.inView}>
        <p className="section-eyebrow font-mono mb-3">02 // WORK</p>
        <h2 className="section-title">EXPERIENCE</h2>
      </div>

      <div
        ref={infobar.ref}
        className="work-infobar mb-16 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center reveal-up"
        data-inview={infobar.inView}
      >
        <span className="stat-span font-mono">
          [ COMPANY: <span className="stat-span__value">View26 GmbH (Actiotech LLP)</span> ]
        </span>
        <span className="dot-sep hidden sm:inline">•</span>
        <span className="stat-span font-mono">
          [ ROLE: <span className="stat-span__value">Senior Frontend Software Engineer</span> ]
        </span>
        <span className="dot-sep hidden sm:inline">•</span>
        <span className="stat-span font-mono">
          [ PERIOD: <span className="stat-span__value">Sept 2020 – July 2025</span> ]
        </span>
      </div>

      <h3 className="section-subtitle mb-8">TECHNICAL STACK</h3>
      <div
        ref={capabilities.ref}
        className="hairline-list work-capabilities flex flex-col gap-px mb-16"
        data-inview={capabilities.inView}
      >
        {CAPABILITIES.map((c) => (
          <div key={c.k} className="hairline-row flex items-baseline gap-5 p-5">
            <span className="work-capability__key font-mono shrink-0">{c.k}</span>
            <span className="work-capability__value">{c.v}</span>
          </div>
        ))}
      </div>

      <div ref={projects.ref} className="work-projects-block" data-inview={projects.inView}>
        <div className="mb-8 flex items-end justify-between">
          <h3 className="section-subtitle">SELECTED PROJECTS</h3>
          <span className="work-entry-count font-mono hidden sm:block">
            [ 03 ENTRIES ]
          </span>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-5 work-projects"
          data-inview={projects.inView}
        >
          {PROJECTS.map((p) => (
            <ProjectCard key={p.id} project={p} href="#work" />
          ))}
        </div>
      </div>
    </section>
  );
}
