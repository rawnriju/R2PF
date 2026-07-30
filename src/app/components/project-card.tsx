export interface Project {
  id: string;
  index: string;
  title: string;
  desc: string;
  tags: string[];
  accent: string;
  /** column span for asymmetric manga layout */
  span: string;
}

export const CHAMFER =
  "polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))";

export function ProjectCard({ project, href }: { project: Project; href: string }) {
  return (
    <a
      href={href}
      className={`group relative block p-7 min-h-[220px] transition-all duration-300 ${project.span}`}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--hairline)",
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
          style={{ fontSize: 14, color: "var(--text-muted)" }}
        >
          →
        </span>
      </div>

      <h3
        className="mt-8"
        style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 22, color: "var(--fg)", lineHeight: 1.15 }}
      >
        {project.title}
      </h3>
      <p className="mt-3" style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: 1.55, color: "var(--text-muted)" }}>
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
              color: "var(--text-muted)",
              padding: "4px 8px",
              border: "1px solid var(--hairline)",
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </a>
  );
}
