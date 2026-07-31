import type { CSSProperties } from "react";
import "./project-card.css";

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

export function ProjectCard({ project, href }: { project: Project; href: string }) {
  return (
    <a
      href={href}
      className={`project-card chamfer group relative block p-7 min-h-[220px] transition-all duration-300 ${project.span}`}
      // Feeds every accent-coloured rule in project-card.css.
      style={{ "--card-accent": project.accent } as CSSProperties}
    >
      {/* corner highlight on hover */}
      <span className="project-card__corner project-card__corner--tr pointer-events-none absolute top-0 right-0 h-10 w-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="project-card__corner project-card__corner--bl pointer-events-none absolute bottom-0 left-0 h-10 w-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex items-center justify-between">
        <span className="project-card__index font-mono">{project.index}</span>
        <span className="project-card__arrow font-mono transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </div>

      <h3 className="project-card__title mt-8">{project.title}</h3>
      <p className="project-card__desc mt-3">{project.desc}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {project.tags.map((t) => (
          <span key={t} className="project-card__tag font-mono">
            {t}
          </span>
        ))}
      </div>
    </a>
  );
}
