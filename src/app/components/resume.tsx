import { Link } from "react-router";
import { getEmail } from "../lib/email";
import { ThemeToggle } from "./theme-toggle";
import "./resume.css";

const experience = [
  {
    company: "view26 (Actiotech LLP)",
    location: "Germany",
    roles: [
      {
        title: "Senior Front-end Software Engineer",
        period: "Sept 2020 — July 2025",
      },
    ],
    groups: [
      {
        heading:
          "Software Product Development (Scrum Manager App)",
        points: [
          "Served as Lead Developer and Product Owner for the app that secured 2nd place in the Atlassian Codegeist 2021 Hackathon.",
          "Improved application performance by 20% by optimizing state management and reducing initial load times",
          "Built a companion Slack app and Chrome extension to facilitate synchronous daily scrum updates",
        ],
        tech: "React, Recoil.js, JavaScript, TypeScript, Node.js, MongoDB, Firebase",
      },
      {
        heading: "Data Visualization & Reporting Tools",
        points: [
          "Assisted in the development and maintenance of a proprietary charting library and “Charts & Reports” web app used by over 1,000 customers on the Atlassian marketplace",
          "Expanded the library with custom charts and enhanced customizability of charting within the app",
        ],
        tech: "React, D3.js, JavaScript",
      },
      {
        heading: "Cloud & Serverless Applications",
        points: [
          "Architected “Attachment Tags for Jira” on Atlassian’s Forge (serverless platform) and “Planning in Scrum Manager” for the monday marketplace — ports of Scrum Manager to other platforms",
          "Focused on building user-centric features enabling collaborative work estimations and tag-based file retrieval",
        ],
        tech: null,
      },
    ],
  },
];

const additional = [
  {
    title: "Q.E.D.",
    points: [
      "Developed an Augmented Reality crime-solving game application for the techno-managerial event Excel 2018 conducted by Govt. Model Engineering College (Tech: Unity3D, Vuforia)",
    ],
  },
  {
    title: "Technical Event Management",
    points: [
      "Organized the event that the app was built for, coordinating over 50+ participants",
    ],
  },
];

const skills = [
  {
    label: "Programming languages",
    value:
      "JavaScript (ES2015+), TypeScript, HTML, CSS, Haskell(basic)",
  },
  {
    label: "Frameworks/Libraries",
    value: "React, D3.js, Recoil.js, TanStack, Node.js,",
  },
  {
    label: "Tools and toolkit",
    value: "Git, Firebase,  mongodb, Docker, Webpack",
  },
];

const projects = [
  {
    name: "Orma",
    url: null,
    desc: "A note-taking and spaced repetition app designed to aid learning — currently in development.",
  },
  {
    name: "rawnriju.com",
    url: "https://rawnriju.com",
    desc: "Personal portfolio website.",
  },
];

const education = [
  {
    school: "Tampere University",
    place: "Tampere, Finland",
    degree: "MSc. — Software, Web and Cloud",
    period: "Aug 2025 — Present",
  },
  {
    school: "Govt. Model Engineering College",
    place: "Ernakulam, Kerala",
    degree: "B.Tech. — Computer Science and Engineering",
    period: "Aug 2016 — Aug 2020",
  },
];

const interests =
  "Web accessibiltiy, psychology, working out, Rocket League, anime";

const accent = "text-[var(--resume-accent)]";

function SectionHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h2
      className={`text-[15px] print:text-[16px] font-bold tracking-wide ${accent} mb-4 print:mb-2`}
    >
      {children}
    </h2>
  );
}

