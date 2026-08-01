import { useRef, useEffect, useCallback, useState } from "react";
import { PlaygroundCanvas, Ball, Pointer, ScoreLine } from "./playground-canvas";
import "./hero.css";

const REPEL_RADIUS = 130;
const MAX_OFFSET = 260;
const POINTER_REPEL_RADIUS = 25;
const POINTER_FORCE = 1.7;
// Must be meaningfully larger than POINTER_REPEL_RADIUS, or a stationary
// cursor sitting right at the boundary causes a push-out/ease-back buzz loop.
const POINTER_RELEASE_RADIUS = POINTER_REPEL_RADIUS * 1.4;

interface CharState {
  ox: number;
  oy: number;
  vx: number;
  vy: number;
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
    if (remeasureRef.current) {
      const containerRect = container.closest("section")?.getBoundingClientRect();
      if (!containerRect) return;
      chars.forEach((el, i) => {
        if (!el) return;
        const st = stateRef.current[i] || (stateRef.current[i] = newCharState());
        const r = el.getBoundingClientRect();
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
        st.ox += (0 - st.ox) * 0.18;
        st.oy += (0 - st.oy) * 0.18;
        st.vx = 0;
        st.vy = 0;
      } else {
        // Current visual center = cached home + accumulated offset.
        const px = st.hx + st.ox;
        const py = st.hy + st.oy;

        let ballPush = false;
        for (const b of balls) {
          const dist = Math.hypot(b.x - px, b.y - py);
          if (dist < REPEL_RADIUS && dist > 0) {
            ballPush = true;
            const force = (1 - dist / REPEL_RADIUS) ** 2;
            st.vx += ((px - b.x) / dist) * force * 6;
            st.vy += ((py - b.y) / dist) * force * 6;
          }
        }

        let pointerPush = false;
        let pDist = Infinity;
        if (pointer && pointer.active) {
          pDist = Math.hypot(pointer.x - px, pointer.y - py);
          if (pDist < POINTER_REPEL_RADIUS && pDist > 0) {
            pointerPush = true;
            const force = (1 - pDist / POINTER_REPEL_RADIUS) ** 2;
            st.vx += ((px - pointer.x) / pDist) * force * POINTER_FORCE;
            st.vy += ((py - pointer.y) / pDist) * force * POINTER_FORCE;
          }
        }

        // A ball touching this character claims it — it reverts to the
        // permanent-until-Kawarimi behavior even if the pointer nudged it first.
        if (pointerPush) st.pOwn = true;
        if (ballPush) st.pOwn = false;

        const shouldEaseHome =
          !pointerPush &&
          !ballPush &&
          st.pOwn &&
          (!pointer || !pointer.active || pDist > POINTER_RELEASE_RADIUS);

        if (shouldEaseHome) {
          // Pointer-only displacement springs back once the cursor is genuinely away.
          st.ox += (0 - st.ox) * 0.18;
          st.oy += (0 - st.oy) * 0.18;
          st.vx = 0;
          st.vy = 0;
          if (Math.abs(st.ox) < 0.4 && Math.abs(st.oy) < 0.4) {
            st.ox = 0;
            st.oy = 0;
            st.pOwn = false;
          }
        } else {
          // Friction, no spring — displacement is permanent until reset.
          st.vx *= 0.88;
          st.vy *= 0.88;
          st.ox += st.vx;
          st.oy += st.vy;

          const mag = Math.hypot(st.ox, st.oy);
          if (mag > MAX_OFFSET) {
            st.ox = (st.ox / mag) * MAX_OFFSET;
            st.oy = (st.oy / mag) * MAX_OFFSET;
          }
        }
      }

      el.style.transform = `translate(${st.ox.toFixed(1)}px, ${st.oy.toFixed(1)}px)`;
    });

    // Finish the reset once everything is essentially home.
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

