import { animate, createScope, stagger, svg, utils, type Scope } from "animejs";
import { useEffect, useRef, useState } from "react";
import "./scroll-dial.css";

/**
 * Section progress dial. One arc per page section, filling strictly in
 * sequence as you scroll; the centre plays a themed scene for whichever
 * section currently owns the viewport.
 *
 * Nothing here re-renders on scroll — arc progress is written straight to the
 * DOM, and React state changes only when the active section does (once per
 * section).
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
  { id: "journey", num: "03", label: "JOURNEY" },
  { id: "extras", num: "04", label: "EXTRAS" },
  { id: "contact", num: "05", label: "CONTACT" },
];

// Ring geometry. arcPath() divides evenly by SECTIONS.length, minus a gap,
// drawn from 12 o'clock.
const CENTER = 48;
const RADIUS = 40;
const GAP_DEG = 10;

/**
 * Converts a "clock angle" (0° = 12 o'clock / straight up, increasing
 * clockwise — the way people naturally read a dial) into an (x, y) pixel
 * point sitting on the ring.
 *
 * Math.cos/Math.sin work in the *standard* math convention instead: 0°
 * points right (3 o'clock) and angles increase counter-clockwise. Subtracting
 * 90° before converting to radians rotates our clock-angle into that
 * standard convention (so 0° clock-angle correctly lands at the top), and
 * `* Math.PI / 180` is just the fixed conversion factor from degrees to
 * radians, which is what the trig functions require as input.
 *
 * Once `a` is in the right convention, the classic parametric-circle formula
 * takes over: any point on a circle of radius R around a center (CENTER,
 * CENTER) is (CENTER + R·cos(a), CENTER + R·sin(a)) for some angle a.
 */
function polar(angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER + RADIUS * Math.cos(a),
    y: CENTER + RADIUS * Math.sin(a),
  };
}

/** Arc path for segment `i`. Sweep is always < 180°, so large-arc is 0. */
function arcPath(i: number) {
  // Split the full 360° circle evenly across however many sections exist —
  // e.g. 6 sections means each gets a 60° slice.
  const span = 360 / SECTIONS.length;
  // This segment's slice runs from i*span to (i+1)*span, but we shrink it in
  // by half the gap on *each* side (GAP_DEG / 2), so neighboring arcs don't
  // touch — leaving a small visible gap between them.
  const start = i * span + GAP_DEG / 2;
  const end = (i + 1) * span - GAP_DEG / 2;
  // Convert the segment's start/end angles into actual (x, y) points on the
  // ring using the helper above.
  const s = polar(start);
  const e = polar(end);
  // Build an SVG path string: "M x y" moves the pen to the start point
  // without drawing, then "A rx ry x-axis-rotation large-arc-flag
  // sweep-flag x y" draws an arc of radius (RADIUS, RADIUS) to the end
  // point. The "0 1" means: never take the long way around (large-arc-flag
  // 0 — every one of our slices is well under 180°, so this is always
  // correct) and always sweep clockwise (sweep-flag 1).
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
  // maxScroll is the furthest window.scrollY can ever reach: the full page
  // height minus one viewport's worth (because once the bottom of the page
  // touches the bottom of the screen, you can't scroll any further). Clamped
  // to at least 1 so we never divide by zero below on a very short page.
  const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
  // Total document height, also floored at 1 for the same divide-by-zero reason.
  const total = Math.max(1, doc.scrollHeight);
  // offsetTop of each section = how far down the *document* that section
  // starts (not how far down the viewport — this doesn't change as you scroll).
  const tops = SECTIONS.map((s) => document.getElementById(s.id)?.offsetTop ?? 0);
  // Here's the actual trick: each section's document position (0..total) is
  // rescaled proportionally onto the scrollable range (0..maxScroll). E.g. a
  // section starting 50% of the way down a document that's twice as tall as
  // the scrollable range would land at 50% of maxScroll. This guarantees the
  // first section's window starts at scrollY 0 and the last section's window
  // ends exactly at maxScroll — the full scrollable range gets covered with
  // no gaps and no leftover, regardless of how tall any individual section is.
  const bounds = [...tops, total].map((v) => (v / total) * maxScroll);
  // Turn the list of boundary points into paired [start, end] windows — the
  // scroll range "owned" by each section — and make sure every window has at
  // least 1px of span (Math.max(bounds[i] + 1, ...)) so a section that
  // somehow computes to zero height still gets a valid, non-degenerate window.
  return SECTIONS.map((_, i) => [bounds[i], Math.max(bounds[i] + 1, bounds[i + 1])]);
}

