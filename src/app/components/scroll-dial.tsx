import { animate, createScope, stagger, utils, type Scope } from "animejs";
import { useEffect, useRef, useState } from "react";
import "./scroll-dial.css";

/**
 * Section progress dial. Five arcs, one per page section, filling strictly in
 * sequence as you scroll; the centre plays a themed scene for whichever
 * section currently owns the viewport.
 *
 * Nothing here re-renders on scroll — arc progress is written straight to the
 * DOM, and React state changes only when the active section does (5× a page).
 */

interface Section {
  id: string;
  num: string;
  label: string;
}

/*
 * ADDING A SECTION — four places, and they must stay index-aligned:
 *
 *   1. Give the section's element an `id`.
 *   2. Add its entry to SECTIONS below.
 *   3. Write a scene component and add it to SCENES.
 *   4. Add its animation group to the `loops` array literal in the effect,
 *      pointing at the matching `sceneEls[N]`.
 *
 * Steps 2 and 3 disagreeing does NOT throw. SCENES.map renders one stage per
 * scene, so a SECTIONS entry with no matching scene leaves `active` pointing
 * at a stage that was never rendered, nothing matches [data-active="true"],
 * and the centre just goes blank. If a bar fills but the middle is empty,
 * that's this.
 *
 * The ring resizes itself — arcPath() divides 360° by SECTIONS.length. But
 * GAP_DEG is a fixed 10°, so each visible arc is (360/n − 10)°: comfortable
 * to about 8 sections, thin by 12, degenerate past ~30.
 */
const SECTIONS: Section[] = [
  { id: "hero", num: "00", label: "HERO" },
  { id: "about", num: "01", label: "ABOUT" },
  { id: "work", num: "02", label: "WORK" },
  { id: "extras", num: "03", label: "EXTRAS" },
  { id: "contact", num: "04", label: "CONTACT" },
];

// Ring geometry. 5 arcs of 72°, minus a gap, drawn from 12 o'clock.
const CENTER = 48;
const RADIUS = 40;
const GAP_DEG = 10;

function polar(angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER + RADIUS * Math.cos(a),
    y: CENTER + RADIUS * Math.sin(a),
  };
}

