import { ChevronRight } from "lucide-react";
import { useCallback, useRef, useState } from "react";

type PanelKey = "technical" | "personal";

interface Block {
  tag: string;
  text: string;
  /** Exact substrings of `text` to render in the brand accent. */
  highlight?: string[];
}
interface PanelData {
  label: string;
  blocks: Block[];
}

const TECHNICAL: PanelData = {
  label: "TECHNICAL",
  blocks: [
    
    {
      tag: "EDUCATION",
      text: "I'm currently pursuing my Master's in Software, Web and Cloud at Tampere University in Finland. The program has given me the opportunity to explore a wide range of subjects, from AI and cloud computing to embedded systems. I've even found myself wandering into psychology along the way because, to me, understanding people is just as valuable as understanding technology. Great software is about solving real problems for real people, not just about building good code.",
      highlight: ["Master's in Software, Web and Cloud", "Tampere University"],
    },
    {
      tag: "CAREER — VIEW26",
      text: "Before moving to Finland, I spent almost five years at View26 GmbH (Actiotech LLP), where I left as a Senior Full-Stack Software Engineer. During my time there, I led development on a Scrum management app that went on to win 2nd place in Atlassian's Codegeist 2021 hackathon. I also built data visualization tools used by over 1,000 customers on the Atlassian Marketplace and contributed to the company's core proprietary charting library, helping maintain and expand one of the key pieces of technology behind several of our products.",
      highlight: [
        "View26 GmbH (Actiotech LLP)",
        "Senior Full-Stack Software Engineer",
        "2nd place in Atlassian's Codegeist 2021 hackathon",
        "over 1,000 customers on the Atlassian Marketplace",
      ],
    },
    {
      tag: "GROWTH",
      text: 'As I gained experience, my role naturally grew beyond writing code. I mentored new engineers, helped onboard teammates, reviewed code, and enjoyed teaching people "the ways of the code." Towards my final year, I was introduced to product management, where I got hands-on experience with product strategy, design, customer feedback, and even product marketing. That experience gave me a much broader perspective on software development and helped me appreciate how engineering, design, and business all work together to build successful products.',
      highlight: [
        "mentored new engineers",
        "product management",
        "product strategy, design, customer feedback, and even product marketing",
      ],
    },
  ],
};

const PERSONAL: PanelData = {
  label: "PERSONAL",
  blocks: [
    {
      tag: "MINDSET",
      text: "I'm naturally curious and enjoy looking at problems from multiple perspectives, whether it's a technical challenge, a product decision, or simply understanding why something works the way it does. I believe there's always something new to learn and always another way to improve.",
    },
    {
      tag: "PSYCHOLOGY",
      text: "Outside of tech, psychology has become one of my biggest interests. I spend a lot of time reading books and research on how people think, make decisions, cope with challenges, and experience emotions. It's a rabbit hole I genuinely enjoy going down, and it's influenced not just how I communicate with people but also how I approach designing software.",
    },
    {
      tag: "OUTSIDE THE SCREEN",
      text: "When I'm not working or studying, you'll probably find me playing video games, probably too many of them. I especially enjoy competitive games like Rocket League and Marvel Rivals (tiny humblebrag: I'm in the top 5% of Rocket League players 😄). I love the problem-solving, teamwork, and constant learning that competitive games demand. I'm also pretty active outside the screen, volleyball and badminton are my favourites, and I spend a good amount of time at the gym trying to convince myself leg day isn't actually that bad. I also genuinely enjoy meeting new people, so there's a decent chance you'll find me at a meetup, event, or even just chatting with strangers at a party.",
    },
    {
      tag: "ROOTS",
      text: "Growing up, I've been fortunate enough to experience life in several different places. I was born and brought up in Bahrain, spent a small part of my school life in Oman, moved back to Kerala for my higher studies and career, and now find myself living in Finland. Each move gave me a different perspective on people, cultures, and ways of thinking, and I credit those experiences with shaping much of who I am today, they've taught me to adapt quickly, stay curious, and appreciate viewpoints different from my own.",
    },
    {
      tag: "FAMILY",
      text: "And finally, I can't talk about myself without mentioning my family. I have a twin brother, which meant my parents had double the chaos growing up but somehow they managed it brilliantly. Along with my incredible friends and family, they've played a huge role in helping me become the person I am today.",
    },
  ],
};

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Wraps every occurrence of `highlight` in the brand accent, leaving the rest
    of the copy as plain text. Kept as string data + a match list rather than
    inline JSX so the paragraphs stay readable in the source. */
