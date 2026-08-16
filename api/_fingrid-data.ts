/**
 * Shared Fingrid open-data fetch logic — imported by both the production
 * Vercel function (api/fingrid.ts) and the Vite dev-server middleware
 * (vite.config.ts) so local dev exercises the exact same code path as
 * production instead of a parallel reimplementation.
 * See https://data.fingrid.fi/en/instructions
 */

const FINGRID_BASE = "https://data.fingrid.fi/api";
// https://data.fingrid.fi/en/datasets/192 — Electricity production in Finland
const PRODUCTION_DATASET_ID = 192;
// https://data.fingrid.fi/en/datasets/193 — Electricity consumption in Finland
const CONSUMPTION_DATASET_ID = 193;
const WINDOW_HOURS = 24;

interface FingridDataPoint {
  datasetId: number;
  startTime: string;
  endTime: string;
  value: number;
}

interface FingridDataResponse {
  data: FingridDataPoint[];
}

export interface FingridSnapshot {
  updatedAt: string;
  production: { time: string; value: number }[];
  consumption: { time: string; value: number }[];
}

async function fetchDataset(
  datasetId: number,
  apiKey: string,
  startTime: string,
  endTime: string,
): Promise<FingridDataPoint[]> {
  const url = new URL(`${FINGRID_BASE}/datasets/${datasetId}/data`);
  url.searchParams.set("startTime", startTime);
  url.searchParams.set("endTime", endTime);
  url.searchParams.set("format", "json");
  url.searchParams.set("pageSize", "2000");
  url.searchParams.set("sortOrder", "asc");

  const res = await fetch(url, { headers: { "x-api-key": apiKey } });
  if (!res.ok) {
    throw new Error(`dataset ${datasetId} request failed with status ${res.status}`);
  }
  const body = (await res.json()) as FingridDataResponse;
  return body.data ?? [];
}

export async function getFingridSnapshot(apiKey: string): Promise<FingridSnapshot> {
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - WINDOW_HOURS * 60 * 60 * 1000);

  const [production, consumption] = await Promise.all([
    fetchDataset(PRODUCTION_DATASET_ID, apiKey, startTime.toISOString(), endTime.toISOString()),
    fetchDataset(CONSUMPTION_DATASET_ID, apiKey, startTime.toISOString(), endTime.toISOString()),
  ]);

  return {
    updatedAt: new Date().toISOString(),
    production: production.map((d) => ({ time: d.startTime, value: d.value })),
    consumption: consumption.map((d) => ({ time: d.startTime, value: d.value })),
  };
}
