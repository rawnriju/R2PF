import { useEffect, useRef } from "react";
import { useTheme } from "../theme";

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /** Which of the two accents this ball uses. Resolved to a color at draw time
   *  so in-flight balls recolor with the theme instead of freezing their hex. */
  orange: boolean;
  life: number;
}

export interface Pointer {
  x: number;
  y: number;
  active: boolean;
}

export interface ScoreLine {
  x: number;
  top: number;
  bottom: number;
}

interface Props {
  sharedBallsRef: React.MutableRefObject<Ball[]>;
  /** Incremented every time a Kawarimi reset happens, so text can un-scatter. */
  resetSignalRef: React.MutableRefObject<number>;
  /** Live cursor/touch position in canvas-local space, for hover-driven text repulsion. */
  sharedPointerRef: React.MutableRefObject<Pointer>;
  /** Canvas-local position of the scoring line, or null until measured. */
  scoreLineRef: React.MutableRefObject<ScoreLine | null>;
  /** Called once per ball that hits the scoring line. */
  onScore: () => void;
}

const MAX_CHARGE_R = 46;
const MIN_CHARGE_R = 6;
const CHARGE_GROW = 0.9; // radius gained per frame while held
// How far (in px) a touch has to drift from its start point before it's
// treated as a scroll swipe instead of an aimed shot. Below this, tiny
// finger jitter during a hold still counts as a deliberate tap.
const TOUCH_SCROLL_THRESHOLD = 12;

interface Pixel {
  x: number; y: number; vx: number; vy: number; size: number; orange: boolean; life: number;
}
interface Smoke {
  x: number; y: number; vx: number; vy: number; r: number; alpha: number; spin: number; rot: number;
}

interface Palette {
  accent: string;
  accent2: string;
  accentRgb: string;
  trailCore: string;
  trailMid: string;
  trailEdge: string;
  flash: string;
  flashRingRgb: string;
}

/**
 * A 2D context takes color strings, not var() — so pull the current values off
 * the document once per theme instead of hard-coding them.
 */
function resolvePalette(): Palette {
  const cs = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) =>
    cs.getPropertyValue(name).trim() || fallback;
  return {
    accent: read("--brand", "#FFE100"),
    accent2: read("--brand-2", "#FF5500"),
    accentRgb: read("--brand-rgb", "255,225,0"),
    trailCore: read("--trail-core", "rgba(190,195,205,0.9)"),
    trailMid: read("--trail-mid", "rgba(140,143,158,0.5)"),
    trailEdge: read("--trail-edge", "rgba(140,143,158,0)"),
    flash: read("--flash", "#FFFFFF"),
    flashRingRgb: read("--flash-ring-rgb", "255,255,255"),
  };
}

