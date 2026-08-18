import { useEffect, useState } from "react";
import mindtrekPhoto from "../../assets/MindtrekPic.jpeg";
import kobPhoto from "../../assets/KOB.png";
import { useInView } from "../hooks/use-in-view";
import "./volunteering.css";

interface VolunteerEntry {
  id: string;
  index: string;
  title: string;
  org: string;
  desc: string;
  tags: string[];
  accent: string;
  link: string;
  linkLabel: string;
  photo: string;
  caption: string;
  modalMaxWidth?: string;
}

const VOLUNTEER_ENTRIES: VolunteerEntry[] = [
  {
    id: "mindtrek",
    index: "VOL_01",
    title: "Mindtrek",
    org: "Tampere, Finland",
    desc: "My first time volunteering for an academic event and it taught me a lot about how research and academia actually work. Mindtrek is an international technology conference held annually in Tampere, Finland which covers various topics in technology, media, and society.",
    tags: ["ACADEMIC CONFERENCE", "TAMPERE"],
    accent: "var(--brand)",
    link: "https://www.mindtrek.org/",
    linkLabel: "mindtrek.org",
    photo: mindtrekPhoto,
    caption: "Volunteering at Mindtrek, Tampere",
  },
  {
    id: "kochi-overboard",
    index: "VOL_02",
    title: "Kochi Overboard",
    org: "Kochi, India",
    desc: "Was part of a social community for fun in Kochi called KochiOverboard, it was started by my friend and I helped out organising events and managing logistics and other things. It was my first time feeling part of a community and knowing what it means to give back and create a fun space for everyone.",
    tags: ["COMMUNITY", "KOCHI"],
    accent: "var(--brand-2)",
    link: "https://www.instagram.com/kochi.overboard/",
    linkLabel: "@kochi.overboard",
    photo: kobPhoto,
    caption: "A collection of photos from my time at Kochi Overboard",
    modalMaxWidth: "640px",
  },
];

export function Volunteering() {
  const [openId, setOpenId] = useState<string | null>(null);
  const openEntry = VOLUNTEER_ENTRIES.find((e) => e.id === openId) ?? null;
  const { ref: listRef, inView: listInView } = useInView<HTMLDivElement>();

  useEffect(() => {
    if (!openEntry) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openEntry]);

  return (
    <>
      <div
        ref={listRef}
        className="hairline-list volunteer-list flex flex-col gap-px"
        data-inview={listInView}
      >
        {VOLUNTEER_ENTRIES.map((entry) => (
          <div
            key={entry.id}
            className="hairline-row volunteer-row flex items-center gap-4 p-5"
            role="button"
            tabIndex={0}
            aria-label={`${entry.title} — view photo`}
            onClick={() => setOpenId(entry.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpenId(entry.id);
              }
            }}
            style={{ "--card-accent": entry.accent } as React.CSSProperties}
          >
            <span className="volunteer-row__index font-mono shrink-0">{entry.index}</span>
            <div className="volunteer-row__main min-w-0 flex-1">
              <div className="flex items-baseline gap-2 flex-wrap">
                <h4 className="volunteer-row__title">{entry.title}</h4>
                <span className="volunteer-row__org font-mono">{entry.org}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {entry.tags.map((t) => (
                  <span key={t} className="volunteer-row__tag font-mono">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <span className="volunteer-row__view font-mono shrink-0">VIEW ↗</span>
          </div>
        ))}
      </div>

      {openEntry && (
        <div className="volunteer-modal-overlay" onClick={() => setOpenId(null)}>
          <div
            className="volunteer-modal chamfer"
            role="dialog"
            aria-modal="true"
            aria-label={openEntry.caption}
            onClick={(e) => e.stopPropagation()}
            style={
              {
                "--card-accent": openEntry.accent,
                "--modal-max-width": openEntry.modalMaxWidth ?? "440px",
              } as React.CSSProperties
            }
          >
            <button
              type="button"
              className="volunteer-modal__close"
              onClick={() => setOpenId(null)}
              aria-label="Close"
            >
              ✕
            </button>
            <img
              src={openEntry.photo}
              alt={openEntry.caption}
              className="volunteer-modal__photo"
            />
            <p className="volunteer-modal__caption font-mono">{openEntry.caption}</p>
            <p className="volunteer-modal__desc">{openEntry.desc}</p>
            <a
              href={openEntry.link}
              target="_blank"
              rel="noreferrer"
              className="volunteer-modal__link font-mono"
            >
              {openEntry.linkLabel} ↗
            </a>
          </div>
        </div>
      )}
    </>
  );
}