export function Resume() {
  return (
    // resume-doc is what scopes the @media print block in resume.css — that
    // stylesheet is bundled globally, so without this hook the home page
    // would print with resume paper tokens too.
    <div className="resume-doc min-h-screen print:min-h-0 w-full bg-[var(--paper-bg)] py-10 px-4 print:py-0 print:px-0 font-['Inter',sans-serif]">
      <div className="resume-doc__paper mx-auto max-w-[900px] print:max-w-none bg-[var(--paper)] px-10 py-12 md:px-14 md:py-14 print:px-0 print:py-0">
        {/* Header */}
        <header className="flex flex-col md:flex-row print:flex-row md:items-start print:items-start md:justify-between print:justify-between gap-6 print:gap-4 mb-12 print:mb-5">
          <div className="max-w-md">
            <h1
              className={`text-[52px] print:text-[46px] leading-none font-bold ${accent} mb-3 print:mb-1.5`}
            >
              Rawn Riju
            </h1>
            <p className="text-[15px] print:text-[15.5px] text-[var(--ink-3)] leading-snug">
              Software engineer with 4 years of experience
              building user-centric web applications with React,
              Node.js, and modern JavaScript frameworks
            </p>
          </div>
          <div className="text-[13px] print:text-[14.5px] text-[var(--ink-3)] space-y-1 print:space-y-0.5 md:text-right print:text-right md:pt-3 print:pt-1">
            <p>{getEmail()}</p>
            <p>Tampere, Finland</p>
            <a href="https://www.linkedin.com/in/rawn-riju-b5b199183/" target="_blank" rel="noopener noreferrer" className={`${accent} hover:underline block`}>linkedin.com/in/rawn-riju</a>
            <a href="https://github.com/rawnriju" target="_blank" rel="noopener noreferrer" className={`${accent} hover:underline block`}>github.com/rawnriju</a>
          </div>
        </header>

        {/* Two columns */}
        <div className="grid grid-cols-1 md:grid-cols-[1.9fr_1fr] print:grid-cols-[1.9fr_1fr] gap-x-12 print:gap-x-8 gap-y-10 print:gap-y-0">
          {/* Left column */}
          <main>
            <SectionHeading>Relevant Experience</SectionHeading>

            {experience.map((job) => (
              <div key={job.company} className="mb-8 print:mb-3">
                {job.roles.map((role) => (
                  <div
                    key={role.title}
                    className="flex flex-wrap items-baseline gap-x-2 mb-0.5"
                  >
                    <span className="text-[15px] print:text-[15.5px] text-[var(--ink-2)]">
                      {role.title} ·
                    </span>
                    <span className="text-[15px] print:text-[15.5px] font-semibold text-[var(--ink)]">
                      {job.company}
                    </span>
                    <span className="text-[12px] print:text-[14px] text-[var(--ink-4)]">
                      {role.period}
                    </span>
                  </div>
                ))}
                <p className="text-[12px] print:text-[14px] text-[var(--ink-4)] mb-4 print:mb-1.5">
                  {job.location}
                </p>

                {job.groups.map((group) => (
                  <div key={group.heading} className="mb-4 print:mb-2">
                    <p className="text-[13px] print:text-[15px] font-semibold text-[var(--ink-2)] mb-1.5 print:mb-1">
                      {group.heading}
                    </p>
                    <ul className="space-y-1.5 print:space-y-0.5">
                      {group.points.map((pt, i) => (
                        <li
                          key={i}
                          className="flex gap-2 text-[13px] print:text-[14.5px] text-[var(--ink-3)] leading-relaxed print:leading-snug"
                        >
                          <span className={`${accent} mt-0.5`}>
                            •
                          </span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                    {group.tech && (
                      <p className="text-[12px] print:text-[13.5px] text-[var(--ink-4)] italic mt-1.5 print:mt-1 pl-4">
                        {group.tech}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ))}

            <div className="mt-10 print:mt-4">
              <SectionHeading>
                Additional Projects & Leadership
              </SectionHeading>
              {additional.map((item) => (
                <div key={item.title} className="mb-4 print:mb-2">
                  <p className="text-[15px] print:text-[15.5px] font-semibold text-[var(--ink)] mb-1.5 print:mb-1">
                    {item.title}
                  </p>
                  <ul className="space-y-1.5 print:space-y-0.5">
                    {item.points.map((pt, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-[13px] print:text-[14.5px] text-[var(--ink-3)] leading-relaxed print:leading-snug"
                      >
                        <span className={`${accent} mt-0.5`}>
                          •
                        </span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </main>

          {/* Right sidebar */}
          <aside className="space-y-10 print:space-y-4">
            <section>
              <SectionHeading>Skills</SectionHeading>
              <div className="space-y-4 print:space-y-2">
                {skills.map((s) => (
                  <div key={s.label}>
                    <p className="text-[13px] print:text-[15px] font-semibold text-[var(--ink)] mb-1 print:mb-0.5">
                      {s.label}
                    </p>
                    <p className="text-[13px] print:text-[14.5px] text-[var(--ink-3)] leading-relaxed print:leading-snug">
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <SectionHeading>Selected Projects</SectionHeading>
              <div className="space-y-4 print:space-y-2">
                {projects.map((p) => (
                  <div key={p.name}>
                    {p.url ? (
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-[13px] print:text-[15px] font-semibold text-[var(--ink)] hover:underline mb-1 print:mb-0.5 block">
                        {p.name}
                      </a>
                    ) : (
                      <p className="text-[13px] print:text-[15px] font-semibold text-[var(--ink)] mb-1 print:mb-0.5">{p.name}</p>
                    )}
                    <p className="text-[13px] print:text-[14.5px] text-[var(--ink-3)] leading-relaxed print:leading-snug">
                      {p.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <SectionHeading>Education</SectionHeading>
              <div className="space-y-4 print:space-y-2">
                {education.map((e) => (
                  <div key={e.school}>
                    <p className="text-[13px] print:text-[15px] font-semibold text-[var(--ink)]">
                      {e.school}
                    </p>
                    <p className="text-[12px] print:text-[14px] text-[var(--ink-4)] mb-1 print:mb-0.5">
                      {e.period}
                    </p>
                    <p className="text-[13px] print:text-[14.5px] text-[var(--ink-3)] leading-relaxed print:leading-snug">
                      {e.degree}
                    </p>
                    <p className="text-[12px] print:text-[14px] text-[var(--ink-4)]">
                      {e.place}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <SectionHeading>Interests</SectionHeading>
              <p className="text-[13px] print:text-[14.5px] text-[var(--ink-3)] leading-relaxed print:leading-snug">
                {interests}
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

export function ResumePage() {
  return (
    <div className="min-h-screen print:min-h-0 w-full bg-[var(--paper-bg)]">
      <div className="resume-toolbar print:hidden sticky top-0 z-10">
        <div className="mx-auto max-w-[900px] px-4 py-3 flex items-center justify-between">
          <Link
            to="/"
            className="font-mono text-[12px] tracking-[0.12em] text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors duration-200"
          >
            ← BACK TO HOME
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => window.print()}
              className="font-mono text-[12px] tracking-[0.12em] text-[var(--brand)] border border-[var(--brand)] px-3 py-1.5 cursor-pointer hover:bg-[var(--brand)] hover:text-[var(--on-brand)] transition-colors duration-200"
            >
              PRINT / SAVE PDF
            </button>
          </div>
        </div>
      </div>
      <Resume />
    </div>
  );
}