/* ------------------------------------------------------------------
   Centre scenes — one per section, all mounted, only the active one
   visible. Each exposes data-* hooks the effect below animates.
   ------------------------------------------------------------------ */

/** Small helper for the pixel-art scenes: render a grid mask as rects. */
function pixels(mask: string[], cell: number, cls: string, tag?: string) {
  // `mask` is a grid of text rows, where "X" means "draw a pixel here" and
  // "." means "leave empty" — a simple ASCII-art sprite format. Total pixel
  // width/height of the whole sprite = number of columns/rows times each
  // cell's pixel size.
  const w = mask[0].length * cell;
  const h = mask.length * cell;
  // The scene's viewBox is 60x60 (see the <svg viewBox="0 0 60 60"> usage),
  // so to center the sprite inside it we offset it by half of the leftover
  // space: (60 - spriteWidth) / 2 pushes it right/down just enough that
  // equal empty space remains on both sides.
  const x0 = (60 - w) / 2;
  const y0 = (60 - h) / 2;
  // Walk every row (r) and every character in that row (q); for each "X"
  // emit one SVG <rect> positioned at that grid cell. flatMap is used
  // because each row produces multiple rects (or nulls, which React skips)
  // and they all need to end up in one single flat list rather than nested
  // per-row arrays.
  return mask.flatMap((row, r) =>
    row.split("").map((c, q) =>
      c === "X" ? (
        <rect
          key={`${r}-${q}`}
          {...(tag ? { [tag]: true } : {})}
          className={cls}
          x={x0 + q * cell}
          y={y0 + r * cell}
          // Slightly shrinking each cell (cell - 0.5) leaves a hairline gap
          // between adjacent pixels so the grid reads as distinct squares
          // instead of one solid blob.
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
  // Same clock-angle-to-point idea as the polar() helper above: 90°, 210°,
  // and 330° are evenly spaced 120° apart around the circle (three-way
  // symmetry), the -90 shifts from "0° = right" (math convention) to
  // "0° = top" (clock convention), and 30 + cos/sin*11 places each point on
  // a ring of radius 11 centered at (30, 30) — the middle of the 60x60 scene.
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

/**
 * 03 JOURNEY — a comet travelling a zigzag path top to bottom (echoing the
 * timeline's own reading direction), like a heartbeat-monitor blip without
 * the monitor line. The path itself stays in the DOM — svg.createMotionPath
 * in the effect below needs its geometry to compute the comet's translate
 * values — but is never painted (see .scroll-dial__pulse-path).
 *
 * The tail is several more pixels following the same motion path with a
 * per-element start delay (see PULSE_TRAIL_STAGGER_MS below): a pixel
 * delayed by N ms is always exactly where the head was N ms ago, which is
 * what actually draws the trailing effect — the pixels never animate
 * relative to each other directly.
 */
const PULSE_PATH = "M 30 6 L 30 16 L 12 26 L 48 34 L 30 44 L 30 54";
const PULSE_TRAIL_STAGGER_MS = 90;
// Head first (leads, brightest, biggest), tapering back from there.
const PULSE_TRAIL = [
  { size: 6.4, opacity: 1 },
  { size: 4.8, opacity: 0.65 },
  { size: 3.3, opacity: 0.4 },
  { size: 2.8, opacity: 0.22 },
  { size: 1.3, opacity: 0.1 },
];

function PulseScene() {
  return (
    <>
      <path className="scroll-dial__pulse-path" data-pulse-path d={PULSE_PATH} />
      {PULSE_TRAIL.map((p, i) => (
        <rect
          key={i}
          className={`scroll-dial__ink scroll-dial__pulse-pixel${i === 0 ? " scroll-dial__pulse-pixel--head" : ""}`}
          data-pulse-trail
          x={-p.size / 2}
          y={-p.size / 2}
          width={p.size}
          height={p.size}
          // fill-opacity is the pixel's fixed place in the taper; plain
          // opacity is left free for the fade-in/out envelope the effect
          // below animates, so the two don't fight over the same value.
          fillOpacity={p.opacity}
        />
      ))}
    </>
  );
}

/** 04 EXTRAS — rotating wireframe cube, for the AR side quest. */
function CubeScene() {
  return (
    <g data-cube>
      <path className="scroll-dial__line" d="M30 11 L47 21 L47 39 L30 49 L13 39 L13 21 Z" />
      <path className="scroll-dial__line" d="M30 11 L30 30 M30 30 L47 21 M30 30 L13 21" />
    </g>
  );
}

/** 05 CONTACT — pulsing pixelated heart. */
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

const SCENES = [OrbitScene, SharinganScene, CarScene, PulseScene, CubeScene, HeartScene];

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
              // createMotionPath reads the (invisible) path's own geometry
              // and returns translateX/translateY value functions that
              // trace it; every pixel in the trail uses the *same* pair, so
              // they all trace the same path — only stagger() below (per
              // Note in the comment above PulseScene) makes them trail.
              ...(() => {
                const path = sceneEls[3].querySelector<SVGPathElement>("[data-pulse-path]");
                if (!path) return [];
                const { translateX, translateY } = svg.createMotionPath(path);
                const anim = animate(sceneEls[3].querySelectorAll("[data-pulse-trail]"), {
                  translateX,
                  translateY,
                  // Motion-path progress resets 0→1 instantly at the loop
                  // boundary (bottom snaps back to top) — six even keyframes
                  // (same "no explicit duration" idiom as the heart's scale
                  // above) fade it out over the last sixth of the path and
                  // back in over the first, so the snap lands while
                  // invisible instead of reading as a jump.
                  opacity: [
                    { to: 1 },
                    { to: 1 },
                    { to: 1 },
                    { to: 1 },
                    { to: 1 },
                    { to: 0 },
                  ],
                  delay: stagger(PULSE_TRAIL_STAGGER_MS),
                  ease: "linear",
                  duration: 1800,
                  loop: true,
                  autoplay: false,
                });
                return [anim];
              })(),
            ],
            [
              animate(sceneEls[4].querySelectorAll("[data-cube]"), {
                rotate: 360,
                duration: 4600,
                ease: "linear",
                loop: true,
                autoplay: false,
              }),
            ],
            [
              animate(sceneEls[5].querySelectorAll("[data-pixel]"), {
                scale: [{ to: 1.18 }, { to: 1 }],
                duration: 900,
                delay: stagger(22, { from: "center" }),
                ease: "inOutQuad",
                loop: true,
                autoplay: false,
              }),
            ],
          ];

      // The [start, end] scroll ranges computed above — one per section —
      // recomputed whenever the layout changes (see onResize below).
      let windows = measureWindows();
      // Which section's bar/scene was showing last time we painted; starts
      // at -1 (an impossible index) so the very first paint always counts
      // as "changed" and runs its one-time setup (setActive, starting the
      // right animation loop).
      let shown = -1;
      // A simple "already have a paint scheduled" flag, used right below to
      // avoid stacking up multiple redundant animation-frame requests if
      // several scroll events fire before the browser gets a chance to paint.
      let ticking = false;

      const paint = () => {
        ticking = false;
        const y = window.scrollY;
        let current = 0;
        windows.forEach(([from, to], i) => {
          // How far through *this section's* window the current scroll
          // position is, as a fraction: 0 at the window's start, 1 at its
          // end. (y - from) is how far we've scrolled into the window;
          // dividing by (to - from), the window's total length, converts
          // that into a 0..1 fraction. Math.max(0, ...) and Math.min(1, ...)
          // clamp it so sections not yet reached read as 0 and sections
          // already passed read as 1, instead of going negative or over 1.
          const p = Math.min(1, Math.max(0, (y - from) / (to - from)));
          // SVG stroke-dasharray/dashoffset trick: each fill path has its
          // pathLength normalized to exactly 1 (see pathLength={1} in the
          // JSX below), so a strokeDashoffset of 1 hides the entire stroke
          // and 0 reveals all of it. Setting it to (1 - p) means as p grows
          // from 0 to 1 (scrolling through the section), the offset shrinks
          // from 1 to 0 and the arc visibly fills in, animating scroll
          // progress purely through a DOM property write (no React render).
          utils.set(fills[i], { strokeDashoffset: 1 - p });
          // The "current" section is simply the last one whose window we've
          // scrolled *past the start of* — since windows are visited in
          // order, whichever one wins this comparison last is the furthest
          // one reached.
          if (y >= from) current = i;
        });
        // Only touch React state / restart animations when the active
        // section actually changes, not on every scroll pixel — this is
        // what keeps the component from re-rendering 60 times a second.
        if (current !== shown) {
          shown = current;
          setActive(current);
          // Restart the newly active section's animation loop(s) from the
          // beginning (so it always starts its cycle fresh when you arrive)
          // and pause every other section's loop so only one scene's
          // animation is ever actually running/consuming CPU at a time.
          loops.forEach((group, j) =>
            group.forEach((l) => (j === current ? l.restart() : l.pause())),
          );
        }
      };

      const onScrollTick = () => {
        // Debounce to once per animation frame: scroll events can fire far
        // more often than the screen can actually repaint, so if a paint is
        // already queued for the next frame, skip scheduling another one.
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(paint);
      };
      const onResize = () => {
        // Section positions/heights may have changed, so the scroll windows
        // need to be recalculated from scratch before the next paint.
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
