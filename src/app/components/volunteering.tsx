import { useEffect, useState } from "react";
import mindtrekPhoto from "../../assets/MindtrekPic.jpeg";
import kobPhoto from "../../assets/KOB.png";
import ecerPhoto from "../../assets/RawnECERPhoto.jpg";
import ecerTeamPhoto from "../../assets/Volunteer_Team6-1200.jpg";
import { useInView } from "../hooks/use-in-view";
import "./volunteering.css";

interface VolunteerPhoto {
  src: string;
  alt: string;
  // width / height. Only matters when an entry has several photos: they sit
  // in one row with flex-grow proportional to this, so they share a height.
  aspect?: number;
}

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
  photos: VolunteerPhoto[];
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
    photos: [{ src: mindtrekPhoto, alt: "Volunteering at Mindtrek, Tampere" }],
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
    photos: [{ src: kobPhoto, alt: "A collection of photos from Kochi Overboard events" }],
    caption: "A collection of photos from my time at Kochi Overboard",
    modalMaxWidth: "640px",
  },
  {
    id: "ecer",
    index: "VOL_03",
    title: "ECER 2026",
    org: "Tampere, Finland",
    desc: "Volunteered as a conference assistant at ECER 2026, the European Conference on Educational Research, hosted by Tampere University from 18 to 21 August. I worked alongside a big team of fellow volunteers to keep the conference running for researchers who had travelled from all over Europe.",
    tags: ["ACADEMIC CONFERENCE", "CONFERENCE ASSISTANT", "TAMPERE"],
    accent: "var(--brand)",
    link: "https://eera-ecer.de/",
    linkLabel: "eera-ecer.de",
    photos: [
      { src: ecerTeamPhoto, alt: "The ECER 2026 volunteer team", aspect: 1920 / 1440 },
      { src: ecerPhoto, alt: "Me with my ECER 2026 conference assistant badge", aspect: 800 / 1422 },
    ],
    caption: "Conference assistant at ECER 2026, Tampere University",
    modalMaxWidth: "760px",
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
            aria-label={`${entry.title} — view photo${entry.photos.length > 1 ? "s" : ""}`}
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
            {openEntry.photos.length === 1 ? (
              <img
                src={openEntry.photos[0].src}
                alt={openEntry.photos[0].alt}
                className="volunteer-modal__photo"
              />
            ) : (
              <div className="volunteer-modal__photos">
                {openEntry.photos.map((p) => (
                  <img
                    key={p.src}
                    src={p.src}
                    alt={p.alt}
                    className="volunteer-modal__photos-item"
                    style={{ flexGrow: p.aspect ?? 1, aspectRatio: p.aspect }}
                  />
                ))}
              </div>
            )}
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