/** Arc path for segment `i`. Sweep is always < 180°, so large-arc is 0. */
function arcPath(i: number) {
  const span = 360 / SECTIONS.length;
  const start = i * span + GAP_DEG / 2;
  const end = (i + 1) * span - GAP_DEG / 2;
  const s = polar(start);
  const e = polar(end);
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${RADIUS} ${RADIUS} 0 0 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

/**
 * Scroll window per arc, as [startY, endY] pairs that tile the scroll range
 * end to end with no overlap.
 *
 * Deriving these from each section's own travel through the viewport — the
 * obvious approach — does not work. Adjacent sections are within one viewport
 * of each other, so their travels overlap and two arcs fill at once; and any
 * window anchored to the viewport top is unreachable for the last sections,
 * because the page runs out of scroll before they get there. Mapping each
 * section's document offset onto the scroll range instead gives windows that
 * are sequential by construction and always reach the end.
 */
function measureWindows(): [number, number][] {
  const doc = document.documentElement;
  const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
  const total = Math.max(1, doc.scrollHeight);
  const tops = SECTIONS.map((s) => document.getElementById(s.id)?.offsetTop ?? 0);
  const bounds = [...tops, total].map((v) => (v / total) * maxScroll);
  return SECTIONS.map((_, i) => [bounds[i], Math.max(bounds[i] + 1, bounds[i + 1])]);
}

/* ------------------------------------------------------------------
   Centre scenes — one per section, all mounted, only the active one
   visible. Each exposes data-* hooks the effect below animates.
   ------------------------------------------------------------------ */

/** Small helper for the pixel-art scenes: render a grid mask as rects. */
function pixels(mask: string[], cell: number, cls: string, tag?: string) {
  const w = mask[0].length * cell;
  const h = mask.length * cell;
  const x0 = (60 - w) / 2;
  const y0 = (60 - h) / 2;
  return mask.flatMap((row, r) =>
    row.split("").map((c, q) =>
      c === "X" ? (
        <rect
          key={`${r}-${q}`}
          {...(tag ? { [tag]: true } : {})}
          className={cls}
          x={x0 + q * cell}
          y={y0 + r * cell}
          width={cell - 0.5}
          height={cell - 0.5}
        />
      ) : null,
    ),
  );
}

/** 00 HERO — balls orbiting, echoing the playground canvas. */
function OrbitScene() {
  return (
    <>
      <circle className="scroll-dial__ink" cx="30" cy="30" r="3.5" />
      <g data-orbit>
        <circle className="scroll-dial__ink" cx="30" cy="13" r="2.6" />
      </g>
      <g data-orbit>
        <circle className="scroll-dial__ink scroll-dial__ink--alt" cx="30" cy="46" r="2.1" />
      </g>
      <g data-orbit>
        <circle className="scroll-dial__ink" cx="17" cy="30" r="1.8" />
      </g>
    </>
  );
}

/**
 * 01 ABOUT — pixel Sharingan, three tomoe rotating around the pupil.
 * Keeps the Naruto nod the hero already makes with KAWARIMI RESET.
 */
const IRIS = [
  "....XXX....",
  "..XXXXXXX..",
  ".XXXXXXXXX.",
  ".XXXXXXXXX.",
  "XXXXXXXXXXX",
  "XXXXXXXXXXX",
  "XXXXXXXXXXX",
  ".XXXXXXXXX.",
  ".XXXXXXXXX.",
  "..XXXXXXX..",
  "....XXX....",
];

function SharinganScene() {
  // Tomoe sit on a ring inside the iris; the group spins as one.
  const tomoe = [90, 210, 330].map((deg) => {
    const a = ((deg - 90) * Math.PI) / 180;
    const cx = 30 + Math.cos(a) * 11;
    const cy = 30 + Math.sin(a) * 11;
    return { deg, cx, cy };
  });
  return (
    <>
      {pixels(IRIS, 4, "scroll-dial__ink scroll-dial__ink--alt")}
      <g data-sharingan>
        {tomoe.map((t) => (
          // Comma shape, blocked out so it still reads as pixel art.
          <g key={t.deg} transform={`translate(${t.cx} ${t.cy}) rotate(${t.deg})`}>
            <rect className="scroll-dial__ink--hole" x="-2.5" y="-2.5" width="5" height="5" />
            <rect className="scroll-dial__ink--hole" x="-2.5" y="2.5" width="2.5" height="4" />
          </g>
        ))}
      </g>
      <circle className="scroll-dial__ink--hole" cx="30" cy="30" r="3.6" />
    </>
  );
}

/**
 * 02 WORK — a pixel car driving laps inside the frame.
 *
 * The sprite is drawn once at the top of the track already pointing the way
 * it travels, then the whole group is rotated about the scene centre. That
 * carries the car round the circle *and* keeps it facing forward, with no
 * per-frame heading maths.
 */
const TRACK_R = 17;
const CAR_CELL = 2.5;

// Side-on, facing right. A single-colour silhouette on a coarse grid: the
// cabin bump and the two wheel nubs are enough to read as a car, and fewer,
// larger pixels sit better next to the site's hairline chrome than a
// detailed sprite does.
const CAR = [
  ".XXXX...",
  "XXXXXXXX",
  "XXXXXXXX",
  ".XX..XX.",
];

/** Renders a mask centred on (0,0) so the caller can place it by transform. */
function carPixels(mask: string[], cls: string) {
  const x0 = (-mask[0].length * CAR_CELL) / 2;
  const y0 = (-mask.length * CAR_CELL) / 2;
  return mask.flatMap((row, r) =>
    row.split("").map((c, q) =>
      c === "X" ? (
        <rect
          key={`${cls}-${r}-${q}`}
          className={cls}
          x={x0 + q * CAR_CELL}
          y={y0 + r * CAR_CELL}
          width={CAR_CELL - 0.4}
          height={CAR_CELL - 0.4}
        />
      ) : null,
    ),
  );
}

function CarScene() {
  return (
    <>
      <circle
        className="scroll-dial__line scroll-dial__line--faint scroll-dial__track-ring"
        cx="30"
        cy="30"
        r={TRACK_R}
      />
      <g data-car-orbit>
        <g transform={`translate(30 ${30 - TRACK_R})`}>
          {carPixels(CAR, "scroll-dial__ink")}
        </g>
      </g>
    </>
  );
}

/** 03 EXTRAS — rotating wireframe cube, for the AR side quest. */
function CubeScene() {
  return (
    <g data-cube>
      <path className="scroll-dial__line" d="M30 11 L47 21 L47 39 L30 49 L13 39 L13 21 Z" />
      <path className="scroll-dial__line" d="M30 11 L30 30 M30 30 L47 21 M30 30 L13 21" />
    </g>
  );
}

/** 04 CONTACT — pulsing pixelated heart. */
const HEART = [
  ".XX..XX.",
  "XXXXXXXX",
  "XXXXXXXX",
  "XXXXXXXX",
  ".XXXXXX.",
  "..XXXX..",
  "...XX...",
];

function HeartScene() {
  return <>{pixels(HEART, 5, "scroll-dial__ink scroll-dial__ink--alt", "data-pixel")}</>;
}

const SCENES = [OrbitScene, SharinganScene, CarScene, CubeScene, HeartScene];

export function ScrollDial() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const scope: Scope = createScope({ root }).add(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const fills = Array.from(
        root.querySelectorAll<SVGPathElement>(".scroll-dial__fill"),
      );
      const sceneEls = Array.from(
        root.querySelectorAll<SVGSVGElement>(".scroll-dial__scene"),
      );

      // Looping animations per scene, built paused. Kept as an array *per
      // scene*, indexed to match SECTIONS, so a scene can own more than one
      // without silently shifting every later scene onto the wrong bar.
      // Under reduced motion we skip them and leave each scene static.
      const loops: ReturnType<typeof animate>[][] = reduceMotion
        ? SECTIONS.map(() => [])
        : [
            [
              animate(sceneEls[0].querySelectorAll("[data-orbit]"), {
                rotate: 360,
                // Spread the orbital periods so the balls drift apart
                // instead of staying locked in formation.
                duration: stagger([3400, 6200]),
                ease: "linear",
                loop: true,
                autoplay: false,
              }),
            ],
            [
              animate(sceneEls[1].querySelectorAll("[data-sharingan]"), {
                rotate: 360,
                duration: 5200,
                ease: "linear",
                loop: true,
                autoplay: false,
              }),
            ],
            [
              animate(sceneEls[2].querySelectorAll("[data-car-orbit]"), {
                rotate: 360,
                duration: 2800,
                ease: "linear",
                loop: true,
                autoplay: false,
              }),
            ],
            [
              animate(sceneEls[3].querySelectorAll("[data-cube]"), {
                rotate: 360,
                duration: 4600,
                ease: "linear",
                loop: true,
                autoplay: false,
              }),
            ],
            [
              animate(sceneEls[4].querySelectorAll("[data-pixel]"), {
                scale: [{ to: 1.18 }, { to: 1 }],
                duration: 900,
                delay: stagger(22, { from: "center" }),
                ease: "inOutQuad",
                loop: true,
                autoplay: false,
              }),
            ],
          ];

      let windows = measureWindows();
      let shown = -1;
      let ticking = false;

      const paint = () => {
        ticking = false;
        const y = window.scrollY;
        let current = 0;
        windows.forEach(([from, to], i) => {
          const p = Math.min(1, Math.max(0, (y - from) / (to - from)));
          utils.set(fills[i], { strokeDashoffset: 1 - p });
          if (y >= from) current = i;
        });
        if (current !== shown) {
          shown = current;
          setActive(current);
          loops.forEach((group, j) =>
            group.forEach((l) => (j === current ? l.restart() : l.pause())),
          );
        }
      };

      const onScrollTick = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(paint);
      };
      const onResize = () => {
        windows = measureWindows();
        onScrollTick();
      };

      // Passive listener writing straight to the DOM — no React render per
      // frame, and no ScrollObserver thresholds to get subtly wrong.
      window.addEventListener("scroll", onScrollTick, { passive: true });
      window.addEventListener("resize", onResize);
      // Layout settles after fonts/images land; re-measure once it has.
      const settle = window.setTimeout(onResize, 600);
      paint();

      return () => {
        window.removeEventListener("scroll", onScrollTick);
        window.removeEventListener("resize", onResize);
        window.clearTimeout(settle);
      };
    });

    return () => scope.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="scroll-dial fixed bottom-6 right-6 z-50"
      aria-hidden="true"
    >
      <svg className="scroll-dial__ring" viewBox="0 0 96 96">
        {SECTIONS.map((s, i) => (
          <path key={`t-${s.id}`} className="scroll-dial__track" d={arcPath(i)} />
        ))}
        {SECTIONS.map((s, i) => (
          <path
            key={`f-${s.id}`}
            className="scroll-dial__fill"
            data-index={i}
            d={arcPath(i)}
            pathLength={1}
          />
        ))}
      </svg>

      <div className="scroll-dial__stage">
        {SCENES.map((Scene, i) => (
          <svg
            key={SECTIONS[i].id}
            className="scroll-dial__scene"
            data-active={i === active}
            viewBox="0 0 60 60"
          >
            <Scene />
          </svg>
        ))}
      </div>

      <span className="scroll-dial__label">
        <span className="scroll-dial__label-num">{SECTIONS[active].num}</span>{" "}
        {SECTIONS[active].label}
      </span>
    </div>
  );
}