function renderText(text: string, highlight?: string[]) {
  if (!highlight?.length) return text;
  // Longest first so a short term can't consume part of a longer one.
  const terms = [...highlight].sort((a, b) => b.length - a.length).map(escapeRe);
  const re = new RegExp(`(${terms.join("|")})`, "g");
  // split() with a capture group interleaves the matches at the odd indices.
  return text
    .split(re)
    .map((part, i) =>
      i % 2 === 1 ? (
        <span key={i} className="about-panel__hl">
          {part}
        </span>
      ) : (
        part
      ),
    );
}

function Panel({
  data,
  side,
  active,
  justSwitched,
  onOpen,
}: {
  data: PanelData;
  side: "start" | "end";
  active: boolean;
  justSwitched: boolean;
  onOpen: () => void;
}) {
  return (
    <div
      className={`about-panel${active && justSwitched ? " is-sweeping" : ""}`}
      data-active={active}
      data-side={side}
    >
      {/* Collapsed edge strip — the click target that opens this panel. Stays
          in the DOM (rather than mounting on demand) so the open/close is a
          pure CSS crossfade with no layout pop. */}
      <button
        type="button"
        onClick={onOpen}
        aria-hidden={active}
        tabIndex={active ? -1 : 0}
        className="about-panel__strip"
      >
        {/* Points into the space the panel expands into; direction comes from
            data-side in CSS, so one icon covers all four orientations. */}
        <span className="about-panel__strip-arrow" aria-hidden="true">
          <ChevronRight size={16} strokeWidth={2.5} />
        </span>
        <span className="about-panel__strip-txt">
          {data.label}
        </span>
      </button>

      <div className="about-panel__content" aria-hidden={!active}>
        <p
          className={`about-panel__label${active && justSwitched ? " is-glitching" : ""}`}
          data-text={data.label}
        >
          {data.label}
        </p>
        <div className="about-panel__body">
          {data.blocks.map((b) => (
            <div key={b.tag} className="about-panel__block">
              <p className="about-panel__tag">{b.tag}</p>
              <p className="about-panel__text">
                {renderText(b.text, b.highlight)}
              </p>
            </div>
          ))}
        </div>
      </div>
      <span className="about-panel__sweep" aria-hidden="true" />
    </div>
  );
}

