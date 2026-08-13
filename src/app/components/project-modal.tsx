import type { CSSProperties } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { Project } from "./project-card";
import "./project-modal.css";

/** Splits on **marker** pairs and renders the matched spans in the card's accent color. */
function withHighlights(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((chunk, i) =>
    i % 2 === 1 ? (
      <span key={i} className="project-modal__highlight">
        {chunk}
      </span>
    ) : (
      chunk
    ),
  );
}

export function ProjectModal({ project }: { project: Project }) {
  const story = project.story;
  if (!story) return null;

  const paragraphs = [...story.work, story.reflection];

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="project-modal__overlay" />
      <DialogPrimitive.Content
        className="project-modal__content chamfer"
        style={{ "--card-accent": project.accent } as CSSProperties}
      >
        <div className="flex items-center justify-between">
          <span className="project-card__index font-mono">{project.index}</span>
          <DialogPrimitive.Close asChild>
            <button type="button" aria-label="Close" className="project-modal__close">
              <X size={16} />
            </button>
          </DialogPrimitive.Close>
        </div>

        <DialogPrimitive.Title className="project-modal__title">
          {project.title}
        </DialogPrimitive.Title>
        {/* Not shown — project.desc already lives on the card; repeating it here would be redundant. Kept for screen readers via aria-describedby. */}
        <DialogPrimitive.Description className="sr-only">
          {project.desc}
        </DialogPrimitive.Description>

        <div className="project-modal__body-group">
          {paragraphs.map((p, i) => (
            <p key={i} className="project-modal__body">
              {withHighlights(p)}
            </p>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {project.tags.map((t) => (
            <span key={t} className="project-card__tag font-mono">
              {t}
            </span>
          ))}
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
