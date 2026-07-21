import { useRef, useEffect, useCallback } from "react";
import { PlaygroundCanvas, Ball } from "./playground-canvas";

const REPEL_RADIUS = 130;
const MAX_OFFSET = 260;

interface CharState {
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  hx: number; // cached home x (section-relative), NaN until measured
  hy: number;
}

function ScatterText({
  text,
  className,
  style,
  ballsRef,
  resetSignalRef,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  ballsRef: React.MutableRefObject<Ball[]>;
  resetSignalRef: React.MutableRefObject<number>;
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
        const st = stateRef.current[i] || (stateRef.current[i] = { ox: 0, oy: 0, vx: 0, vy: 0, hx: NaN, hy: NaN });
        const r = el.getBoundingClientRect();
        st.hx = r.left + r.width / 2 - containerRect.left - st.ox;
        st.hy = r.top + r.height / 2 - containerRect.top - st.oy;
      });
      remeasureRef.current = false;
    }

    chars.forEach((el, i) => {
      if (!el) return;
      const st = stateRef.current[i] || (stateRef.current[i] = { ox: 0, oy: 0, vx: 0, vy: 0, hx: NaN, hy: NaN });
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

        for (const b of balls) {
          const dist = Math.hypot(b.x - px, b.y - py);
          if (dist < REPEL_RADIUS && dist > 0) {
            const force = (1 - dist / REPEL_RADIUS) ** 2;
            st.vx += ((px - b.x) / dist) * force * 6;
            st.vy += ((py - b.y) / dist) * force * 6;
          }
        }

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

      el.style.transform = `translate(${st.ox.toFixed(1)}px, ${st.oy.toFixed(1)}px)`;
    });

    // Finish the reset once everything is essentially home.
    if (resettingRef.current) {
      const settled = stateRef.current.every(
        (s) => !s || (Math.abs(s.ox) < 0.4 && Math.abs(s.oy) < 0.4)
      );
      if (settled) {
        resettingRef.current = false;
        stateRef.current.forEach((s) => s && (s.ox = s.oy = s.vx = s.vy = 0));
      }
    }
  }, [ballsRef, resetSignalRef]);

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
    <span ref={containerRef} className={className} style={{ ...style, display: "inline" }}>
      {chars.map((char, i) =>
        char === " " ? (
          <span key={i} style={{ display: "inline-block", width: "0.3em" }}>&nbsp;</span>
        ) : (
          <span
            key={i}
            ref={(el) => { charRefsRef.current[i] = el; }}
            style={{ display: "inline-block", willChange: "transform" }}
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

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-16">
      <PlaygroundCanvas sharedBallsRef={sharedBallsRef} resetSignalRef={resetSignalRef} />

      {/* subtle yellow glow backdrop */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,225,0,0.07), transparent 70%)" }}
      />

      <div className="pointer-events-none relative z-10 mx-auto w-full max-w-[1200px] px-6 py-24">
        <p className="font-mono mb-6" style={{ fontSize: 12, letterSpacing: "0.25em", color: "#FFE100" }}>
          // SENIOR CREATIVE FRONTEND ENGINEER
        </p>

        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            lineHeight: 0.92,
            fontSize: "clamp(48px, 9vw, 128px)",
            color: "#E2E8F0",
            letterSpacing: "-0.02em",
          }}
        >
          <ScatterText
            text="RAWN ABRAHAM"
            ballsRef={sharedBallsRef}
            resetSignalRef={resetSignalRef}
            style={{ display: "block" }}
          />
          <br />
          <ScatterText
            text="RIJU"
            ballsRef={sharedBallsRef}
            resetSignalRef={resetSignalRef}
            style={{ color: "#FFE100", textShadow: "0 0 40px rgba(255,225,0,0.35)" }}
          />
        </h1>

        <p
          className="mt-6"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 500,
            fontSize: "clamp(18px, 2.4vw, 30px)",
            color: "#8A8F9E",
            letterSpacing: "0.02em",
          }}
        >
          <ScatterText
            text="FRONTEND ENGINEER & CREATIVE DEVELOPER"
            ballsRef={sharedBallsRef}
            resetSignalRef={resetSignalRef}
          />
        </p>

        <p
          className="mt-8 max-w-[560px]"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, lineHeight: 1.6, color: "#8A8F9E" }}
        >
          I engineer high-performance, expressive web interfaces and creative
          canvas systems — blending precise motion, real-time interaction, and
          editorial minimalism into experiences that feel alive.
        </p>
      </div>

      {/* HUD control banner */}
      <div className="pointer-events-none absolute bottom-8 inset-x-0 z-30 flex justify-center px-6">
        <div
          className="backdrop-blur-md font-mono flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-5 py-3 rounded-full"
          style={{
            background: "rgba(18,22,31,0.55)",
            border: "1px solid rgba(255,255,255,0.08)",
            fontSize: 11,
            letterSpacing: "0.08em",
            color: "#8A8F9E",
          }}
        >
          <span>[ 🖱️ HOLD LEFT-CLICK: <span style={{ color: "#FFE100" }}>CHARGE & AIM BALL</span> ]</span>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
          <span>[ 🖱️ RIGHT-CLICK: <span style={{ color: "#FF5500" }}>KAWARIMI RESET</span> ]</span>
        </div>
      </div>
    </section>
  );
}
