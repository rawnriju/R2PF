import { useEffect, useRef, useState } from "react";
import fallback from "../../content/playground/finland-grid-fallback.json";

export interface FingridPoint {
  time: string;
  value: number;
}

export interface FingridSnapshot {
  updatedAt: string;
  production: FingridPoint[];
  consumption: FingridPoint[];
}

// Matches Fingrid's own real-time refresh cadence (data.fingrid.fi updates
// these datasets every 3 minutes), so polling faster would just re-fetch
// the same values.
const POLL_MS = 3 * 60 * 1000;

/**
 * Polls the /api/fingrid proxy (which holds the real Fingrid API key
 * server-side) for Finland's live production/consumption data. Starts
 * from — and falls back to on any error — the bundled static snapshot, so
 * the chart this feeds is never empty even if the API key isn't
 * configured (e.g. local dev without `vercel dev`) or the upstream call
 * fails.
 */
export function useFingrid() {
  const [data, setData] = useState<FingridSnapshot>(fallback as FingridSnapshot);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setTimeout>;

    const load = async () => {
      try {
        const res = await fetch("/api/fingrid");
        if (!res.ok) throw new Error(`status ${res.status}`);
        const json = (await res.json()) as FingridSnapshot;
        if (!mounted) return;
        setData(json);
        setIsLive(true);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        setIsLive(false);
        setError(err instanceof Error ? err.message : "Failed to load live data");
      } finally {
        if (mounted) timer = setTimeout(load, POLL_MS);
      }
    };

    load();
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  return { data, isLive, error } as const;
}
