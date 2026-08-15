import { useEffect, useRef } from "react";
import "./cursor-glow.css";

/** Fixed, very-low-opacity brand-colored glow that follows the pointer
    across the whole site. Desktop-only (fine pointer) and off entirely
    under prefers-reduced-motion — both checked here (skips attaching the
    listener at all) and in cursor-glow.css (display: none fallback),
    matching the belt-and-suspenders pattern used elsewhere for motion
    (see about.tsx / scroll-dial.tsx). Position is written straight to the
    DOM per rAF-throttled pointermove frame rather than through React
    state, so moving the mouse never triggers a re-render. */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let ticking = false;

    const paint = () => {
      ticking = false;
      el.style.setProperty("--glow-x", `${x}px`);
      el.style.setProperty("--glow-y", `${y}px`);
    };
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      el.style.setProperty("--glow-opacity", "1");
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(paint);
    };
    // pointerleave/pointerenter on document (not the glow element itself,
    // which has pointer-events: none) fire when the cursor actually leaves
    // or re-enters the browser viewport.
    const onLeave = () => el.style.setProperty("--glow-opacity", "0");
    const onEnter = () => el.style.setProperty("--glow-opacity", "1");

    // Hidden until the first real pointer position arrives, so it doesn't
    // flash at the center of the screen on load before the cursor moves.
    el.style.setProperty("--glow-opacity", "0");
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
    };
  }, []);

  return <div ref={ref} className="cursor-glow" aria-hidden="true" />;
}