export function PlaygroundCanvas({ sharedBallsRef, resetSignalRef, sharedPointerRef, scoreLineRef, onScore }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const pulseRef = useRef<{ x: number; y: number; r: number; alpha: number }[]>([]);
  const pixelsRef = useRef<Pixel[]>([]);
  const smokeRef = useRef<Smoke[]>([]);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  // The ball currently being charged (grows while left button is held).
  // overcharge counts frames spent sitting at MAX_CHARGE_R — drives the burst-warning flash.
  const chargingRef = useRef<{ x: number; y: number; r: number; orange: boolean; overcharge: number } | null>(null);

  // Re-runs on theme change, which is what re-resolves the palette and rebuilds
  // the smoke sprite. The simulation itself lives in refs, so nothing is lost.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const palette = resolvePalette();
    const ballColor = (orange: boolean) => (orange ? palette.accent2 : palette.accent);

    // The loop is only scheduled while the canvas is actually on screen —
    // the hero sits at the top of a long page, so without this the whole
    // simulation keeps running while the visitor reads the sections below it.
    // Safe to stop and resume because the sim is frame-stepped, not
    // delta-timed: pausing freezes it and resuming continues from the same
    // state, with no jump.
    let raf = 0;
    let running = false;
    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(render);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // Cap the backing-store scale — dpr 3 phones repaint ~2x the pixels of dpr 2
    // for near-invisible quality gain, so clamp to 2.
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Pre-rendered smoke sprite — drawing this scaled is far cheaper than
    // building a radial gradient per puff per frame.
    const smokeSprite = document.createElement("canvas");
    smokeSprite.width = smokeSprite.height = 128;
    const sctx = smokeSprite.getContext("2d");
    if (sctx) {
      const grad = sctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, palette.trailCore);
      grad.addColorStop(0.6, palette.trailMid);
      grad.addColorStop(1, palette.trailEdge);
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, 128, 128);
    }

    const getPosXY = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };
    const getPos = (e: MouseEvent) => getPosXY(e.clientX, e.clientY);

    const startCharge = (x: number, y: number) => {
      mouseRef.current = { x, y };
      sharedPointerRef.current.x = x;
      sharedPointerRef.current.y = y;
      sharedPointerRef.current.active = true;
      chargingRef.current = {
        x,
        y,
        r: MIN_CHARGE_R,
        orange: Math.random() > 0.6,
        overcharge: 0,
      };
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      const { x, y } = getPos(e);
      startCharge(x, y);
    };

    const onMouseMove = (e: MouseEvent) => {
      const { x, y } = getPos(e);
      mouseRef.current.x = x;
      mouseRef.current.y = y;
      sharedPointerRef.current.x = x;
      sharedPointerRef.current.y = y;
      sharedPointerRef.current.active = true;
    };

    const onMouseLeave = () => {
      sharedPointerRef.current.active = false;
    };

    const onWindowBlurOrScroll = () => {
      sharedPointerRef.current.active = false;
    };

    const launch = () => {
      const charge = chargingRef.current;
      if (!charge) return;
      chargingRef.current = null;

      // Direction: from the ball origin toward the current cursor position.
      let dx = mouseRef.current.x - charge.x;
      let dy = mouseRef.current.y - charge.y;
      let dist = Math.hypot(dx, dy);
      if (dist < 1) {
        // No aim given — default a gentle upward toss.
        dx = 0;
        dy = -1;
        dist = 1;
      }
      // Bigger (longer-held) balls get thrown harder.
      const speed = 6 + (charge.r / MAX_CHARGE_R) * 22;
      sharedBallsRef.current.push({
        x: charge.x,
        y: charge.y,
        vx: (dx / dist) * speed,
        vy: (dy / dist) * speed,
        r: charge.r,
        orange: charge.orange,
        life: 1,
      });
      if (sharedBallsRef.current.length > 60) sharedBallsRef.current.shift();
    };

    const doReset = (x: number, y: number) => {
      pulseRef.current.push({ x, y, r: 0, alpha: 1 });

      // Kawarimi substitution — a billowing cloud of smoke puffs.
      // Scale the cloud down on small screens to protect fill-rate.
      const rect = canvas.getBoundingClientRect();
      const small = rect.width < 768;
      const puffs = small ? 22 : 42;
      const spread = small ? 80 : 120;
      const rMax = small ? 90 : rect.width * 0.06 + 70;
      for (let i = 0; i < puffs; i++) {
        const ang = (Math.PI * 2 * i) / puffs + Math.random() * 0.5;
        const spd = 2 + Math.random() * 7;
        smokeRef.current.push({
          x: x + (Math.random() - 0.5) * spread,
          y: y + (Math.random() - 0.5) * spread,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 1,
          r: 40 + Math.random() * rMax,
          alpha: 0.5 + Math.random() * 0.35,
          spin: (Math.random() - 0.5) * 0.05,
          rot: Math.random() * Math.PI * 2,
        });
      }

      sharedBallsRef.current = [];
      chargingRef.current = null;
      sharedPointerRef.current.active = false;
      resetSignalRef.current += 1;
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      const { x, y } = getPos(e);
      doReset(x, y);
    };

    // --- Touch support ---
    // One finger charges & launches (like left-click); two fingers = Kawarimi reset.
    // touchStart/touchScrolled below exist to tell a deliberate tap-and-hold
    // apart from a swipe-to-scroll gesture that merely happens to start on
    // the canvas (which covers the whole hero) — without this, scrolling
    // past the hero on mobile would fire a ball on every swipe.
    const touchStartRef = { x: 0, y: 0 };
    let touchScrolled = false;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        const t0 = e.touches[0];
        const t1 = e.touches[1];
        const { x, y } = getPosXY((t0.clientX + t1.clientX) / 2, (t0.clientY + t1.clientY) / 2);
        chargingRef.current = null;
        touchScrolled = false;
        doReset(x, y);
        return;
      }
      const t = e.touches[0];
      const { x, y } = getPosXY(t.clientX, t.clientY);
      touchStartRef.x = x;
      touchStartRef.y = y;
      touchScrolled = false;
      startCharge(x, y);
    };

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const { x, y } = getPosXY(t.clientX, t.clientY);
      mouseRef.current.x = x;
      mouseRef.current.y = y;
      sharedPointerRef.current.x = x;
      sharedPointerRef.current.y = y;
      sharedPointerRef.current.active = true;

      if (!touchScrolled && chargingRef.current) {
        const dist = Math.hypot(x - touchStartRef.x, y - touchStartRef.y);
        if (dist > TOUCH_SCROLL_THRESHOLD) {
          // Drifted too far to be a held aim — this is a scroll. Abandon
          // the charge silently so lifting the finger later doesn't launch.
          touchScrolled = true;
          chargingRef.current = null;
        }
      }
    };

    const onTouchEnd = () => {
      if (!touchScrolled) launch();
      chargingRef.current = null;
      sharedPointerRef.current.active = false;
      touchScrolled = false;
    };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("contextmenu", onContextMenu);
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("touchcancel", onTouchEnd);
    window.addEventListener("mouseup", launch);
    window.addEventListener("blur", onWindowBlurOrScroll);
    window.addEventListener("scroll", onWindowBlurOrScroll, { passive: true });

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // chakra reset pulses
      pulseRef.current = pulseRef.current.filter((p) => p.alpha > 0.02);
      for (const p of pulseRef.current) {
        p.r += 14;
        p.alpha *= 0.92;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${palette.accentRgb},${p.alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // substitution-jutsu smoke puffs
      smokeRef.current = smokeRef.current.filter((s) => s.alpha > 0.02);
      for (const s of smokeRef.current) {
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.96;
        s.vy = s.vy * 0.96 - 0.1; // drift upward as it dissipates
        s.r += 2.4;
        s.alpha *= 0.975;
        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.drawImage(smokeSprite, s.x - s.r, s.y - s.r, s.r * 2, s.r * 2);
        ctx.restore();
      }

      // pixel shards from shattered balls
      pixelsRef.current = pixelsRef.current.filter((p) => p.life > 0.05 && p.y < rect.height + 40);
      for (const p of pixelsRef.current) {
        p.vy += 0.4;
        p.x += p.vx;
        p.y += p.vy;
        p.life *= 0.97;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.shadowBlur = 14;
        ctx.shadowColor = ballColor(p.orange);
        ctx.fillStyle = ballColor(p.orange);
        ctx.fillRect(p.x, p.y, p.size, p.size); // square = pixel
        ctx.restore();
      }

      // balls — destroyed the moment they reach the floor
      const survivors: Ball[] = [];
      for (const b of sharedBallsRef.current) {
        b.vy += 0.35;
        b.x += b.vx;
        b.y += b.vy;

        const line = scoreLineRef.current;
        if (line) {
          const closestY = Math.min(Math.max(b.y, line.top), line.bottom);
          const lineDist = Math.hypot(b.x - line.x, b.y - closestY);
          if (lineDist < b.r) {
            // Scored — the ball is consumed; the celebration is a DOM-level
            // glowing pulse (see Hero), not a canvas particle burst.
            onScore();
            continue;
          }
        }

        if (b.y + b.r >= rect.height) {
          // Impact splash + pixel shatter where the ball vanishes.
          const iy = rect.height - b.r;
          pulseRef.current.push({ x: b.x, y: iy, r: b.r, alpha: 0.7 });
          const count = 26 + Math.floor(b.r * 2.5);
          for (let i = 0; i < count; i++) {
            pixelsRef.current.push({
              x: b.x + (Math.random() - 0.5) * b.r * 1.5,
              y: iy,
              vx: (Math.random() - 0.5) * 20,
              vy: -Math.random() * 17 - 3,
              size: 4 + Math.random() * 7,
              orange: b.orange,
              life: 1,
            });
          }
          continue; // drop the ball
        }
        if (b.x - b.r < 0) { b.x = b.r; b.vx *= -0.8; }
        if (b.x + b.r > rect.width) { b.x = rect.width - b.r; b.vx *= -0.8; }

        ctx.save();
        ctx.shadowBlur = 24;
        ctx.shadowColor = ballColor(b.orange);
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = ballColor(b.orange);
        ctx.fill();
        ctx.restore();

        survivors.push(b);
      }
      sharedBallsRef.current = survivors;

      // charging ball (grows while held, shows aim line toward cursor)
      const charge = chargingRef.current;
      if (charge) {
        charge.r = Math.min(MAX_CHARGE_R, charge.r + CHARGE_GROW);
        const isFull = charge.r >= MAX_CHARGE_R;
        charge.overcharge = isFull ? charge.overcharge + 1 : 0;

        // aim line
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(charge.x, charge.y);
        ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
        ctx.strokeStyle = `rgba(${palette.accentRgb},0.35)`;
        ctx.setLineDash([4, 6]);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // Held past full — flash faster/brighter the longer it's overcharged,
        // like it's about to burst.
        let fillColor = ballColor(charge.orange);
        let glowBlur = 34;
        let ballAlpha = 0.9;
        if (isFull) {
          const flashSpeed = 0.12 + Math.min(charge.overcharge / 90, 1) * 0.3;
          const flash = (Math.sin(charge.overcharge * flashSpeed) + 1) / 2; // 0..1
          glowBlur = 34 + flash * 46;
          ballAlpha = 0.7 + flash * 0.3;
          fillColor = flash > 0.55 ? palette.flash : ballColor(charge.orange);

          // Warning ring pulsing outward around the ball.
          ctx.save();
          ctx.beginPath();
          ctx.arc(charge.x, charge.y, charge.r + 6 + flash * 14, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${palette.flashRingRgb},${0.5 * flash})`;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }

        ctx.save();
        ctx.shadowBlur = glowBlur;
        ctx.shadowColor = ballColor(charge.orange);
        ctx.globalAlpha = ballAlpha;
        ctx.beginPath();
        ctx.arc(charge.x, charge.y, charge.r, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.fill();
        // charge ring
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(charge.x, charge.y, charge.r + 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (charge.r / MAX_CHARGE_R));
        ctx.strokeStyle = palette.accent2;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
      }

      if (running) raf = requestAnimationFrame(render);
    };

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      // Spin up just before it scrolls into view, so it's already live by the
      // time the first pixel shows.
      { rootMargin: "200px" },
    );
    io.observe(canvas);

    // Browsers already throttle rAF in background tabs, so this is insurance
    // rather than the actual win — don't treat it as load-bearing.
    const onVisibility = () => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mouseup", launch);
      window.removeEventListener("blur", onWindowBlurOrScroll);
      window.removeEventListener("scroll", onWindowBlurOrScroll);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("contextmenu", onContextMenu);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [sharedBallsRef, resetSignalRef, sharedPointerRef, scoreLineRef, onScore, theme]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-20 size-full cursor-crosshair"
      aria-label="Interactive physics playground"
    />
  );
}
