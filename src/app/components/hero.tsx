import { useRef, useEffect, useCallback, useState } from "react";
import { Play, Square } from "lucide-react";
import { PlaygroundCanvas, Ball, Pointer, ScoreLine } from "./playground-canvas";
import "./hero.css";

// How close (in pixels) a ball's center must get to a character's center
// before the character starts feeling a "push" force from it.
const REPEL_RADIUS = 130;
// The furthest (in pixels) a character is allowed to be pushed away from its
// home position. Without this, a character hit by many balls in a row could
// fly off-screen forever.
const MAX_OFFSET = 260;
// Same idea as REPEL_RADIUS, but for the mouse/touch pointer. Kept much
// smaller than a ball's radius so hovering near the text doesn't shove
// letters around from far away — you have to get close.
const POINTER_REPEL_RADIUS = 25;
// How hard the pointer pushes a character, compared to a ball's push
// (balls use a force multiplier of 6, see below — the pointer is deliberately
// gentler at 1.7 so it reads as a nudge, not a hit).
const POINTER_FORCE = 1.7;
// Must be meaningfully larger than POINTER_REPEL_RADIUS, or a stationary
// cursor sitting right at the boundary causes a push-out/ease-back buzz loop.
const POINTER_RELEASE_RADIUS = POINTER_REPEL_RADIUS * 1.4;

// Per-character physics state. Every letter on screen gets one of these so it
// can move independently of the others.
interface CharState {
  ox: number; // current horizontal offset from home (0 = sitting exactly at rest)
  oy: number; // current vertical offset from home
  vx: number; // current horizontal velocity (how fast/which way ox is changing per frame)
  vy: number; // current vertical velocity (same, for oy)
  hx: number; // cached home x (section-relative), NaN until measured
  hy: number;
  pOwn: boolean; // true while displacement is pointer-attributable and should ease home on release
}

function newCharState(): CharState {
  return { ox: 0, oy: 0, vx: 0, vy: 0, hx: NaN, hy: NaN, pOwn: false };
}