export function About() {
  const [active, setActive] = useState<PanelKey>("technical");
  const [justSwitched, setJustSwitched] = useState(false);
  const timeoutRef = useRef<number | undefined>(undefined);

  const open = useCallback((side: PanelKey) => {
    setActive((current) => {
      if (current === side) return current;
      setJustSwitched(true);
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setJustSwitched(false), 620);
      return side;
    });
  }, []);

  return (
    <section id="about" className="mx-auto max-w-[1200px] px-6 py-24">
      <style>{`
        .about-accordion {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: var(--hairline);
          border: 1px solid var(--hairline);
          /* Bounded so the section never dominates the page scroll — the open
             panel scrolls its own text instead of stretching to fit it. */
          height: min(72vh, 800px);
          min-height: 420px;
        }
        .about-panel {
          position: relative;
          overflow: hidden;
          flex: 0 0 64px;
          background: var(--surface);
          transition: flex-grow 520ms cubic-bezier(0.16, 1, 0.3, 1),
            flex-basis 520ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .about-panel[data-active="true"] {
          flex: 1 1 0%;
        }

        .about-panel__strip {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: transparent;
          border: 0;
          cursor: pointer;
          opacity: 1;
          transition: opacity 260ms ease 160ms;
        }
        .about-panel[data-active="true"] .about-panel__strip {
          opacity: 0;
          pointer-events: none;
          transition-delay: 0ms;
        }
        .about-panel__strip:hover .about-panel__strip-txt {
          color: var(--brand);
        }
        .about-panel__strip-txt {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.15em;
          color: var(--text-muted);
          white-space: nowrap;
          transition: color 200ms ease;
        }

        /* Rotation only — direction comes from data-side. Colour tracks the
           label so the whole strip lights up as one on hover. */
        .about-panel__strip-arrow {
          display: flex;
          color: var(--text-muted);
          transition: color 200ms ease;
        }
        .about-panel[data-side="start"] .about-panel__strip-arrow {
          transform: rotate(90deg);
        }
        .about-panel[data-side="end"] .about-panel__strip-arrow {
          transform: rotate(-90deg);
        }
        .about-panel__strip:hover .about-panel__strip-arrow {
          color: var(--brand);
        }

        .about-panel__content {
          height: 100%;
          overflow-y: auto;
          padding: 28px 24px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 320ms ease;
        }
        .about-panel[data-active="true"] .about-panel__content {
          opacity: 1;
          pointer-events: auto;
          transition-delay: 180ms;
        }

        .about-panel__label {
          position: relative;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.2em;
          color: var(--brand);
          margin-bottom: 20px;
        }
        .about-panel__label.is-glitching::before,
        .about-panel__label.is-glitching::after {
          content: attr(data-text);
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .about-panel__label.is-glitching::before {
          color: var(--brand);
          animation: aboutGlitchA 480ms steps(2, end);
        }
        .about-panel__label.is-glitching::after {
          color: var(--brand-2);
          animation: aboutGlitchB 480ms steps(2, end);
        }

        .about-panel__body {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .about-panel__tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.15em;
          color: var(--text-muted);
          margin-bottom: 6px;
        }
        .about-panel__text {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          line-height: 1.65;
          color: var(--fg);
        }
        .about-panel__hl {
          color: var(--brand);
          font-weight: 600;
        }

        .about-panel__sweep {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(90deg, transparent, rgba(var(--brand-rgb), 0.22), transparent);
          transform: translateX(-120%);
          opacity: 0;
        }
        .about-panel.is-sweeping .about-panel__sweep {
          animation: aboutSweep 620ms ease-out;
        }

        @keyframes aboutGlitchA {
          0% { clip-path: inset(0 0 80% 0); transform: translate(-4px, 0); opacity: 1; }
          30% { clip-path: inset(30% 0 40% 0); transform: translate(4px, 0); }
          60% { clip-path: inset(60% 0 10% 0); transform: translate(-3px, 0); }
          100% { clip-path: inset(100% 0 0 0); transform: translate(0, 0); opacity: 0; }
        }
        @keyframes aboutGlitchB {
          0% { clip-path: inset(80% 0 0 0); transform: translate(4px, 0); opacity: 1; }
          30% { clip-path: inset(40% 0 30% 0); transform: translate(-4px, 0); }
          60% { clip-path: inset(10% 0 60% 0); transform: translate(3px, 0); }
          100% { clip-path: inset(0 0 100% 0); transform: translate(0, 0); opacity: 0; }
        }
        @keyframes aboutSweep {
          0% { transform: translateX(-120%); opacity: 0.9; }
          60% { opacity: 0.5; }
          100% { transform: translateX(120%); opacity: 0; }
        }

        @media (min-width: 768px) {
          .about-accordion {
            flex-direction: row;
          }
          .about-panel[data-active="false"] {
            flex-basis: 76px;
          }
          .about-panel__strip {
            flex-direction: column;
            gap: 14px;
          }
          .about-panel__strip-txt {
            writing-mode: vertical-rl;
            transform: rotate(180deg);
          }
          .about-panel[data-side="start"] .about-panel__strip-arrow {
            transform: rotate(0deg);
          }
          .about-panel[data-side="end"] .about-panel__strip-arrow {
            transform: rotate(180deg);
          }
          .about-panel__content {
            padding: 44px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .about-panel,
          .about-panel__strip,
          .about-panel__content {
            transition-duration: 1ms;
          }
          .about-panel__label.is-glitching::before,
          .about-panel__label.is-glitching::after {
            content: none;
            animation: none;
          }
          .about-panel__sweep {
            animation: none;
          }
        }
      `}</style>

      <p
        className="font-mono mb-3"
        style={{ fontSize: 12, letterSpacing: "0.25em", color: "var(--brand)" }}
      >
        01 // ABOUT
      </p>
      <h2
        className="mb-10"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: "clamp(28px, 4vw, 44px)",
          color: "var(--fg)",
          letterSpacing: "-0.02em",
          lineHeight: 1.05,
        }}
      >
        THE PERSON BEHIND THE CODE
      </h2>

      <div className="about-accordion">
        <Panel
          data={TECHNICAL}
          side="start"
          active={active === "technical"}
          justSwitched={justSwitched}
          onOpen={() => open("technical")}
        />
        <Panel
          data={PERSONAL}
          side="end"
          active={active === "personal"}
          justSwitched={justSwitched}
          onOpen={() => open("personal")}
        />
      </div>
    </section>
  );
}
