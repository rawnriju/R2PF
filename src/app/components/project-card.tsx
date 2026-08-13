import type { CSSProperties } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ProjectModal } from "./project-modal";
import "./project-card.css";

/** A single constraint → decision beat; cards render one or more of these. */
export interface ProjectStory {
  /** Narrative paragraphs — constraint/problem interwoven with the decision/solution. */
  work: string[];
  /** The retrospective callout: tradeoff made, or what I'd do differently. */
  reflection: string;
}

export interface Project {
  id: string;
  index: string;
  title: string;
  desc: string;
  tags: string[];
  accent: string;
  /** column span for asymmetric manga layout */
  span: string;
  /** Case-study detail shown in a modal on click. Cards without it stay plain links. */
  story?: ProjectStory;
}

function CardChrome({ project }: { project: Project }) {
  return (
    <>
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
    </>
  );
}

export function ProjectCard({ project, href }: { project: Project; href: string }) {
  const cardStyle = { "--card-accent": project.accent } as CSSProperties;
  const cardClass = `project-card chamfer group relative block w-full cursor-pointer p-7 min-h-[220px] text-left transition-all duration-300 ${project.span}`;

  if (!project.story) {
    return (
      <a href={href} className={cardClass} style={cardStyle}>
        <CardChrome project={project} />
      </a>
    );
  }

  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>
        <button type="button" className={cardClass} style={cardStyle}>
          <CardChrome project={project} />
        </button>
      </DialogPrimitive.Trigger>
      <ProjectModal project={project} />
    </DialogPrimitive.Root>
  );
}