  useEffect(() => {
    let raf: number;
    const loop = () => {
      animate();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [animate]);

  const chars = text.split("");

  return (
    <span ref={containerRef} className={`hero-scatter ${className ?? ""}`}>
      {chars.map((char, i) =>
        char === " " ? (
          <span key={i} className="hero-scatter__space">&nbsp;</span>
        ) : (
          <span
            key={i}
            ref={(el) => { charRefsRef.current[i] = el; }}
            className="hero-scatter__char"
          >
            {char}
          </span>
        )
      )}
    </span>
  );
}

export function Hero() {
  const sharedBallsRef = useRef<Ball[]>([]);
  const resetSignalRef = useRef<number>(0);
  const sharedPointerRef = useRef<Pointer>({ x: 0, y: 0, active: false });
  const scoreLineRef = useRef<ScoreLine | null>(null);
  const scoreLineElRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [pulses, setPulses] = useState<{ id: number; x: number; y: number }[]>([]);
  const pulseIdRef = useRef(0);

  const handleScore = useCallback(() => {
    setScore((s) => s + 1);
    const line = scoreLineRef.current;
    const id = ++pulseIdRef.current;
    setPulses((p) => [...p, { id, x: line?.x ?? 0, y: line ? (line.top + line.bottom) / 2 : 0 }]);
    // 900ms must stay in sync with the hero-goal-pulse animation in hero.css.
    window.setTimeout(() => {
      setPulses((p) => p.filter((pu) => pu.id !== id));
    }, 900);
  }, []);

  // Measure the scoring line's position (canvas-local / section-relative,
  // same space as Ball.x/y) on mount and whenever layout changes.
  useEffect(() => {
    const measure = () => {
      const el = scoreLineElRef.current;
      const section = el?.closest("section");
      if (!el || !section) return;
      const r = el.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      scoreLineRef.current = {
        x: r.left + r.width / 2 - sectionRect.left,
        top: r.top - sectionRect.top,
        bottom: r.bottom - sectionRect.top,
      };
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-16">
      <PlaygroundCanvas
        sharedBallsRef={sharedBallsRef}
        resetSignalRef={resetSignalRef}
        sharedPointerRef={sharedPointerRef}
        scoreLineRef={scoreLineRef}
        onScore={handleScore}
      />

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

      {/* floating score bar — tracks the same centered content column as the
          headline, so it moves inward with it on wide screens instead of
          staying pinned to the raw viewport edge */}
      {score > 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-72 z-30">
          <div className="relative mx-auto max-w-[1200px] px-6">
            <div className="hero-hud absolute right-0 top-0 backdrop-blur-md font-mono flex items-center gap-2 px-4 py-2 rounded-full">
              [ SCORE: <span className="hero-hud__brand">{score}</span> ]
            </div>
          </div>
        </div>
      )}

      {/* subtle accent glow backdrop */}
      <div className="hero-glow pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full" />

      <div className="pointer-events-none relative z-10 mx-auto w-full max-w-[1200px] px-6 py-24">
        <p className="section-eyebrow font-mono mb-6">
          // SENIOR FULLSTACK SOFTWARE ENGINEER
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
            text="FULLSTACK SOFTWARE ENGINEER & MSC STUDENT"
            ballsRef={sharedBallsRef}
            resetSignalRef={resetSignalRef}
          />
        </p>

        <p className="hero-blurb mt-8 max-w-[800px]">
       Hey there! I'm Rawn, and I like to learn, build, and question things. I'm a full-stack software engineer with nearly 5 years of professional experience, specializing in data visualization and building accessible, user-friendly experiences. </p>
      </div>

      {/* HUD control banner */}
      <div className="pointer-events-none absolute bottom-8 inset-x-0 z-30 flex justify-center px-6">
        <div className="hero-hud backdrop-blur-md font-mono flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-5 py-3 rounded-full">
          <span>[ 🖱️ HOLD LEFT-CLICK: <span className="hero-hud__brand">CHARGE & AIM BALL</span> ]</span>
          <span className="dot-sep">•</span>
          <span>[ 🖱️ RIGHT-CLICK: <span className="hero-hud__brand-2">KAWARIMI RESET</span> ]</span>
        </div>
      </div>
    </section>
  );
}
