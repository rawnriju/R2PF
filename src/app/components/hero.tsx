import { useRef, useEffect, useCallback } from "react";
import { PlaygroundCanvas, Ball } from "./playground-canvas";

const REPEL_RADIUS = 110;
const MAX_DISPLACEMENT = 38;

function ScatterText({
  text,
  className,
  style,
  ballsRef,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  ballsRef: React.MutableRefObject<Ball[]>;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const charRefsRef = useRef<(HTMLSpanElement | null)[]>([]);

  const animate = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const chars = charRefsRef.current;
    const balls = ballsRef.current;
    const containerRect = container.closest("section")?.getBoundingClientRect();
    if (!containerRect) return;

    chars.forEach((el) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2 - containerRect.left;
      const cy = r.top + r.height / 2 - containerRect.top;

      let dx = 0;
      let dy = 0;

      for (const b of balls) {
        const dist = Math.hypot(b.x - cx, b.y - cy);
        if (dist < REPEL_RADIUS && dist > 0) {
          const force = (1 - dist / REPEL_RADIUS) ** 2;
          dx += ((cx - b.x) / dist) * force * MAX_DISPLACEMENT;
          dy += ((cy - b.y) / dist) * force * MAX_DISPLACEMENT;
        }
      }

      const magnitude = Math.hypot(dx, dy);
      if (magnitude > MAX_DISPLACEMENT) {
        dx = (dx / magnitude) * MAX_DISPLACEMENT;
        dy = (dy / magnitude) * MAX_DISPLACEMENT;
      }

      el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
      el.style.transition = balls.length === 0 ? "transform 0.5s ease-out" : "transform 0.04s linear";
    });
  }, [ballsRef]);

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

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-16">
      <PlaygroundCanvas sharedBallsRef={sharedBallsRef} />

      {/* subtle yellow glow backdrop */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,225,0,0.07), transparent 70%)" }}
      />

      <div className="pointer-events-none relative mx-auto w-full max-w-[1200px] px-6 py-24">
        <p className="pointer-events-auto font-mono mb-6" style={{ fontSize: 12, letterSpacing: "0.25em", color: "#FFE100" }}>
          // SENIOR CREATIVE FRONTEND ENGINEER
        </p>

        <h1
          className="pointer-events-auto"
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
            style={{ display: "block" }}
          />
          <br />
          <ScatterText
            text="RIJU"
            ballsRef={sharedBallsRef}
            style={{ color: "#FFE100", textShadow: "0 0 40px rgba(255,225,0,0.35)" }}
          />
        </h1>

        <p
          className="pointer-events-auto mt-6"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 500,
            fontSize: "clamp(18px, 2.4vw, 30px)",
            color: "#8A8F9E",
            letterSpacing: "0.02em",
          }}
        >
          <ScatterText text="FRONTEND ENGINEER & CREATIVE DEVELOPER" ballsRef={sharedBallsRef} />
        </p>

        <p
          className="pointer-events-auto mt-8 max-w-[560px]"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, lineHeight: 1.6, color: "#8A8F9E" }}
        >
          I engineer high-performance, expressive web interfaces and creative
          canvas systems — blending precise motion, real-time interaction, and
          editorial minimalism into experiences that feel alive.
        </p>
      </div>

      {/* HUD control banner */}
      <div className="pointer-events-none absolute bottom-8 inset-x-0 flex justify-center px-6">
        <div
          className="pointer-events-auto backdrop-blur-md font-mono flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-5 py-3 rounded-full"
          style={{
            background: "rgba(18,22,31,0.55)",
            border: "1px solid rgba(255,255,255,0.08)",
            fontSize: 11,
            letterSpacing: "0.08em",
            color: "#8A8F9E",
          }}
        >
          <span>[ 🖱️ LEFT-CLICK: <span style={{ color: "#FFE100" }}>LAUNCH BALL</span> ]</span>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
          <span>[ 🖱️ RIGHT-CLICK: <span style={{ color: "#FF5500" }}>KAWARIMI RESET</span> ]</span>
        </div>
      </div>
    </section>
  );
}
