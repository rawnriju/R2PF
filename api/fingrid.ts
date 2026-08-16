import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getFingridSnapshot } from "./_fingrid-data";

/**
 * Proxies Fingrid's open-data REST API server-side so the API key never
 * ships in the client bundle (their CORS preflight also doesn't grant
 * browsers permission to call it directly — see getFingridSnapshot's
 * callers). Fingrid updates real-time datasets every 3 minutes, so the
 * Cache-Control header below lets Vercel's edge cache absorb anything
 * faster than that instead of spending the 10k req/24h key allowance.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.FINGRID_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "FINGRID_API_KEY is not configured on the server" });
    return;
  }

  try {
    const snapshot = await getFingridSnapshot(apiKey);
    res.setHeader("Cache-Control", "s-maxage=180, stale-while-revalidate=600");
    res.status(200).json(snapshot);
  } catch (err) {
    res.status(502).json({
      error: "Failed to fetch Fingrid data",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
}
