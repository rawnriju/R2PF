import "./journey.css";

interface Milestone {
  id: string;
  period: string;
  title: string;
  org: string;
  desc: string;
  kind: "education" | "internship" | "work" | "promotion";
}

// PLACEHOLDER — dates/org for Bachelor's, internship, and the exact
// promotion date aren't confirmed anywhere else in the repo. Edit these
// before shipping; everything else (View26 start, Master's programme) is
// pulled from work.tsx / about.tsx. Most recent first — this reads top to
// bottom as "now" back to "where it started".
const MILESTONES: Milestone[] = [
  {
    id: "masters",
    period: "2025 – now",
    title: "M.Sc. in Software, Web and Cloud",
    org: "Tampere University",
    desc: "Currently exploring AI, cloud computing, and embedded systems in Finland — with a detour into psychology along the way.",
    kind: "education",
  },
  {
    id: "senior",
    period: "2023",
    title: "Senior Frontend Software Engineer",
    org: "View26 GmbH (Actiotech LLP)",
    desc: "Grew into mentoring, code review, and product strategy alongside engineering — the role that closed out almost five years at View26.",
    kind: "promotion",
  },
  {
    id: "view26",
    period: "Sept 2020",
    title: "Frontend Software Engineer",
    org: "View26 GmbH (Actiotech LLP)",
    desc: "Joined to build the Scrum management app that went on to place 2nd at Atlassian's Codegeist 2021, plus the company's charting and reporting tools.",
    kind: "work",
  },
  {
    id: "internship",
    period: "2019",
    title: "Software Engineering Intern",
    org: "iBoson Innovations",
    desc: "First taste of production code and a real engineering team, ahead of joining View26 full-time.",
    kind: "internship",
  },
  {
    id: "bachelors",
    period: "2016 – 2020",
    title: "B.Sc. in Computer Science",
    org: "Govt. Model Engineering College",
    desc: "Foundational years in software and systems — where the AR game Q.E.D. and the first real projects happened.",
    kind: "education",
  },
];

export function Journey() {
  return (
    <section id="journey" className="mx-auto max-w-[1200px] px-6 py-24">
      <div className="mb-12">
        <p className="section-eyebrow font-mono mb-3">03 // JOURNEY</p>
        <h2 className="section-title">THE TIMELINE</h2>
      </div>

      <div className="journey-line">
        {MILESTONES.map((m) => (
          <div key={m.id} className="journey-row" data-kind={m.kind}>
            <span className="journey-dot" aria-hidden="true" />
            <div className="journey-content">
              <span className="journey-period">{m.period}</span>
              <p className="journey-title">{m.title}</p>
              <p className="journey-org font-mono">{m.org}</p>
              <p className="journey-desc">{m.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
