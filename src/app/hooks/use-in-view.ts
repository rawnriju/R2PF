import { useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  /** Shrinks/grows the viewport box IntersectionObserver tests against. */
  rootMargin?: string;
  threshold?: number;
  /** Unobserve after the first reveal — a one-shot entrance effect rather
      than a continuous scroll-linked toggle. */
  once?: boolean;
}

/** IntersectionObserver-backed "has this scrolled into view yet" hook. Skips
    the observer entirely under prefers-reduced-motion and reports inView
    immediately, matching the reduced-motion checks already in about.css and
    scroll-dial.tsx. */
export function useInView<T extends Element = HTMLDivElement>({
  rootMargin = "0px 0px -10% 0px",
  threshold = 0.12,
  once = true,
}: UseInViewOptions = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.unobserve(el);
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, threshold, once]);

  return { ref, inView } as const;
}
