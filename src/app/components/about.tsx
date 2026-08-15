import { ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "../hooks/use-in-view";
import "./about.css";

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
      text: "Before moving to Finland, I spent almost five years at View26 GmbH (Actiotech LLP), where I left as a Senior Frontend Software Engineer. During my time there, I led development on a Scrum management app that went on to win 2nd place in Atlassian's Codegeist 2021 hackathon. I also built data visualization tools used by over 1,000 customers on the Atlassian Marketplace and contributed to the company's core proprietary charting library, helping maintain and expand one of the key pieces of technology behind several of our products.",
      highlight: [
        "View26 GmbH (Actiotech LLP)",
        "Senior Frontend Software Engineer",
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
      className={`about-panel${active && justSwitched ? " about-panel--sweeping" : ""}`}
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
          className={`about-panel__label${active && justSwitched ? " about-panel__label--glitching" : ""}`}
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
  const { ref: sectionRef, inView } = useInView<HTMLElement>({ threshold: 0.3 });

  const open = useCallback((side: PanelKey) => {
    setActive((current) => {
      if (current === side) return current;
      setJustSwitched(true);
      window.clearTimeout(timeoutRef.current);
      // 620ms must stay in sync with the aboutSweep animation in about.css.
      timeoutRef.current = window.setTimeout(() => setJustSwitched(false), 620);
      return side;
    });
  }, []);

  // Scroll-entrance: play the same glitch/sweep the first time the section
  // comes into view, on whichever panel is active by default. Reuses
  // justSwitched so this can never diverge from the click path above, and
  // only ever fires once since useInView defaults to `once: true`.
  useEffect(() => {
    if (!inView) return;
    setJustSwitched(true);
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setJustSwitched(false), 620);
  }, [inView]);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="mx-auto max-w-[1200px] px-6 py-24"
    >
      <p className="section-eyebrow font-mono mb-3 reveal-up" data-inview={inView}>
        01 // ABOUT
      </p>
      <h2
        className="section-title mb-10 reveal-up"
        data-inview={inView}
        style={{ transitionDelay: "80ms" }}
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