function ScatterText({
  text,
  className,
  ballsRef,
  resetSignalRef,
  pointerRef,
}: {
  text: string;
  className?: string;
  ballsRef: React.MutableRefObject<Ball[]>;
  resetSignalRef: React.MutableRefObject<number>;
  pointerRef?: React.MutableRefObject<Pointer> | null;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const charRefsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const stateRef = useRef<CharState[]>([]);
  const lastResetRef = useRef<number>(resetSignalRef.current);
  const resettingRef = useRef<boolean>(false);
  const remeasureRef = useRef<boolean>(true);

  // Invalidate cached home positions on resize (layout reflows).
  useEffect(() => {
    const onResize = () => { remeasureRef.current = true; };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const animate = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const chars = charRefsRef.current;
    const balls = ballsRef.current;
    const pointer = pointerRef?.current;

    // Detect a Kawarimi reset — begin easing every char back home.
    if (resetSignalRef.current !== lastResetRef.current) {
      lastResetRef.current = resetSignalRef.current;
      resettingRef.current = true;
    }

    // Re-measure cached home positions only when needed (mount / resize).
    // This is the only reflow we ever incur — normal frames are pure math.
    //
    // What's happening here: getBoundingClientRect() tells us where a letter
    // currently sits on screen — but if the letter is mid-scatter, that
    // includes whatever offset (ox/oy) has already been applied via the CSS
    // transform. We want "home" to mean the resting position (offset = 0),
    // so we take the letter's *current* on-screen center and subtract the
    // *current* offset back out. Whatever is left over is where the letter
    // would be sitting if it had never moved — that's its true home.
    if (remeasureRef.current) {
      const containerRect = container.closest("section")?.getBoundingClientRect();
      if (!containerRect) return;
      chars.forEach((el, i) => {
        if (!el) return;
        const st = stateRef.current[i] || (stateRef.current[i] = newCharState());
        const r = el.getBoundingClientRect();
        // r.left/top is the letter's top-left corner in *viewport* coords;
        // adding half the width/height moves us to its center. Subtracting
        // containerRect.left/top converts from viewport coords to
        // "section-relative" coords (i.e. distance from the section's own
        // top-left corner, which stays stable even if the page scrolls).
        st.hx = r.left + r.width / 2 - containerRect.left - st.ox;
        st.hy = r.top + r.height / 2 - containerRect.top - st.oy;
      });
      remeasureRef.current = false;
    }

    chars.forEach((el, i) => {
      if (!el) return;
      const st = stateRef.current[i] || (stateRef.current[i] = newCharState());
      if (Number.isNaN(st.hx)) return;

      if (resettingRef.current) {
        // Smoothly reassemble toward origin.
        //
        // (0 - st.ox) * 0.18 is a classic "lerp" (linear interpolation) step:
        // it moves ox 18% of the remaining distance to 0 on every single
        // frame. Because the remaining distance keeps shrinking, the letter
        // covers big ground at first and then coasts to a gentle stop right
        // at home — no bounce, no overshoot, just an ease-out curve, all
        // from one line of arithmetic repeated every frame.
        st.ox += (0 - st.ox) * 0.18;
        st.oy += (0 - st.oy) * 0.18;
        st.vx = 0;
        st.vy = 0;
      } else {
        // Current visual center = cached home + accumulated offset.
        // (This is just the reverse of the subtraction done during
        // remeasuring above: home + offset = where the letter is right now.)
        const px = st.hx + st.ox;
        const py = st.hy + st.oy;

        let ballPush = false;
        for (const b of balls) {
          // Math.hypot(dx, dy) is the straight-line (Pythagorean) distance
          // between the ball's center and this letter's center — the same
          // as Math.sqrt(dx*dx + dy*dy), just built into the language.
          const dist = Math.hypot(b.x - px, b.y - py);
          if (dist < REPEL_RADIUS && dist > 0) {
            ballPush = true;
            // (1 - dist/REPEL_RADIUS) is 1 when the ball is touching the
            // letter and fades to 0 at the edge of the repel radius — i.e.
            // "how much of the push zone have we used up". Squaring it makes
            // the push ramp up sharply only once the ball gets really close,
            // instead of growing in a straight line — it feels more like a
            // real collision than a uniform force field.
            const force = (1 - dist / REPEL_RADIUS) ** 2;
            // (px - b.x) / dist and (py - b.y) / dist together form a "unit
            // vector": a direction (pointing straight away from the ball)
            // whose length has been normalized to exactly 1. Multiplying
            // that direction by `force` gives a push of the right strength
            // in the right direction, which gets added onto the letter's
            // velocity (so pushes accumulate frame over frame rather than
            // snapping instantly). The trailing `* 6` is just an overall
            // strength dial for balls, tuned by feel.
            st.vx += ((px - b.x) / dist) * force * 6;
            st.vy += ((py - b.y) / dist) * force * 6;
          }
        }

        let pointerPush = false;
        let pDist = Infinity;
        if (pointer && pointer.active) {
          // Identical distance/force/direction math as the ball loop above,
          // just using the mouse/touch position and the pointer's own
          // (smaller, gentler) radius and strength constants.
          pDist = Math.hypot(pointer.x - px, pointer.y - py);
          if (pDist < POINTER_REPEL_RADIUS && pDist > 0) {
            pointerPush = true;
            const force = (1 - pDist / POINTER_REPEL_RADIUS) ** 2;
            st.vx += ((px - pointer.x) / pDist) * force * POINTER_FORCE;
            st.vy += ((py - pointer.y) / pDist) * force * POINTER_FORCE;
          }
        }

        // pOwn ("pointer-owned") tracks *why* a letter is currently
        // displaced, because balls and the pointer are meant to feel
        // different: a ball hit should stick until the player deliberately
        // resets the scene (Kawarimi), but a pointer nudge should relax back
        // home the moment the cursor moves away. A ball touching the letter
        // always wins that distinction — even if the pointer touched it
        // first — because a ball is a more "committed" hit than a hover.
        if (pointerPush) st.pOwn = true;
        if (ballPush) st.pOwn = false;

        // Decide whether *this* frame should be the gentle "spring home"
        // behavior instead of free-flying physics. All four conditions must
        // hold: nothing is pushing on it right now, its current displacement
        // is pointer-caused (not ball-caused), and the pointer has moved
        // far enough away (past POINTER_RELEASE_RADIUS) that it's not still
        // hovering right at the edge.
        const shouldEaseHome =
          !pointerPush &&
          !ballPush &&
          st.pOwn &&
          (!pointer || !pointer.active || pDist > POINTER_RELEASE_RADIUS);

        if (shouldEaseHome) {
          // Same lerp-toward-zero trick used for the Kawarimi reset above:
          // move 18% of the remaining distance home each frame, which reads
          // as a smooth spring-back rather than a straight-line slide.
          st.ox += (0 - st.ox) * 0.18;
          st.oy += (0 - st.oy) * 0.18;
          st.vx = 0;
          st.vy = 0;
          // Once the leftover offset is small enough to be visually
          // indistinguishable from "home" (under 0.4px), snap it to exactly
          // 0 and clear the ownership flag — otherwise floating point lerp
          // math would keep it infinitesimally off-center forever and this
          // branch would never truly finish.
          if (Math.abs(st.ox) < 0.4 && Math.abs(st.oy) < 0.4) {
            st.ox = 0;
            st.oy = 0;
            st.pOwn = false;
          }
        } else {
          // Free-flying physics step: this is what makes a ball-hit letter
          // drift and slow down like a real object, instead of snapping
          // straight back.
          //
          // 1) Friction: multiplying velocity by 0.88 every frame bleeds off
          //    12% of its speed each frame, so a push doesn't accelerate the
          //    letter forever — it decays toward a stop (but never fully
          //    reaches exactly 0, hence "permanent until reset": there's no
          //    spring pulling it back to home, only friction slowing it down).
          st.vx *= 0.88;
          st.vy *= 0.88;
          // 2) Integrate velocity into position: this frame's velocity is
          //    added onto the accumulated offset, the same way speed adds
          //    onto distance traveled over time.
          st.ox += st.vx;
          st.oy += st.vy;

          // 3) Clamp: Math.hypot(ox, oy) is the letter's total straight-line
          //    distance from home. If repeated pushes have carried it past
          //    MAX_OFFSET, rescale the (ox, oy) vector back down to exactly
          //    MAX_OFFSET length while keeping its direction unchanged —
          //    dividing by `mag` first turns it into a unit vector (length
          //    1, same direction), then multiplying by MAX_OFFSET stretches
          //    it back out to the maximum allowed length.
          const mag = Math.hypot(st.ox, st.oy);
          if (mag > MAX_OFFSET) {
            st.ox = (st.ox / mag) * MAX_OFFSET;
            st.oy = (st.oy / mag) * MAX_OFFSET;
          }
        }
      }

      // CSS transforms don't trigger layout reflow the way changing left/top
      // would, so this is the cheap way to move a letter every single frame.
      // toFixed(1) rounds to one decimal place — plenty of precision for
      // something rendered on a screen, and it keeps the transform strings
      // short.
      el.style.transform = `translate(${st.ox.toFixed(1)}px, ${st.oy.toFixed(1)}px)`;
    });

    // Finish the reset once everything is essentially home.
    // .every(...) checks that every single character (or the ones that
    // haven't been created yet, `!s`) is within 0.4px of its home position —
    // i.e. the whole word has visually reassembled. Once true, we snap
    // everything to a perfectly clean state (exact zero offset/velocity) so
    // no tiny leftover drift lingers from the lerp approaching-but-never-
    // quite-reaching zero.
    if (resettingRef.current) {
      const settled = stateRef.current.every(
        (s) => !s || (Math.abs(s.ox) < 0.4 && Math.abs(s.oy) < 0.4)
      );
      if (settled) {
        resettingRef.current = false;
        stateRef.current.forEach((s) => {
          if (!s) return;
          s.ox = s.oy = s.vx = s.vy = 0;
          s.pOwn = false;
        });
      }
    }
  }, [ballsRef, resetSignalRef, pointerRef]);

  // Drives the whole animation: requestAnimationFrame asks the browser to
  // call `loop` right before its next repaint (usually ~60 times a second).
  // Each call runs one physics step (`animate()`) and then immediately
  // schedules the next one, creating a self-sustaining loop that automatically
  // matches the display's refresh rate instead of running on a fixed timer.
  useEffect(() => {
    let raf: number;
    const loop = () => {
      animate();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [animate]);

  // Split on spaces but keep them as their own tokens (capturing group),
  // so each word's letters can be grouped into a single non-wrapping unit
  // below — without this, every letter is an independent wrap point and a
  // long word (e.g. "ABRAHAM") can break mid-word on narrow screens.
  const tokens = text.split(/( )/);
  let i = 0;

  return (
    <span ref={containerRef} className={`hero-scatter ${className ?? ""}`}>
      {tokens.map((token, ti) => {
        if (token === "") return null;
        if (token === " ") {
          const spaceIndex = i++;
          return <span key={spaceIndex} className="hero-scatter__space">&nbsp;</span>;
        }
        return (
          <span key={ti} className="hero-scatter__word">
            {token.split("").map((char) => {
              const charIndex = i++;
              return (
                <span
                  key={charIndex}
                  ref={(el) => { charRefsRef.current[charIndex] = el; }}
                  className="hero-scatter__char"
                >
                  {char}
                </span>
              );
            })}
          </span>
        );
      })}
    </span>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const sharedBallsRef = useRef<Ball[]>([]);
  const resetSignalRef = useRef<number>(0);
  const sharedPointerRef = useRef<Pointer>({ x: 0, y: 0, active: false });
  const scoreLineRef = useRef<ScoreLine | null>(null);
  const scoreLineElRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [pulses, setPulses] = useState<{ id: number; x: number; y: number }[]>([]);
  const pulseIdRef = useRef(0);
  // Ball game (charge/launch/score/HUD) stays off until the visitor opts in —
  // only the pointer-driven letter nudge below is active out of the box.
  const [playing, setPlaying] = useState(false);

  // Drives the same letter-repel effect the playground canvas normally owns,
  // but without mounting the canvas/ball game. Once `playing` is true,
  // PlaygroundCanvas's own mousemove handler takes over this ref instead.
  useEffect(() => {
    if (playing) return;
    const section = sectionRef.current;
    if (!section) return;

    const getPos = (clientX: number, clientY: number) => {
      const rect = section.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };
    const onMouseMove = (e: MouseEvent) => {
      const { x, y } = getPos(e.clientX, e.clientY);
      sharedPointerRef.current.x = x;
      sharedPointerRef.current.y = y;
      sharedPointerRef.current.active = true;
    };
    const onMouseLeave = () => {
      sharedPointerRef.current.active = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const { x, y } = getPos(t.clientX, t.clientY);
      sharedPointerRef.current.x = x;
      sharedPointerRef.current.y = y;
      sharedPointerRef.current.active = true;
    };
    const onTouchEnd = () => {
      sharedPointerRef.current.active = false;
    };

    section.addEventListener("mousemove", onMouseMove);
    section.addEventListener("mouseleave", onMouseLeave);
    section.addEventListener("touchmove", onTouchMove, { passive: true });
    section.addEventListener("touchend", onTouchEnd);
    return () => {
      section.removeEventListener("mousemove", onMouseMove);
      section.removeEventListener("mouseleave", onMouseLeave);
      section.removeEventListener("touchmove", onTouchMove);
      section.removeEventListener("touchend", onTouchEnd);
    };
  }, [playing, sharedPointerRef]);

  // Runs whenever the playground canvas tells us a ball scored — either the
  // main scoring line (1 point) or a moving bonus target (worth more),
  // reporting its own points and pulse origin so this stays generic.
  const handleScore = useCallback((points: number, x: number, y: number) => {
    // Functional updater form `(s) => s + points`: React batches state
    // updates, so reading the *previous* value via a callback (rather than
    // closing over `score` directly) guarantees each goal increments from
    // the true latest count, even if several land in quick succession.
    setScore((s) => s + points);
    // A simple incrementing counter used purely as a unique React `key` /
    // lookup id for each pulse, so multiple overlapping celebration pulses
    // (e.g. two goals close together) don't get confused with each other.
    const id = ++pulseIdRef.current;
    setPulses((p) => [...p, { id, x, y }]);
    // Remove this pulse from state after its CSS animation has finished
    // playing, so the DOM node is cleaned up rather than accumulating.
    // 900ms must stay in sync with the hero-goal-pulse animation in hero.css.
    window.setTimeout(() => {
      setPulses((p) => p.filter((pu) => pu.id !== id));
    }, 900);
  }, []);

  // Kawarimi reset (right-click / 2-finger tap) clears the balls and eases
  // the letters home — it should zero the score too, not just the scene.
  const handleReset = useCallback(() => setScore(0), []);

  // Leaves play mode and clears game state, so pressing PLAY again starts fresh.
  const handleStop = useCallback(() => {
    sharedBallsRef.current = [];
    resetSignalRef.current += 1;
    setScore(0);
    setPlaying(false);
  }, []);

  // Measure the scoring line's position (canvas-local / section-relative,
  // same space as Ball.x/y) on mount and whenever layout changes.
  useEffect(() => {
    const measure = () => {
      const el = scoreLineElRef.current;
      const section = el?.closest("section");
      if (!el || !section) return;
      // getBoundingClientRect() gives coordinates relative to the browser
      // viewport (i.e. they'd shift if you scrolled the page). Subtracting
      // the section's own rect converts everything into "section-relative"
      // coordinates instead — the same coordinate space the physics balls
      // (Ball.x/y) already use, so distances between a ball and this line
      // can be compared directly without a mismatch.
      const r = el.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      scoreLineRef.current = {
        x: r.left + r.width / 2 - sectionRect.left, // horizontal midpoint of the line
        top: r.top - sectionRect.top, // line's top edge, section-relative
        bottom: r.bottom - sectionRect.top, // line's bottom edge, section-relative
      };
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-16"
    >
      {playing && (
        <PlaygroundCanvas
          sharedBallsRef={sharedBallsRef}
          resetSignalRef={resetSignalRef}
          sharedPointerRef={sharedPointerRef}
          scoreLineRef={scoreLineRef}
          onScore={handleScore}
          onReset={handleReset}
        />
      )}

      {/* goal celebration — glowing circle expanding outward from the score line */}
      {pulses.map((p) => (
        <div
          key={p.id}
          aria-hidden="true"
          className="hero-goal-pulse pointer-events-none absolute z-40"
          // Position is measured DOM geometry, so it can't live in CSS.
          style={{ left: p.x, top: p.y }}
        />
      ))}

      {/* score bar / play toggle — tracks the same centered content column as
          the headline, so it moves inward with it on wide screens instead of
          staying pinned to the raw viewport edge */}
      <div className="absolute inset-x-0 top-20 sm:top-72 z-30">
        <div className="relative mx-auto max-w-[1200px] px-6">
          <div className="pointer-events-auto absolute right-0 top-0 flex items-center gap-2">
            {playing ? (
              <button
                type="button"
                onClick={handleStop}
                aria-label="Stop the interactive playground"
                className="hero-play-btn backdrop-blur-md font-mono flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full"
              >
                {score > 0 && (
                  <>
                    <span>
                      [ SCORE: <span className="hero-hud__brand">{score}</span> ]
                    </span>
                    <span className="dot-sep">•</span>
                  </>
                )}
                <Square size={10} fill="currentColor" />
                <span>STOP</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                aria-label="Turn on the interactive playground"
                className="hero-play-btn backdrop-blur-md font-mono flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full"
              >
                <Play size={11} fill="currentColor" />
                <span>PLAY</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* subtle accent glow backdrop */}
      <div className="hero-glow pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full" />

      <div className="pointer-events-none relative z-10 mx-auto w-full max-w-[1200px] px-6 py-24">
        <p className="section-eyebrow font-mono mb-6">
          // SENIOR FRONTEND SOFTWARE ENGINEER
        </p>

        <h1 className="hero-title">
          <div
            ref={scoreLineElRef}
            aria-hidden="true"
            className="hero-score-line absolute"
          />
          <ScatterText
            text="RAWN ABRAHAM"
            ballsRef={sharedBallsRef}
            resetSignalRef={resetSignalRef}
            pointerRef={sharedPointerRef}
          />
          <br />
          <ScatterText
            text="RIJU"
            ballsRef={sharedBallsRef}
            resetSignalRef={resetSignalRef}
            pointerRef={sharedPointerRef}
            className="hero-title__accent"
          />
        </h1>

        <p className="hero-subtitle mt-6">
          <ScatterText
            text="FRONTEND SOFTWARE ENGINEER & MSC STUDENT"
            ballsRef={sharedBallsRef}
            resetSignalRef={resetSignalRef}
          />
        </p>

        <p className="hero-blurb mt-8 max-w-[800px]">
       Hey there! I'm Rawn, and I like to learn, build, and question things. I'm a frontend software engineer with nearly 5 years of professional experience, specializing in data visualization and building accessible, user-friendly experiences. </p>
      </div>

      {/* HUD control banner — separate copy for touch vs. mouse, since the
          gestures (and the space to explain them) differ on mobile. */}
      {playing && (
        <div className="pointer-events-none absolute bottom-4 sm:bottom-8 inset-x-0 z-30 flex justify-center px-6">
          <div className="hero-hud backdrop-blur-md font-mono flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-4 gap-y-1 px-3 py-1.5 sm:px-5 sm:py-3 rounded-full">
            <span className="sm:hidden">[ 👆 HOLD: <span className="hero-hud__brand">AIM & LAUNCH</span> ]</span>
            <span className="dot-sep sm:hidden">•</span>
            <span className="sm:hidden">[ ✌️ 2-FINGER TAP: <span className="hero-hud__brand-2">RESET</span> ]</span>

            <span className="hidden sm:inline">[ 🖱️ HOLD LEFT-CLICK: <span className="hero-hud__brand">CHARGE & AIM BALL</span> ]</span>
            <span className="dot-sep hidden sm:inline">•</span>
            <span className="hidden sm:inline">[ 🖱️ RIGHT-CLICK: <span className="hero-hud__brand-2">KAWARIMI RESET</span> ]</span>
          </div>
        </div>
      )}
    </section>
  );
}
